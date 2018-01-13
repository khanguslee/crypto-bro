# Crypto Bro
[![Build Status](https://travis-ci.org/khanguslee/crypto-bro.svg?branch=khanguslee%2FtravisCI)](https://travis-ci.org/khanguslee/crypto-bro)

A chrome extension to check the prices of cryptocurrency on [Coin Market Cap](https://coinmarketcap.com/). This extension aims to allow you to check on your cryptocurrency portfolio discretely at work.

*Note: This application is still under development so it has not been released on the chrome app store yet.*

## Features
- Display prices of various crypto-currencies
- Display prices of crypto-currencies in various currency formats
- Track the value of your portfolio
- View the percent change of the coin over 24 hours

## Getting Started
To load the application, type in `chrome://extensions/` into the browser and check "Developer Mode". Click on "Load unpacked extension..." and select the folder of this repository. 

## To Do:
### Functionality
- [x] Option to show/hide other cryptocurrencys
- [x] Input the amount of cryptocurrencys you own
- [ ] Alert system
    - [x] Spike to learn how to make a modal
    - [ ] Alert when below price
    - [ ] Alert when above price
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

### Design
- [x] Add green/red arrows to show if the coin increased/decreased in value
- [x] Change percent change text to green/red if the coin increased/decreased in value
- [ ] Night Mode
- [ ] Logo for app