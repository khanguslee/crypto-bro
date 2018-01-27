document.addEventListener('DOMContentLoaded', function() {
    setUpWalletDetails();
    displayCurrencyOption();
    displayPercentChangeOption();
    displayAllCoins();
    enableSearchBar();
});

function setUpWalletDetails() {
    // Add event listeners for all the wallet related stuff
    document.getElementById('wallet-links').addEventListener('click', toggleWalletDetails);

    document.getElementById('wallet-btc').addEventListener('click', showQRCode);
    document.getElementById('wallet-eth').addEventListener('click', showQRCode);
    document.getElementById('wallet-ltc').addEventListener('click', showQRCode);
    document.getElementById('wallet-xrp').addEventListener('click', showQRCode);

    document.getElementById('closeWalletModal').addEventListener('click', closeWalletModal);
}

function toggleWalletDetails() {
    // Toggle visibility of the wallet details
    let walletDiv = document.getElementById('wallet-div');
    walletDiv.style.display = walletDiv.style.display == 'inline' ? 'none' : 'inline';
}

function showQRCode() {
    // Show QR code iamge of all the wallets
    let coinName = this.id;
    // Display modal
    let modal = document.getElementById('walletModal');
    modal.style.display = 'inline';
    // Set header for modal
    let walletModalHeader = document.getElementById('wallet-modal-header');
    walletModalHeader.innerHTML = 'Donate to ' + coinName.substr(7).toUpperCase() + ' Wallet';
    // Show QR image
    let qrImage = document.getElementById('qr-image');
    qrImage.src = "../images/" + coinName + '.png';

}

function displayCurrencyOption() {
    // Displays list of valid currencies that can be displayed
    let selectCurrencyElement = document.getElementById("currency-option-list");
    selectCurrencyElement.addEventListener("change", changeCurrency);
    const currencyList = ["BTC", "USD", "AUD", "BRL", "CAD", "CHF", "CLP", "CNY", 
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
    });
}

function changeCurrency(selectedCurrency) {
    // Change the selected displayed currency
    chrome.storage.sync.set({"currency": selectedCurrency.target.value}, () => {
        let backgroundPage = chrome.extension.getBackgroundPage();
        backgroundPage.updateCoinList();
    });
}

function displayPercentChangeOption() {
    // Display the list of percent change times that the user can set
    let selectPercentChangeElement = document.getElementById("percent-change-option-list");
    selectPercentChangeElement.addEventListener("change", changePercentChange);
    var percentChangeOption = "";
    const percentChangeList = ["1 Hour", "24 Hour", "7 Days"];
    for (var index in percentChangeList) {
        percentChangeOption += "<option>" + percentChangeList[index] + "</option>";
    }
    selectPercentChangeElement.innerHTML = percentChangeOption;
}

function changePercentChange(selectedPercentChange) {
    // Change the selected percent change
    console.log(selectedPercentChange.target.value);
    /*
    chrome.storage.sync.set({"percent-change": selectedCurrency.target.value}, () => {
        let backgroundPage = chrome.extension.getBackgroundPage();
        backgroundPage.updateCoinList();
    });
    */
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
        for(let coin in coinList) {
            let isChecked = coinList[coin].display;
            // Show/Hide buttons if checkbox checked/unchecked
            let coinButton = document.getElementById('btn-' + coin);
            if (coinButton != null)
            {
                coinButton.style.display = isChecked ? 'inline' : 'none';
            }
            let alertButton = document.getElementById('alert-' + coin);
            if (alertButton != null)
            {
                alertButton.style.display = isChecked ? 'inline' : 'none';
            }
            if ('alert' in coinList[coin]) {
                if (coinList[coin].alert != "" && coinList[coin].alert != {}) {
                    alertButton.style.fontWeight = 'bolder';
                    alertButton.style.border = '1px solid gray';
                } 
            }
        }
    });
}

