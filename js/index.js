document.addEventListener('DOMContentLoaded', function() {
    initialiseApp();
});

const cmcBaseUrl = 'https://api.coinmarketcap.com/v1';

function changeUserAmount(value) {
    console.log(value);
}

function initialiseApp() {
    const defaultJsonValue = {'coins':{'bitcoin': {"display": true}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        var coinList = result['coins'];
        var cryptoDiv = document.getElementById('crypto-container');
        cryptoDiv.addEventListener("click", changeUserAmount);

        // Get currency to display
        chrome.storage.sync.get({"currency": "USD"}, (result) => {
            var selectedCurrency = result["currency"];
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
                    var coinEntry = document.createElement('div');
                    coinEntry.setAttribute('id', 'crypto-entry');
    
                    // Add in name paragraph
                    let coinNameElement = document.createElement('p');
                    let coinNameValue = document.createTextNode(data[0].name + ' ' + data[0].symbol);
                    coinNameElement.appendChild(coinNameValue);
                    coinEntry.appendChild(coinNameElement);
    
                    // Add in price paragraph
                    let coinPriceElement = document.createElement('p');
                    coinPriceElement.setAttribute('id', 'crypto-price');
                    let coinPriceValue = document.createTextNode('Price: '+ selectedCurrency + '$' + data[0]['price_' + selectedCurrency.toLowerCase()]);
                    coinPriceElement.appendChild(coinPriceValue); 
                    coinEntry.appendChild(coinPriceElement);
                    
                    cryptoDiv.appendChild(coinEntry);
                });  
            }
        })
    });
    

}