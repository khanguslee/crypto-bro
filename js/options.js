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
        var defaultCurrency = result.currency;
        for (var index in currencyList) {
            if (currencyList[index] == defaultCurrency) {
                currencyOption += "<option selected='selected'>" + currencyList[index] + "</option>";
            } else {
                currencyOption += "<option>" + currencyList[index] + "</option>";
            }
        }
        selectCurrencyElement.innerHTML = currencyOption;
        // TODO: What is this for??
        //selectCurrencyElement.selectedIndex
    });
}

function changeCurrency(selectedCurrency) {
    // Change the selected displayed currency
    chrome.storage.sync.set({"currency": selectedCurrency.target.value}, () => {
        let backgroundPage = chrome.extension.getBackgroundPage();
        backgroundPage.updateCoinList();
        console.log("Currency set as " + selectedCurrency.target.value);
    });
}

function syncCheckboxes() {
    // Tick checkboxes that user has already set
    const defaultJsonValue = {'coinOptions':{'bitcoin': {"display": true}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        var coinList = result.coinOptions;
        for (var key in coinList) {
            let isChecked = coinList[key].display;
            let coinCheckbox = document.getElementById("cb-" + key);
            if (coinCheckbox != null)
            {
                coinCheckbox.checked = isChecked;
            }
        }
    });
}

function syncButtons() {
    // Set button that user has already set
    const defaultJsonValue = {'coinOptions':{'bitcoin': {"value": ''}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        var coinList = result.coinOptions;
        for (var key in coinList) {
            let isChecked = coinList[key].display;
            userValue = coinList[key].value;

            // Show/Hide buttons if checkbox checked/unchecked
            let coinButton = document.getElementById('btn-' + key);
            if (coinButton != null)
            {
                coinButton.style.display = isChecked ? 'inline' : 'none';
            }
            let alertButton = document.getElementById('alert-' + key);
            if (alertButton != null)
            {
                alertButton.style.display = isChecked ? 'inline' : 'none';

            }
            // Set textbox value to stored value
            let coinTextbox = document.getElementById('tb-' + key);
            if (coinTextbox != null) {
                coinTextbox.value = userValue;
            }
        }
    });
}

function editUserCoinAmount(event) {
    // Updates amount of coins user has of the chosen coin
    var userInputCoinAmount = this.valueAsNumber;
    var coinName = this.id.substr(3);

    const defaultJsonValue = {'coinOptions':{'bitcoin': {"display": true}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        coinList = result.coinOptions;
        coinList[coinName].value = userInputCoinAmount;
        chrome.storage.sync.set({'coinOptions': coinList}, () => {
            console.log("Coin value saved!");
        });
    });
}

function setCoinQuantity(event) {
    let coinName = this.id.substr(4);
    let modal = document.getElementById('modal-' + coinName);
    modal.style.display = '';
}

function closeAlertModal(event) {
    let coinName = this.id.substr(12);  // Removes modal-alert-
    let modal = document.getElementById('modal-alert-' + coinName);
    modal.style.display = 'none';
}

function closeQuantityModal(event) {
    let coinName = this.id.substr(6);
    let modal = document.getElementById('modal-' + coinName);
    modal.style.display = 'none';
}

function alertCoin(event) {
    let coinName = this.id.substr(6);
    let modal = document.getElementById('modal-alert-' + coinName);
    modal.style.display = '';
}

