document.addEventListener('DOMContentLoaded', function() {
    displayCurrencyOption();
    displayAllCoins();
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
        console.log("Currency set as " + selectedCurrency.target.value);
    });
}

function syncCheckboxes() {
    // Tick checkboxes that user has already set
    const defaultJsonValue = {'coins':{'bitcoin': {"display": true}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        var coinList = result["coins"];
        for (var key in coinList) {
            let isChecked = coinList[key]['display'];
            document.getElementById("cb-" + key).checked = isChecked;
        }
    })
}

function syncTextboxes() {
    // Set textboxes that user has already set
    const defaultJsonValue = {'coins':{'bitcoin': {"value": 1}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        var coinList = result["coins"];
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

    const defaultJsonValue = {'coins':{'bitcoin': {"display": true}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        coinList = result["coins"];
        coinList[coinName]['value'] = userInputCoinAmount;
        chrome.storage.sync.set({'coins': coinList}, () => {
            console.log("Coin value saved!");
        });
    });
}

function displayAllCoins() {
    // Display all available crypto currency coins available from coinmarketcap
    fetch(cmcBaseUrl + '/ticker/?limit=0')
    .then((response) => response.json())
    .then((data) => {
        let coinList = document.getElementById('coin-option-list')
        for (let i = 0; i< data.length; i++)
        {
            let newCoinEntry = document.createElement('li');
            newCoinEntry.id = 'coin-entry';

            // Add check box
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'cb-' + data[i].id;
            checkbox.addEventListener('click', updateList);
            newCoinEntry.appendChild(checkbox);

            // Add coin name text
            let coinNameTextElement = document.createElement('p');
            let coinNameText = document.createTextNode(data[i].name)
            coinNameTextElement.appendChild(coinNameText);
            newCoinEntry.appendChild(coinNameTextElement);

            // Add input box
            let inputUserCoinAmount = document.createElement('input');
            inputUserCoinAmount.type = 'number';
            inputUserCoinAmount.className = 'input-user-coin-amount';
            inputUserCoinAmount.id = 'tb-' + data[i].id;
            inputUserCoinAmount.addEventListener('input', editUserCoinAmount);
            newCoinEntry.appendChild(inputUserCoinAmount);

            coinList.appendChild(newCoinEntry);                    
        }
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
    const defaultJsonValue = {'coins':{'bitcoin': {"display": true}}};
    document.getElementById('tb-' + coinName).style.display = this.checked ? 'inline' : 'none';

    chrome.storage.sync.get(defaultJsonValue, (result) => {
        coinList = result["coins"];

        if (!(coinName in coinList)) {
            coinList[coinName] = {};
        }
        coinList[coinName]['display'] = this.checked ? true : false;
        chrome.storage.sync.set({
            'coins' : coinList
        }, () => {
            console.log('Settings saved');
        });
    }); 
}