document.addEventListener('DOMContentLoaded', function() {
    displayCurrencyOption();
    displayAllCoins();
});

const cmcBaseUrl = 'https://api.coinmarketcap.com/v1';

function displayCurrencyOption() {
    // Displays list of valid currencies that can be displayed
    const currencyList = ["AUD", "BRL", "CAD", "CHF", "CLP", "CNY", 
                            "CZK", "DKK", "EUR", "GBP", "HKD", 
                            "HUF", "IDR", "ILS", "INR", "JPY", 
                            "KRW", "MXN", "MYR", "NOK", "NZD", 
                            "PHP", "PKR", "PLN", "RUB", "SEK", 
                            "SGD", "THB", "TRY", "TWD", "ZAR"];
    var currencyOption = "";
    for (index in currencyList) {
        currencyOption += "<option>" + currencyList[index] + "</option>";
    }
    document.getElementById("currency-option-list").innerHTML = currencyOption;
}

function syncCheckboxes() {
    let checkboxes = document.querySelectorAll('ul input');
    chrome.storage.sync.get({'coins': {}}, (result) => {
        var coinList = result["coins"];
        for (var key in coinList) {
            let isChecked = coinList[key];
            document.getElementById("cb-" + key).checked = isChecked;
        }
    })
}

function displayAllCoins() {
    fetch(cmcBaseUrl + '/ticker/?limit=0')
    .then((response) => response.json())
    .then((data) => {
        let coinList = document.getElementById('coin-option-list')
        for (let i = 0; i< data.length; i++)
        {
            //console.log(data[i]);
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
    chrome.storage.sync.get({'coins': {}}, (result) => {
        coinList = result["coins"];
        coinList[coinName] = this.checked ? true : false;
        chrome.storage.sync.set({
            'coins' : coinList
        }, () => {
            console.log('Settings saved');
        });
    }); 
}