function createCoinOptionList(coinList) {
    let coinListElement = document.getElementById('coin-option-list');
    coinListElement.innerHTML = '';
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
        let coinNameText = document.createTextNode(coinDetails.name);
        coinNameTextElement.appendChild(coinNameText);
        newCoinEntry.appendChild(coinNameTextElement);

        // Add Alert button
        let alertButton = document.createElement('button');
        alertButton.id = 'alert-' + coinDetails.id;
        alertButton.className = 'alert-button';
        alertButton.addEventListener('click', alertCoin);
        // Add Alert icon
        let alertIcon = document.createElement('i');
        alertIcon.className = 'far fa-bell';
        alertButton.appendChild(alertIcon);
        newCoinEntry.appendChild(alertButton);

        // Create modal to set alert options
        let alertModal = document.createElement('div');
        alertModal.id = 'modal-alert-' + coinDetails.id;
        alertModal.className = 'modal-main alert';
        alertModal.style.display = 'none';

        let alertModalContent = document.createElement('div');
        alertModalContent.id = 'modal-alert-content-' + coinDetails.id;
        alertModalContent.className = 'modal-content';

        // Add close button
        let closeAlertElement = document.createElement('span');
        closeAlertElement.className = 'close';
        closeAlertElement.id = 'close-alert-' + coinDetails.id;
        closeAlertElement.addEventListener('click', closeAlertModal);
        closeAlertElement.innerHTML = '&times;';
        alertModalContent.appendChild(closeAlertElement);

        // Add header to alert modal
        let alertModalHeader = document.createElement('h1');
        alertModalHeader.textContent = 'Set Alert for ' + coinDetails.name;
        alertModalContent.appendChild(alertModalHeader);

        // Add currency option
        let alertCurrencySettings = document.createElement('p');
        let alertCurrencySettingText = document.createTextNode('Currency: ');
        alertCurrencySettings.appendChild(alertCurrencySettingText);
        let alertCurrencySelection = document.createElement('select');
        alertCurrencySelection.id = 'alert-currency-' + coinDetails.id;
        let alertCurrencyOptions = ['BTC', 'USD'];   // TODO: Add more currency types later
        let aertCurrencyOptionElement = '';
        for (let i=0; i<alertCurrencyOptions.length; i++) {
            aertCurrencyOptionElement += '<option>' + alertCurrencyOptions[i] + '</option>';
        }
        alertCurrencySelection.innerHTML = aertCurrencyOptionElement;
        alertCurrencySettings.appendChild(alertCurrencySelection);
        alertModalContent.appendChild(alertCurrencySettings);

        // Add min-amount input
        let alertMinAmount = document.createElement('p');
        let alertMinAmountText = document.createTextNode('Minimum Amount: ');
        alertMinAmount.appendChild(alertMinAmountText);
        let alertMinAmountTextbox = document.createElement('input');
        alertMinAmountTextbox.type = 'number';
        alertMinAmount.appendChild(alertMinAmountTextbox)
        alertModalContent.appendChild(alertMinAmount);

        // Add max-amount input
        let alertMaxAmount = document.createElement('p');
        let alertMaxAmountText = document.createTextNode('Maximum Amount: ');
        alertMaxAmount.appendChild(alertMaxAmountText);
        let alertMaxAmountTextbox = document.createElement('input');
        alertMaxAmountTextbox.type = 'number';
        alertMaxAmount.appendChild(alertMaxAmountTextbox)
        alertModalContent.appendChild(alertMaxAmount);
        alertModal.appendChild(alertModalContent);
        newCoinEntry.appendChild(alertModal);

        // Add coin quantity button
        let quantityButton = document.createElement('button');
        quantityButton.id = 'btn-' + coinDetails.id;
        quantityButton.className = 'coin-quantity-button';
        quantityButton.textContent = 'Edit Quantity';
        quantityButton.addEventListener('click', setCoinQuantity);
        newCoinEntry.appendChild(quantityButton);

        // Create modal to edit coin quantity
        let coinModal = document.createElement('div');
        coinModal.id = 'modal-' + coinDetails.id;
        coinModal.className = 'modal-main';
        coinModal.style.display = 'none';

        let coinModalContent = document.createElement('div');
        coinModalContent.id = 'modal-content' + coinDetails.id;
        coinModalContent.className = 'modal-content';

        // Add close button
        let closeElement = document.createElement('span');
        closeElement.className = 'close';
        closeElement.id = 'close-' + coinDetails.id;
        closeElement.addEventListener('click', closeQuantityModal);
        closeElement.innerHTML = '&times;';
        coinModalContent.appendChild(closeElement);

        // Add header to modal
        let modalHeader = document.createElement('h1');
        modalHeader.textContent = 'Edit ' + coinDetails.name + ' Quantity';
        coinModalContent.appendChild(modalHeader);

        // Add Quantity Text to modal
        let modalText = document.createElement('p');
        let modalTextValue = document.createTextNode('Quantity: ');
        modalText.appendChild(modalTextValue);

        // Add input box to modal after quantity text
        let inputUserCoinAmount = document.createElement('input');
        inputUserCoinAmount.type = 'number';
        inputUserCoinAmount.className = 'input-user-coin-amount';
        inputUserCoinAmount.id = 'tb-' + coinDetails.id;
        inputUserCoinAmount.placeholder = coinDetails.name + ' Quantity';
        inputUserCoinAmount.addEventListener('input', editUserCoinAmount);
        modalText.appendChild(inputUserCoinAmount);
        coinModalContent.appendChild(modalText);
        coinModal.appendChild(coinModalContent);
        newCoinEntry.appendChild(coinModal);

        coinListElement.appendChild(newCoinEntry);     
    }
}

function displayAllCoins() {
    // Display all available crypto currency coins available from coinmarketcap
    chrome.storage.local.get({'coins':[]}, (storedList) => {
        var coinList = storedList.coins;
        createCoinOptionList(coinList);
        syncCheckboxes();
        syncButtons();
    });
}

function displaySearch(event) {
    // Display search results
    chrome.storage.local.get({'coins':[]}, (storedList) => {
        var coinList = storedList.coins;
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
        let coinListElement = document.getElementById('coin-option-list');
        coinListElement.innerHTML = '';
        if(newCoinList.length <= 0) {
            coinListElement.innerHTML = 'No Results Found';
            return;
        }
        createCoinOptionList(newCoinList);
        syncCheckboxes();
        syncButtons();
    });
}

function updateList() {
    /*
        Updates the options stored on the chrome storage.
    */
    let coinName = this.id.substr(3);
    var coinList;
    const defaultJsonValue = {'coinOptions':{'bitcoin': {"display": true}}};
    document.getElementById('btn-' + coinName).style.display = this.checked ? 'inline' : 'none';

    chrome.storage.sync.get(defaultJsonValue, (result) => {
        coinList = result.coinOptions;

        if (!(coinName in coinList)) {
            coinList[coinName] = {};
        }
        coinList[coinName].display = this.checked ? true : false;
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