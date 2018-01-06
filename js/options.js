document.addEventListener('DOMContentLoaded', function() {
    displayCurrencyOption();
    displayAllCoins();
    enableSearchBar();
});

const cmcBaseUrl = 'https://api.coinmarketcap.com/v1';

function displayCurrencyOption() {
    // Displays list of valid currencies that can be displayed
    let selectCurrencyElement = document.getElementById("currency-option-list");
    selectCurrencyElement.addEventListener("change", changeCurrency);
    const currencyList = ["USD", "AUD", "BRL", "CAD", "CHF", "CLP", "CNY", 
                            "CZK", "DKK", "EUR", "GBP", "HKD", 
                            "HUF", "IDR", "ILS", "INR", "JPY", 
                            "KRW", "MXN", "MYR", "NOK", "NZD", 
                            "PHP", "PKR", "PLN", "RUB", "SEK", 
                            "SGD", "THB", "TRY", "TWD", "ZAR"];
    // Display user selected currency
    var currencyOption = "";
    chrome.storage.sync.get({"currency": "USD"}, (result) => {
        var defaultCurrency = result["currency"];
        for (index in currencyList) {
            if (currencyList[index] == defaultCurrency) {
                currencyOption += "<option selected='selected'>" + currencyList[index] + "</option>";
            } else {
                currencyOption += "<option>" + currencyList[index] + "</option>";
            }
        }
        selectCurrencyElement.innerHTML = currencyOption;
        selectCurrencyElement.selectedIndex
    })
}

function changeCurrency(selectedCurrency) {
    // Change the selected displayed currency
    chrome.storage.sync.set({"currency": selectedCurrency.target.value}, () => {
        chrome.extension.getBackgroundPage((backgroundPage) => {
            backgroundPage.updateCoinList();
        });
        console.log("Currency set as " + selectedCurrency.target.value);
    });
}

function syncCheckboxes() {
    // Tick checkboxes that user has already set
    const defaultJsonValue = {'coinOptions':{'bitcoin': {"display": true}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        var coinList = result["coinOptions"];
        for (var key in coinList) {
            let isChecked = coinList[key]['display'];
            document.getElementById("cb-" + key).checked = isChecked;
        }
    })
}

function syncTextboxes() {
    // Set textboxes that user has already set
    const defaultJsonValue = {'coinOptions':{'bitcoin': {"value": 1}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        var coinList = result["coinOptions"];
        for (var key in coinList) {
            let isChecked = coinList[key]['display'];
            userValue = coinList[key]['value'];

            let coinTextbox = document.getElementById('tb-' + key);
            // Show/Hide textbox is checkbox checked/unchecked
            coinTextbox.style.display = isChecked ? 'inline' : 'none';
            coinTextbox.value = userValue;
        }
    })
}

function editUserCoinAmount(event) {
    // Updates amount of coins user has of the chosen coin
    var userInputCoinAmount = this.valueAsNumber
    var coinName = this.id.substr(3);
    var coinList;

    const defaultJsonValue = {'coinOptions':{'bitcoin': {"display": true}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        coinList = result["coinOptions"];
        coinList[coinName]['value'] = userInputCoinAmount;
        chrome.storage.sync.set({'coinOptions': coinList}, () => {
            console.log("Coin value saved!");
        });
    });
}

function createCoinOptionList(coinList) {
    let coinListElement = document.getElementById('coin-option-list')
    coinListElement.innerHTML = ''
    for (let i=0; i<coinList.length; i++)
    {
        let coinDetails = coinList[i];
        let newCoinEntry = document.createElement('li');
        newCoinEntry.className = 'coin-entry';
        newCoinEntry.id = coinDetails.symbol + '-' + coinDetails.id;
        // Add check box
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'cb-' + coinDetails.id;
        checkbox.addEventListener('click', updateList);
        newCoinEntry.appendChild(checkbox);

        // Add coin name text
        let coinNameTextElement = document.createElement('p');
        let coinNameText = document.createTextNode(coinDetails.name)
        coinNameTextElement.appendChild(coinNameText);
        newCoinEntry.appendChild(coinNameTextElement);

        // Add input box
        let inputUserCoinAmount = document.createElement('input');
        inputUserCoinAmount.type = 'number';
        inputUserCoinAmount.className = 'input-user-coin-amount';
        inputUserCoinAmount.id = 'tb-' + coinDetails.id;
        inputUserCoinAmount.addEventListener('input', editUserCoinAmount);
        newCoinEntry.appendChild(inputUserCoinAmount);

        coinListElement.appendChild(newCoinEntry);     
    }
}

function displayAllCoins() {
    // Display all available crypto currency coins available from coinmarketcap
    chrome.storage.local.get({'coins':[]}, (storedList) => {
        var coinList = storedList['coins'];
        createCoinOptionList(coinList);
        syncCheckboxes();
        syncTextboxes();
    });
}

function displaySearch(event) {
    // Display search results
    chrome.storage.local.get({'coins':[]}, (storedList) => {
        var coinList = storedList['coins'];
        var newCoinList = [];

        // Find coin symbol and id with the given search text
        for (let i=0; i<coinList.length; i++) {
            let coinEntry = coinList[i];

            let splitIdIndex = coinEntry.id.indexOf('-');
            let coinSymbol = coinEntry.id.substr(0, splitIdIndex);
            let coinName = coinEntry.id.substr(splitIdIndex+1);
    
            if ((coinSymbol.search(this.value) != -1) || (coinName.search(this.value) != -1))
            {
                newCoinList.push(coinEntry);
            }
        }

        // Empty existing list
        let coinListElement = document.getElementById('coin-option-list')
        coinListElement.innerHTML = ''
        if(newCoinList.length <= 0) {
            coinListElement.innerHTML = 'No Results Found';
            return;
        }
        createCoinOptionList(newCoinList);
        syncCheckboxes();
        syncTextboxes();
    })
}

function updateList() {
    /*
        Updates the options stored on the chrome storage.
    */
    let coinName = this.id.substr(3);
    var coinList;
    const defaultJsonValue = {'coinOptions':{'bitcoin': {"display": true}}};
    document.getElementById('tb-' + coinName).style.display = this.checked ? 'inline' : 'none';

    chrome.storage.sync.get(defaultJsonValue, (result) => {
        coinList = result["coinOptions"];

        if (!(coinName in coinList)) {
            coinList[coinName] = {};
        }
        coinList[coinName]['display'] = this.checked ? true : false;
        chrome.storage.sync.set({
            'coinOptions' : coinList
        }, () => {
            console.log('Settings saved');
        });
    }); 
}

function enableSearchBar() {
    let searchBar = document.getElementById('crypto-search-bar');
    searchBar.addEventListener('input', displaySearch);
}