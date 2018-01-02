document.addEventListener('DOMContentLoaded', function() {
    initialiseApp();
});

const cmcBaseUrl = 'https://api.coinmarketcap.com/v1';

function initialiseApp() {
    const defaultJsonValue = {'coins':{'bitcoin': {"display": true}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        var coinList = result['coins'];
        var cryptoDiv = document.getElementById('crypto-container');

        // Get currency to display
        chrome.storage.sync.get({"currency": "USD"}, (result) => {
            var selectedCurrency = result["currency"];
            var totalAmountHolding = 0;
            for (var key in coinList) {
                // Check if user has selected the coin
                if (!coinList[key]["display"]) {
                    continue;
                }

                // Set URL to get information from
                var coinURL = cmcBaseUrl + '/ticker/' + key + '/';
                if (selectedCurrency != "USD") {
                    coinURL += '?convert=' + selectedCurrency;
                }

                // Get information about coin
                fetch(coinURL)
                .then((response) => response.json())
                .then((data) => {
                    // Create outer div to store the coin entry
                    let cryptoEntry = document.createElement('div');
                    cryptoEntry.setAttribute('class', 'crypto-entry');
                    cryptoEntry.setAttribute('id', data[0].id);

                    // Create div that contains name and price of crypto entry
                    let cryptoMain = document.createElement('div');
                    cryptoMain.setAttribute('class', 'crypto-main');

                    // Add in name paragraph
                    let coinNameElement = document.createElement('p');
                    let coinNameValue = document.createTextNode(data[0].name + ' ' + data[0].symbol);
                    coinNameElement.appendChild(coinNameValue);
                    cryptoMain.appendChild(coinNameElement);
                    cryptoEntry.appendChild(cryptoMain);

                    // Add in price paragraph
                    let coinPriceElement = document.createElement('p');
                    coinPriceElement.setAttribute('class', 'crypto-price');
                    let coinPrice = parseFloat(data[0]['price_' + selectedCurrency.toLowerCase()]).toPrecision(5);
                    let coinPriceValue = document.createTextNode(selectedCurrency + '$' + coinPrice);
                    coinPriceElement.appendChild(coinPriceValue); 
                    cryptoMain.appendChild(coinPriceElement);
                    cryptoEntry.appendChild(cryptoMain);
                    
                    // Add in amount that user holds
                    let coinHoldingsElement = document.createElement('p');
                    coinHoldingsElement.setAttribute('class', 'crypto-holdings');
                    chrome.storage.sync.get(defaultJsonValue, (result) => {
                        var coinHoldingsValue = data[0]['price_' + selectedCurrency.toLowerCase()];
                        var coinList = result["coins"];

                        // If user has specified that they hold this coin
                        if ('value' in coinList[data[0].id] & coinList[data[0].id] != 0) {
                            var coinHoldingsAmount = parseFloat(coinList[data[0].id]['value']);
                            coinHoldingsValue *= coinHoldingsAmount;
                            let coinHoldingsValueText = document.createTextNode('Total: ' + selectedCurrency + '$' + coinHoldingsValue.toFixed(2));
                            
                            // Get sum of all holdings
                            totalAmountHolding += coinHoldingsValue;
                            
                            coinHoldingsElement.appendChild(coinHoldingsValueText);
                            cryptoEntry.appendChild(coinHoldingsElement);
                        }

                        // Show total amount that user is holding
                        if (totalAmountHolding)
                        {
                            document.getElementById("crypto-amount").style.display = 'block';
                            document.getElementById("crypto-amount-text").innerHTML = totalAmountHolding.toFixed(2);
                        }

                        cryptoDiv.appendChild(cryptoEntry);
                    });
                })
                .catch((error) => {
                    console.log(error);
                });  
            }
        })
    });
    

}