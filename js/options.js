document.addEventListener('DOMContentLoaded', function() {
    getAllCoins();
});

const cmcBaseUrl = 'https://api.coinmarketcap.com/v1';

function getAllCoins() {
    fetch(cmcBaseUrl + '/ticker/?limit=0')
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
    })
}