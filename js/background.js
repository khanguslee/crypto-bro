function updateCoinList() {
    // Get currency to display
    chrome.storage.sync.get({"currency": "USD"}, (storedCurrency) => {
        var currency = storedCurrency["currency"];

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
            var coinList = {};
            for (let i=0; i<data.length; i++) {
                coinList[data[i].id] = data[i];
            }
            // Store data from coinmarketcap
            chrome.storage.sync.set({'coins':coinList});
        })
        .catch((error) => {
            console.log(error);
        });  
    });
}

setInterval(() => {
    updateCoinList();
}, 4000);