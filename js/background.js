function updateCoinList() {
    // Get currency to display
    chrome.storage.sync.get({"currency": "USD"}, (storedCurrency) => {
        var currency = storedCurrency["currency"];
        console.log('Updating with ' + currency);

        const cmcBaseUrl = 'https://api.coinmarketcap.com/v1';
        // Set URL to get information from
        var coinURL = cmcBaseUrl + '/ticker/?limit=0';
        if (currency != "USD") {
            coinURL += '&convert=' + currency;
        }

        // Get data from coinmarketcap
        fetch(coinURL)
        .then((response) => response.json())
        .then((data) => {
            // Store data from coinmarketcap
            chrome.storage.local.set({'coins': data});
        })
        .catch((error) => {
            console.log(error);
        });  
    });
}

setInterval(() => {
    updateCoinList();
}, 10000);