function editUserCoinAmount(coinID) {
    // Updates amount of coins user has of the chosen coin
    let inputQuantityElement = document.getElementById('input-user-coin-amount');
    var userInputCoinAmount = inputQuantityElement.value;

    const defaultJsonValue = {'coinOptions':{'bitcoin': {"display": true}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        let coinList = result.coinOptions;
        if (coinList[coinID] == null) {
            coinList[coinID] = {};
        }
        coinList[coinID].value = userInputCoinAmount;
        chrome.storage.sync.set({'coinOptions': coinList}, () => {
            console.log("Coin value saved!");
        });
        closeQuantityModal();
    });
}


function setCoinQuantity(coinID, coinName) {
    /*
        Handler for Edit Quantity button
    */
    const defaultJsonValue = {'coinOptions':{'bitcoin': {"value": ''}}};
    var coinValue = 0;
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        let coinList = result.coinOptions;
        for (var key in coinList) {
            if (key == coinID) {
                coinValue = "value" in coinList[key] ? coinList[key].value : 0;
            }
        }
        let coinNameSpan = document.getElementById('quantityCoinName');
        coinNameSpan.innerHTML = coinName;
        let inputCoinAmount = document.getElementById('input-user-coin-amount');
        inputCoinAmount.placeholder = coinName + ' Quantity';
        inputCoinAmount.value = coinValue ? coinValue : '';

        // Clone node to remove previous event listeners
        let saveQuantityButton = document.getElementById('saveQuantityButton');
        let newSaveButton = saveQuantityButton.cloneNode(true);
        newSaveButton.addEventListener('click', () => {editUserCoinAmount(coinID);});
        saveQuantityButton.parentNode.replaceChild(newSaveButton, saveQuantityButton);
    
        let modal = document.getElementById('quantityModal');
        modal.style.display = 'block';
    });
}

function alertCoin(coinID, coinName) {
    /*
        Handler for Alert Button
    */
    let coinNameSpan = document.getElementById('alertCoinName');
    coinNameSpan.innerHTML = coinName;
    const defaultJsonValue = {'coinOptions':{'bitcoin': {"display": true}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        let coinList = result.coinOptions;  
        if (coinList[coinID] == null) {
            coinList[coinID] = {};
        }
        // Display saved settings;
        let alertInfo = coinList[coinID].alert;
        if (alertInfo != null && alertInfo != '') {
            document.getElementById('alertCurrency').value = alertInfo.currency;
            document.getElementById('alertMinAmount').value = alertInfo.minAmount;
            document.getElementById('alertMaxAmount').value = alertInfo.maxAmount;
        }
        else {
            document.getElementById('alertCurrency').value = 'BTC';
            document.getElementById('alertMinAmount').value = '';
            document.getElementById('alertMaxAmount').value = '';
        }

        // Clone node to remove previous event listeners
        let saveAlertButton = document.getElementById('saveAlertButton');
        let newSaveButton = saveAlertButton.cloneNode(true);
        newSaveButton.addEventListener('click', () => {saveAlert(coinID);});
        saveAlertButton.parentNode.replaceChild(newSaveButton, saveAlertButton);

        let deleteAlertButton = document.getElementById('deleteAlertButton');
        let newDeleteButton = deleteAlertButton.cloneNode(true);
        newDeleteButton.addEventListener('click', () => {deleteAlert(coinID);});
        deleteAlertButton.parentNode.replaceChild(newDeleteButton, deleteAlertButton);

        let modal = document.getElementById('alertModal');
        modal.style.display = 'block';
    });
}

