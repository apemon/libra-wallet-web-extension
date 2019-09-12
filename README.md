# Libra Chrome Extension POC
---
An Libra Wallet POC in Chrome Browser inspired by [MetaMask](https://metamask.io) and [Kulap Libra Wallet POC](https://dev.kulap.io/libra/)

## Feature
---
- creating wallet based on BIP39, receive and transfer libra like normal wallet 💰
- unlock wallet with password protected and store wallet in local storage with encryption 🔑
- send and receive libra notification 💌 
- integrate with web application with wallet API inspired by MetaMask 💻

## API
---

This extension will inject api via window.libra object.

### Get Account
```javascript
let account = await window.libra.getAccount()
```

### Get Balance
```javascript
let balance = await window.libra.getBalance()
```

### Get Transaction History
```javascript
let transactions = await window.libra.getTransactions()
```

### Transfer
```javascript
let result = await window.libra.transfer(address, amount)
// example
// let result = await window.libra.transfer('c4d04d41ea1453db808e2e3a559f49a39d78fcefd6b87ebd41a0440b6017ff79', 100.55)
```

## Building chrome extension
---

- npm install
- npm run watch:dev
- go the extension and enable developer mode in chrome browser
- click on "Load unpacked" and select on "dist" folder


## License
---

Libra Wallet POC is released under the terms of the MIT license. See [LICENSE](LICENSE) for more
information or see https://opensource.org/licenses/MIT.