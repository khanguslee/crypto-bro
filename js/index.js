var totalAmountHolding = 0, totalPrevAmountHolding = 0;
document.addEventListener("DOMContentLoaded", () => {
    // Update coin data everytime app is opened
    let backgroundPage = chrome.extension.getBackgroundPage();
    backgroundPage.updateCoinList();
    // Display coin data 
    initialiseApp();
});

function updateCoin(currency, percentChange, coin , coinAmount, alertCoin){
    chrome.storage.local.get({'coins':[]}, (storedList) => {
        var coinList = storedList.coins;
        // Find the index of the coin within the stored coin list
        for (var i=0; i<coinList.length; i++) {
            if (coinList[i].id == coin)
            {
                break;
            }
        }
        let coinEntry = coinList[i];
        let coinID = coinEntry.id;
        let coinName = coinEntry.name;
        let coinSymbol = coinEntry.symbol;

        // Name of coin
        let coinNameElement = document.getElementById('name-' + coinID);
        let coinNameValue = document.createTextNode(coinName + ' ' + coinSymbol);
        if (coinNameElement.childNodes[0]) {
            coinNameElement.removeChild(coinNameElement.childNodes[0]);
        }
        coinNameElement.appendChild(coinNameValue);

        // Add Alert icon
        if (alertCoin) {
            let alertIcon = document.createElement('i');
            alertIcon.className = 'far fa-bell';
            coinNameElement.appendChild(alertIcon);
        }
        
        // Price of coin
        let coinPrice = parseFloat(coinEntry['price_' + currency.toLowerCase()]).toPrecision(5);
        let coinPriceElement = document.getElementById('price-' + coinID);
        let coinPriceValue = document.createTextNode(coinPrice);
        if (coinPriceElement.childNodes[0]) {
            coinPriceElement.removeChild(coinPriceElement.childNodes[0]);
        }
        coinPriceElement.appendChild(coinPriceValue);
        // Percentage change of coin
        let coinPercentageElement = document.getElementById('percentage-' + coinID);
        var coinPercentage = '';
        switch(percentChange) {
            case "1 Hour":
                coinPercentage = coinEntry.percent_change_1h;
                break;
            case "24 Hour":
                coinPercentage = coinEntry.percent_change_24h;
                break;
            case "7 Days":
                coinPercentage = coinEntry.percent_change_7d;
                break;
            default:
                coinPercentage = coinEntry.percent_change_24h;
        }
        coinPercentageElement.style.color = coinPercentage[0] === "-" ? "#e60000" : "#00e600";
        let coinPercentageText = document.createTextNode(coinPercentage + "%");
        // Add arrow icon
        let arrowChange = document.createElement('i');
        arrowChange.className = coinPercentage[0] === '-' ? "arrow fas fa-angle-down" : "arrow fas fa-angle-up";
        
        if (coinPercentageElement.childNodes[0]) {
            coinPercentageElement.removeChild(coinNameElement.childNodes[0]);
        }
        coinPercentageElement.appendChild(coinPercentageText);
        coinPercentageElement.insertBefore(arrowChange, coinPercentageText);

        // User held value
        if (coinAmount) {
            let coinHoldingsElement = document.getElementById('holdings-' + coinID);
            let coinPrice = coinEntry['price_' + currency.toLowerCase()];
            let coinHoldingsAmount = coinAmount * coinPrice;
            let numberOfDecimalPlaces = currency == 'BTC' ? 6 : 2;
            if (coinHoldingsElement.childNodes[0]) {
                coinHoldingsElement.removeChild(coinHoldingsElement.childNodes[0]);
            }
            // Check currency symbol
            var coinHoldingsText;
            if (currency == 'BTC') {
                coinHoldingsText = document.createTextNode(coinHoldingsAmount.toFixed(numberOfDecimalPlaces));
                let bitcoinSymbol = document.createElement('i');
                bitcoinSymbol.className = 'fab fa-btc btc-symbol';
                coinHoldingsElement.appendChild(bitcoinSymbol);
            } else {
                coinHoldingsText = document.createTextNode(currency + '$' + coinHoldingsAmount.toFixed(numberOfDecimalPlaces));
            }
            coinHoldingsElement.appendChild(coinHoldingsText);

            // Get sum of all holdings
            totalAmountHolding += coinHoldingsAmount;
            // Get sum of previous amount user was holding
            totalPrevAmountHolding += coinHoldingsAmount / (1+(coinPercentage/100));  
            // Show total amount that user is holding
            if (totalAmountHolding)
            {
                document.getElementById("crypto-total").style.display = 'flex';
                document.getElementById("crypto-header").style.display = 'flex';
                // Set the portfolio amount text
                let portfolioTotalElement = document.getElementById("crypto-amount-text");
                portfolioTotalElement.innerHTML = totalAmountHolding.toFixed(numberOfDecimalPlaces);
                // Work out the percentage change
                let totalAmountPercent = (totalAmountHolding - totalPrevAmountHolding)/totalPrevAmountHolding;
                totalAmountPercent *= 100;
                // Change colour to red or green
                let portfolioChangeElement = document.getElementById('crypto-amount-change');
                portfolioChangeElement.style.color = totalAmountPercent < 0.00 ? "#e60000" : "#00e600";
                // Set percentage change text
                let portfolioPercentageChange = document.getElementById("crypto-amount-change-text");
                portfolioPercentageChange.innerHTML = totalAmountPercent.toFixed(2);

                // Remove existing arrow icon
                var portfolioArrowChangeElement = document.getElementById('portfolio-arrow');
                if (portfolioArrowChangeElement != null){
                    portfolioArrowChangeElement.parentNode.removeChild(portfolioArrowChangeElement);
                }
                // Create arrow element
                portfolioArrowChangeElement = document.createElement('i');
                portfolioArrowChangeElement.id = 'portfolio-arrow';
                portfolioArrowChangeElement.className = totalAmountPercent < 0.00 ? "arrow fas fa-angle-down" : "arrow fas fa-angle-up";
                portfolioChangeElement.insertBefore(portfolioArrowChangeElement, portfolioPercentageChange);
            }
        }
    });
}

