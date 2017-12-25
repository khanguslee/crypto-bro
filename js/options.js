document.addEventListener('DOMContentLoaded', function() {
    getAllCoins();
});

const cmcBaseUrl = 'https://api.coinmarketcap.com/v1';

function getAllCoins() {
    fetch(cmcBaseUrl + '/ticker/?limit=0')
    .then((response) => response.json())
    .then((data) => {
        let coinList = document.getElementById('coin-option-list')
        for (let i = 0; i< data.length; i++)
        {
            console.log(data[i]);
            let newCoinEntry = document.createElement('li');
            newCoinEntry.id = "coin-entry";

            let checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.id = "cb-" + data[i].name;
            checkbox.addEventListener('click', updateList);
            newCoinEntry.appendChild(checkbox);

            newCoinEntry.appendChild(document.createTextNode(data[i].name));
            coinList.appendChild(newCoinEntry);                    
        }
    })
}

function updateList() {
    console.log(this.id);
}