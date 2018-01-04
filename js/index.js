var totalAmountHolding = 0, totalPrevAmountHolding = 0;

initialiseApp();

function updateCoin(currency, coin , coinAmount){
    const cmcBaseUrl = 'https://api.coinmarketcap.com/v1';

    // Set URL to get information from
    var coinURL = cmcBaseUrl + '/ticker/' + coin + '/';
    if (currency != "USD") {
        coinURL += '?convert=' + currency;
    }

    fetch(coinURL)
    .then((response) => response.json())
    .then((data) => {
        let coinID = data[0].id;
        let coinName = data[0].name;
        let coinSymbol = data[0].symbol;

        // Name of coin
        let coinNameElement = document.getElementById('name-' + coinID);
        let coinNameValue = document.createTextNode(coinName + ' ' + coinSymbol);
        if (coinNameElement.childNodes[0]) {
            coinNameElement.removeChild(coinNameElement.childNodes[0]);
        }
        coinNameElement.appendChild(coinNameValue);

        // Price of coin
        let coinPrice = parseFloat(data[0]['price_' + currency.toLowerCase()]).toPrecision(5);
        let coinPriceElement = document.getElementById('price-' + coinID);
        let coinPriceValue = document.createTextNode(coinPrice);
        if (coinPriceElement.childNodes[0]) {
            coinPriceElement.removeChild(coinPriceElement.childNodes[0]);
        }
        coinPriceElement.appendChild(coinPriceValue);

        // Percentage change of coin
        let coinPercentageElement = document.getElementById('percentage-' + coinID);
        var coinPercentage = data[0].percent_change_24h;
        coinPercentageElement.style.color = coinPercentage[0] === "-" ? "#e60000" : "#00e600";
        let coinPercentageText = document.createTextNode(coinPercentage + "%");
        if (coinPercentageElement.childNodes[0]) {
            coinPercentageElement.removeChild(coinNameElement.childNodes[0]);
        }
        coinPercentageElement.appendChild(coinPercentageText);

        // User held value
        if (coinAmount) {
            let coinHoldingsElement = document.getElementById('holdings-' + coinID);
            let coinPrice = data[0]['price_' + currency.toLowerCase()];
            let coinHoldingsAmount = coinAmount * coinPrice;
            let coinHoldingsText = document.createTextNode(currency + '$' + coinHoldingsAmount.toFixed(2));
            if (coinHoldingsElement.childNodes[0]) {
                coinHoldingsElement.removeChild(coinHoldingsElement.childNodes[0]);
            }
            coinHoldingsElement.appendChild(coinHoldingsText);

            // Get sum of all holdings
            totalAmountHolding += coinHoldingsAmount;
            // Get sum of previous amount user was holding
            totalPrevAmountHolding += coinHoldingsAmount / (1+(coinPercentage/100));  
        }

        // Show total amount that user is holding
        if (totalAmountHolding)
        {
            document.getElementById("crypto-total").style.display = 'flex';
            document.getElementById("crypto-amount-text").innerHTML = totalAmountHolding.toFixed(2);
            let totalAmountPercent = (totalAmountHolding - totalPrevAmountHolding)/totalPrevAmountHolding;
            totalAmountPercent *= 100;
            document.getElementById("crypto-amount-change").style.color = totalAmountPercent[0] === "-" ? "#e60000" : "#00e600"
            document.getElementById("crypto-amount-change-text").innerHTML = totalAmountPercent.toFixed(2);
        }
    })
    .catch((error) => {
        console.log(error);
    });  
}

function initialiseApp() {
    const defaultJsonValue = {'coins':{'bitcoin': {"display": true}}};
    chrome.storage.sync.get(defaultJsonValue, (storedCoinList) => {
        var coinList = storedCoinList['coins'];
        var cryptoDiv = document.getElementById('crypto-container');

        // Get currency to display
        chrome.storage.sync.get({"currency": "USD"}, (storedCurrency) => {
            var selectedCurrency = storedCurrency["currency"];

            for (var coin in coinList) {
                // Check if user has selected the coin
                if (!coinList[coin]["display"]) {
                    continue;
                }
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
                let coinNameSpan = document.createElement('span');
                coinNameSpan.id = 'name-' + coin;
                let coinNameValue = document.createTextNode(coin);
                coinNameSpan.appendChild(coinNameValue);
                coinNameElement.appendChild(coinNameSpan);
                cryptoMainDiv.appendChild(coinNameElement);
                cryptoEntry.appendChild(cryptoMainDiv);

                // Add in price paragraph
                let coinPriceElement = document.createElement('p');
                coinPriceElement.setAttribute('class', 'crypto-price');
                let coinPriceValue = document.createTextNode(selectedCurrency + '$');
                coinPriceElement.appendChild(coinPriceValue); 
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

                /* Update the prices and details for each coin */
                if ('value' in coinList[coin] & coinList[coin] != 0) {
                    updateCoin(selectedCurrency, coin, parseFloat(coinList[coin]['value']));
                } else {
                    updateCoin(selectedCurrency, coin, 0);
                }
                cryptoEntry.appendChild(cryptoSecondaryDiv);
                cryptoDiv.appendChild(cryptoEntry);
            }
        })
    });
    

}