function saveAlert(coinID) {
    /*
        Save Alert button handler
    */
    resetAlertElements();
    let currencyType = document.getElementById('alertCurrency').value;
    let minAmount = document.getElementById('alertMinAmount').value;
    let maxAmount = document.getElementById('alertMaxAmount').value;
    // Validation
    // Check if user has given values into the text boxes before saving
    if (minAmount == '' && maxAmount == '') {
        document.getElementById('alertMinAmount').className = 'invalid-input';
        document.getElementById('alertMaxAmount').className = 'invalid-input';
        document.getElementById('emptyDataText').style.display = 'inline';
        return;
    }
    // If user supplies both minAmount and maxAmount, check if minAmount is less than maxAmount
    else if (minAmount != '' && maxAmount != '')
    {
        if (parseInt(minAmount, 10) > parseInt(maxAmount, 10)) {
            document.getElementById('alertMinAmount').className = 'invalid-input';
            document.getElementById('alertMaxAmount').className = 'invalid-input';
            document.getElementById('invalidDataText').style.display = 'inline';
            return;
        }
    }
    // Otherwise, save alert values
    const defaultJsonValue = {'coinOptions':{'bitcoin': {"alert": {}}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        let coinList = result.coinOptions;
        if (coinList[coinID] == null) {
            coinList[coinID] = {};
        }
        let alertInfo = {'currency': currencyType, 'minAmount': minAmount, 'maxAmount': maxAmount};
        coinList[coinID].alert = alertInfo;
        chrome.storage.sync.set({'coinOptions': coinList}, () => {
            console.log("Alert saved!");
        });
        let alertButton = document.getElementById('alert-' + coinID);
        alertButton.style.fontWeight = 'bolder';
        alertButton.style.border = '1px solid gray';
        closeAlertModal();
    });
}

function deleteAlert(coinID) {
    /*
        Delete alert button handler
    */
    const defaultJsonValue = {'coinOptions':{'bitcoin': {"alert": {}}}};
    chrome.storage.sync.get(defaultJsonValue, (result) => {
        let coinList = result.coinOptions;
        if (coinList[coinID] == null) {
            coinList[coinID] = {};
        }
        coinList[coinID].alert = '';
        chrome.storage.sync.set({'coinOptions': coinList}, () => {
            console.log("Alert deleted!");
        });
        let alertButton = document.getElementById('alert-' + coinID);
        alertButton.style.fontWeight = 'normal';
        alertButton.style.border = '';
        closeAlertModal();
    });
}

function resetAlertElements() {
    // Reset Alert modal elements
    document.getElementById('alertMinAmount').className = '';
    document.getElementById('alertMaxAmount').className = '';
    document.getElementById('emptyDataText').style.display = 'none';
    document.getElementById('invalidDataText').style.display = 'none';
}

function closeWalletModal() {
    let modal = document.getElementById('walletModal');
    modal.style.display = 'none';
}

function closeQuantityModal() {
    let modal = document.getElementById('quantityModal');
    modal.style.display = 'none';
}

function closeAlertModal() {
    let modal = document.getElementById('alertModal');
    modal.style.display = 'none';
    resetAlertElements();
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
        if (coinDetails.name.length > 20) {
            coinNameTextElement.style.fontSize = '95%';
        }
        coinNameTextElement.appendChild(coinNameText);
        newCoinEntry.appendChild(coinNameTextElement);

        // Add Alert button
        let alertButton = document.createElement('button');
        alertButton.id = 'alert-' + coinDetails.id;
        alertButton.className = 'alert-button';
        let alertText = document.createTextNode('Alert');
        alertButton.appendChild(alertText);
        alertButton.addEventListener('click', () => {alertCoin(coinDetails.id, coinDetails.name);});
        newCoinEntry.appendChild(alertButton);

        /*
        // Add Alert icon
        let alertIcon = document.createElement('i');
        alertIcon.className = 'far fa-bell';
        alertButton.appendChild(alertIcon);
        newCoinEntry.appendChild(alertButton);
        */
        let closeAlertModalButton = document.getElementById('closeAlertModal');
        closeAlertModalButton.addEventListener('click', closeAlertModal);

        // Add coin quantity button
        let quantityButton = document.createElement('button');
        quantityButton.id = 'btn-' + coinDetails.id;
        quantityButton.className = 'coin-quantity-button';
        quantityButton.textContent = 'Edit Quantity';
        quantityButton.addEventListener('click', () => {setCoinQuantity(coinDetails.id, coinDetails.name);});
        newCoinEntry.appendChild(quantityButton);
        
        let closeQuantityModalButton = document.getElementById('closeQuantityModal');
        closeQuantityModalButton.addEventListener('click', closeQuantityModal);

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

function displaySearch() {
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
    document.getElementById('alert-' + coinName).style.display = this.checked ? 'inline' : 'none';
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