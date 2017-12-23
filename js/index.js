document.addEventListener('DOMContentLoaded', function() {
    getBitcoinPrice();
    getEthereumPrice();
    getLitecoinPrice();
});

const cmcBaseUrl = 'https://api.coinmarketcap.com/v1';



function getBitcoinPrice()
{
    fetch(cmcBaseUrl + '/ticker/bitcoin/')
    .then((response) => response.json())
    .then((data) => {
        document.getElementById("btc-price").textContent = data[0].price_usd;
    });
}

function getEthereumPrice()
{
    fetch(cmcBaseUrl + '/ticker/ethereum/')
    .then((response) => response.json())
    .then((data) => {
        document.getElementById("eth-price").textContent = data[0].price_usd;
    });
}

function getLitecoinPrice()
{
    fetch(cmcBaseUrl + '/ticker/litecoin/')
    .then((response) => response.json())
    .then((data) => {
        document.getElementById("ltc-price").textContent = data[0].price_usd;
    });
}
