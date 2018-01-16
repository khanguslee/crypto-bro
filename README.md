# Crypto Bro
[![Build Status](https://travis-ci.org/khanguslee/crypto-bro.svg?branch=khanguslee%2FtravisCI)](https://travis-ci.org/khanguslee/crypto-bro)

A chrome extension to check the prices of cryptocurrency on [Coin Market Cap](https://coinmarketcap.com/). This extension aims to allow you to check on your cryptocurrency portfolio discretely at work.

Let me know if you would like to be a tester for this chrome extension.

*Note: This application is still under development*

## Features
- Display prices of various crypto-currencies
- Display prices of crypto-currencies in various currency formats
- Track the value of your portfolio
- View the percent change of the coin over 24 hours

## Getting Started
To load the application, type in `chrome://extensions/` into the browser and check "Developer Mode". Click on "Load unpacked extension..." and select the folder of this repository. 

## To Do
### Functionality
- [x] Option to show/hide other cryptocurrencys
- [x] Input the amount of cryptocurrencys you own
- [x] Alert system
    - [x] Spike to learn how to make a modal
    - [x] Alert when below price
    - [x] Alert when above price
- [x] Currency conversion
- [x] Search bar in the options menu
- [ ] Use jquery to cut down on code (Next major version)
- [ ] Add option to display either 1 hour, 24hour or 7 day percent change of the price
- [ ] Add option to display price change in percentages or in monetary amount (Maybe cycle this?)
- [x] Displayed entries in same order each time
- [x] Add link to the coin's coinmarketcap page
- [ ] Display prices in bitcoin
- [ ] Edit quantity of a particular coin by clicking on the coin entry in the extension window
- [ ] Add more currency types for alerting 
- [ ] Let travisCI run tests on the code (Currently runs eslint on javascript code) 

### Design
- [x] Add green/red arrows to show if the coin increased/decreased in value
- [x] Change percent change text to green/red if the coin increased/decreased in value
- [ ] Night Mode
- [x] Logo for app
- [ ] Create banners for chrome extension web store