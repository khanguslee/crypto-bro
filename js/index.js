document.addEventListener('DOMContentLoaded', function() {
    initialiseApp();
});

const cmcBaseUrl = 'https://api.coinmarketcap.com/v1';

function initialiseApp() {
    chrome.storage.sync.get({'coins':{'bitcoin': true}}, (result) => {
        var coinList = result['coins'];
        console.log(coinList);
        var cryptoDiv = document.getElementById('crypto-container');
        for (var key in coinList) {
            console.log(coinList[key]);
            // Check if user has selected the coin
            if (!coinList[key]) {
                continue;
            }
            console.log(key);
            // Get information about coin
            fetch(cmcBaseUrl + '/ticker/' + key + '/')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                // Create outer div to store the coin entry
                var coinEntry = document.createElement('div');
                coinEntry.setAttribute('id', 'crypto-entry');

                // Add in name paragraph
                let coinNameElement = document.createElement('p');
                let coinNameValue = document.createTextNode("Name: " + data[0].name);
                coinNameElement.appendChild(coinNameValue);
                coinEntry.appendChild(coinNameElement);

                // Add in price paragraph
                let coinPriceElement = document.createElement('p');
                coinPriceElement.setAttribute('id', 'crypto-price');
                let coinPriceValue = document.createTextNode('Price: $' + data[0].price_usd);
                coinPriceElement.appendChild(coinPriceValue); 
                coinEntry.appendChild(coinPriceElement);
                
                cryptoDiv.appendChild(coinEntry);
            });  
        }
    });
    

}