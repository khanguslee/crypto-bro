document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('bitcoin-button').addEventListener('click', getBitcoinPrice)
});

const cmcBaseUrl = 'https://api.coinmarketcap.com/v1';

function getBitcoinPrice()
{
    fetch(cmcBaseUrl + '/ticker/bitcoin/')
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
    });
}