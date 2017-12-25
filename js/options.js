document.addEventListener('DOMContentLoaded', function() {
    displayAllCoins();
    syncList();
});

const cmcBaseUrl = 'https://api.coinmarketcap.com/v1';

function syncList() {
    chrome.storage.sync.get('coins', (result) => {
        console.log(result);
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
    })
}

function updateList() {
    let coinName = this.id.substr(3);

    var coinList;
    chrome.storage.sync.get('coins', (result) => {
        coinList = result["coins"];
        coinList[coinName] = this.checked ? true : false;
        chrome.storage.sync.set({
            'coins' : coinList
        }, () => {
            console.log('Settings saved');
        });
    }); 
}