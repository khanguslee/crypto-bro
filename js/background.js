const cmcBaseUrl = 'https://api.coinmarketcap.com/v1';

function updateCoinList() {
    // Get currency to display
    chrome.storage.sync.get({"currency": "USD"}, (storedCurrency) => {
        var currency = storedCurrency.currency;
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
            console.error(error);
        });  
    });
}

function checkAlerts() {
    /*
        Will check if user needs to be alerted about the price
    */
    // Get stored alert options for each coin
    const defaultJsonValue = {'coinOptions':{'bitcoin': {"alert": {}}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        var coinList = result.coinOptions;
        // Get coin data stored locally 
        chrome.storage.local.get({'coins': {}}, (result) => {
            let coinValueList = result.coins;
            for(let coin in coinValueList) {
                // If the user has set some options for the coin in the list
                if (coinValueList[coin].id in coinList)
                {
                    let coinOptions = coinList[coinValueList[coin].id];
                    // Check if user has displayed the coin
                    if (!coinOptions.display) {
                        continue;
                    }
                    // Check if we have set some alert options
                    if (!('alert' in coinOptions)) {
                        continue;
                    } 
                    // Check if alert is empty
                    if (coinOptions.alert == "" || coinOptions.alert == {}) {
                        continue;
                    }
                    // Either USD or BTC
                    let coinCurrency = coinOptions.alert.currency;
                    let coinMinAmount = parseInt(coinOptions.alert.minAmount, 10);
                    let coinMaxAmount = parseInt(coinOptions.alert.maxAmount, 10);
                    let priceString = 'price_' + coinCurrency.toLowerCase();
                    let currentCoinPrice = coinValueList[coin][priceString];
                    if ((coinMinAmount != '') && (currentCoinPrice < coinMinAmount)) {
                        let notificationMessage = {
                            type: 'basic', 
                            iconUrl: '../icon_128.png', 
                            title: coinValueList[coin].name + ' Alert', 
                            message: 'Minimum amount reached.\n' + coinValueList[coin].name + ' is now ' + currentCoinPrice + ' ' + coinCurrency
                        };
                        chrome.notifications.create("minimum-amount-reached", notificationMessage);
                    }

                    if ((coinMaxAmount != '') && (currentCoinPrice > coinMaxAmount)) {
                        let notificationMessage = {
                            type: 'basic', 
                            iconUrl: '../icon_128.png', 
                            title: coinValueList[coin].name + ' Alert', 
                            message: 'Maximum amount reached.\n' + coinValueList[coin].name + ' is now ' + currentCoinPrice + ' ' + coinCurrency
                        };
                        chrome.notifications.create("maximum-amount-reached", notificationMessage);
                    }
                }
            }
        });
    });
}

setInterval(() => {
    updateCoinList();
    checkAlerts();
}, 10000);