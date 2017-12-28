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
    let checkboxes = document.querySelectorAll('ul input');
    const defaultJsonValue = {'coins':{'bitcoin': {"display": true}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        console.log(result);
        var coinList = result["coins"];
        for (var key in coinList) {
            let isChecked = coinList[key]['display'];
            document.getElementById("cb-" + key).checked = isChecked;
        }
    })
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

            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'cb-' + data[i].id;
            checkbox.addEventListener('click', updateList);
            newCoinEntry.appendChild(checkbox);

            newCoinEntry.appendChild(document.createTextNode(data[i].name));
            coinList.appendChild(newCoinEntry);                    
        }
        syncCheckboxes();
    })
}

function updateList() {
    /*
        Updates the options stored on the chrome storage.
    */
    let coinName = this.id.substr(3);
    var coinList;
    const defaultJsonValue = {'coins':{'bitcoin': {"display": true}}};

    chrome.storage.sync.get(defaultJsonValue, (result) => {
        coinList = result["coins"];
        coinList[coinName] = {};
        coinList[coinName]['display'] = this.checked ? true : false;
        chrome.storage.sync.set({
            'coins' : coinList
        }, () => {
            console.log('Settings saved');
        });
    }); 
}