function initialiseApp() {
    const defaultJsonValue = {'coinOptions':{'bitcoin': {"display": true}}};
    chrome.storage.sync.get(defaultJsonValue, (storedCoinList) => {
        var coinList = storedCoinList.coinOptions;
        var cryptoDiv = document.getElementById('crypto-container');

        let amountChangeLabelText = document.getElementById('crypto-amount-change-label');
        amountChangeLabelText.addEventListener('click', togglePercentChange);

        // Get user stored options
        chrome.storage.sync.get({"options" : {"currency": "USD", "percentChange": "24 Hour"}}, (result) => {
            let storedOptions = result.options;

            // Set Currency options 
            const coinURLStart = 'https://coinmarketcap.com/currencies/';
            var selectedCurrency = storedOptions.currency;
            var coinSelectedFlag = false;

            // If no currency selected, default to USD (This might occur on initial start up)
            if (selectedCurrency == "") {
                selectedCurrency = "USD";
            }
            // Check currency symbol
            if (selectedCurrency == 'BTC') {
                let bitcoinSymbol = document.createElement('i');
                bitcoinSymbol.className = 'fab fa-btc btc-symbol';
                let portfolioAmount = document.getElementById('crypto-amount');
                let portfolioAmountText = document.getElementById('crypto-amount-text');
                portfolioAmount.insertBefore(bitcoinSymbol, portfolioAmountText);
            } else {
                let portfolioCurrency = document.getElementById('crypto-currency');
                portfolioCurrency.innerHTML = selectedCurrency + '$';
            }

            // Set percent change options
            var selectedPercentChange = storedOptions.percentChange;
            let percentChangeText = document.getElementById('crypto-total-percent-change');
            switch(selectedPercentChange) {
                case "1 Hour":
                    percentChangeText.innerHTML = '1hr % Change';
                    break;
                case "24 Hour":
                    percentChangeText.innerHTML = '24hr % Change';
                    break;
                case "7 Days":
                    percentChangeText.innerHTML = '7 Day % Change';
                    break;
                default:
                    percentChangeText.innerHTML = '24hr % Change';
            }
            
            for (var coin in coinList) {
                // Check if user has selected the coin
                if (!coinList[coin].display) {
                    continue;
                }
                coinSelectedFlag = true;
                /* Create the html elements */
                // Create outer div to store the coin entry
                let cryptoEntry = document.createElement('div');
                cryptoEntry.setAttribute('class', 'crypto-entry');
                cryptoEntry.setAttribute('id', coin);

                // Create div that contains name and price of crypto entry
                let cryptoMainDiv = document.createElement('div');
                cryptoMainDiv.setAttribute('class', 'crypto-main');

                // Add in name paragraph
                let coinNameElement = document.createElement('p');
                coinNameElement.setAttribute('class', 'crypto-name');
                // Create anchor to the coin;'s coinmarketcap page
                let coinLinkElement = document.createElement('a');
                coinLinkElement.href = coinURLStart + '/' + coin;
                coinLinkElement.target = '_blank';
                // Create span to store name and symbol
                let coinNameSpan = document.createElement('span');
                coinNameSpan.id = 'name-' + coin;
                let coinNameValue = document.createTextNode(coin);
                coinNameSpan.appendChild(coinNameValue);
                coinLinkElement.appendChild(coinNameSpan);
                coinNameElement.appendChild(coinLinkElement);
                cryptoMainDiv.appendChild(coinNameElement);
                cryptoEntry.appendChild(cryptoMainDiv);

                // Add in price paragraph
                let coinPriceElement = document.createElement('p');
                coinPriceElement.setAttribute('class', 'crypto-price');
                // Add in bitcoin symbol instead of $
                if (selectedCurrency == 'BTC') {
                    let currencyType = document.createElement('i');
                    currencyType.className = 'fab fa-btc btc-symbol';
                    coinPriceElement.appendChild(currencyType);
                } else {
                    let currencyType = document.createTextNode(selectedCurrency + '$');
                    coinPriceElement.appendChild(currencyType); 
                }
                let coinPriceSpan = document.createElement('span');
                coinPriceSpan.id = 'price-' + coin;
                coinPriceElement.appendChild(coinPriceSpan);
                cryptoMainDiv.appendChild(coinPriceElement);
                cryptoEntry.appendChild(cryptoMainDiv);

                // Create secondary div to hold user holdings and change in %
                let cryptoSecondaryDiv = document.createElement('div');
                cryptoSecondaryDiv.setAttribute('class', 'crypto-secondary');

                // Add in coin percentage change
                let coinPercentageElement = document.createElement('p');
                coinPercentageElement.setAttribute('class', 'crypto-percentage');
                let coinPercentageSpan = document.createElement('span');
                coinPercentageSpan.id = 'percentage-' + coin;                
                coinPercentageElement.appendChild(coinPercentageSpan);
                cryptoSecondaryDiv.appendChild(coinPercentageElement);

                // Add in amount that user holds
                let coinHoldingsElement = document.createElement('p');
                coinHoldingsElement.setAttribute('class', 'crypto-holdings');
                let coinHoldingsSpan = document.createElement('span');
                coinHoldingsSpan.id = 'holdings-' + coin;
                coinHoldingsElement.appendChild(coinHoldingsSpan);
                cryptoSecondaryDiv.appendChild(coinHoldingsElement);

                let alertCoin = false;
                // Check if user has set alert for this coin
                if ('alert' in coinList[coin]) {
                    // Check if alert is empty
                    if (coinList[coin].alert != "" && coinList[coin].alert != {}) {
                        alertCoin = true;
                    } 
                } 
                
                /* Update the prices and details for each coin */
                if ('value' in coinList[coin] & coinList[coin] != 0) {
                    updateCoin(selectedCurrency, selectedPercentChange, coin, parseFloat(coinList[coin].value), alertCoin);
                } else {
                    updateCoin(selectedCurrency, selectedPercentChange, coin, 0, alertCoin);
                }
                cryptoEntry.appendChild(cryptoSecondaryDiv);
                cryptoDiv.appendChild(cryptoEntry);
            }

            // Check if user has selected a single coin
            if (!(coinSelectedFlag)) {
                // Display text if user has not selected anything
                let noCoinText = document.createElement('p');
                noCoinText.id = 'no-coins-selected';
                let noCoinTextValue = document.createTextNode('No coins selected');
                noCoinText.appendChild(noCoinTextValue);
                cryptoDiv.appendChild(noCoinText);

                // Display button to open options menu
                let openOptionButton = document.createElement('button');
                openOptionButton.textContent = 'Click here to select coins';
                openOptionButton.id = 'open-options-button';
                openOptionButton.addEventListener('click', openOptionPage);
                cryptoDiv.appendChild(openOptionButton);
            }
        });
    });
}

function openOptionPage() {
    // Open up options.html in chrome://extensions
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('html/options.html'));
    }
}

function togglePercentChange() {
    chrome.storage.sync.get({"options": {"percentChange": "24 Hour", "currency": "USD"}}, (result) => {
        let storedOptions = result.options;
    });
}