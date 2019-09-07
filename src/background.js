const axios = require('axios')
const BigNumber = require('bignumber.js')
const { LibraClient, LibraWallet, LibraAdmissionControlStatus } = require('kulap-libra')
const moment = require('moment')
const forge = require('node-forge')
const bip39 = require('bip39')

let isWalletLocked = true

chrome.runtime.onInstalled.addListener(() => {

})

chrome.alarms.onAlarm.addListener((alarm) => {
    isWalletLocked = true
})

chrome.runtime.onMessage.addListener( async (msg, sender, reply) => {
    switch (msg.type) {
        case 'WALLET_CREATE_REQUEST':
            const password = msg.data.password
            let wallet = await createWallet(password)
            let response = {
                type: 'WALLET_CREATE_RESPONSE',
                data: wallet
            }
            reply(response)
            break
        case 'ACCOUNT_INFO':
            let res = {
                type: 'ACCOUNT_INFO_RESPONSE',
                data: 'xxx'
            }
            reply(res)
            break
        case 'WALLET_UNLOCK':
            isWalletLocked = false
            break
        case 'WALLET_CREATE':
            break
        case 'WALLET_STATUS':
            break
    }
})

/*
chrome.runtime.onMessage.addListener( async (message, sender, reply) => {
    switch (message.type) {
        case 'TRANSFER_REQUEST':
            let query = 'destination=' + message.data.destination + '&amount=' + message.data.amount + '&id=' + message.id
            let path = chrome.extension.getURL('popup/popup.html?action=confirm&' + query)
            chrome.windows.create({
                'url': path,
                'type': 'popup',
                'width': 360,
                'height': 600
            }, (w) => {
                
            })
            break
        case 'ACCOUNT_REQUEST':
            alert(JSON.stringify(message))
            alert(localStorage.getItem(address))
            alert(libra.loadWallet().address)
            chrome.tabs.query({active: true}, (tabs) => {
                let activeTabs = tabs.filter((tab) => {
                    return !tab.url.includes('chrome-extension://')
                })
                let activeTabId = activeTabs[0].id
                alert(JSON.stringify(activeTabs))
                let request = {
                    type: 'ACCOUNT_RESPONSE',
                    data: 'aaa',
                    id: message.id
                }
                chrome.tabs.sendMessage(activeTabId, request, (res) => {
                    alert(JSON.stringify(res))
                })
            })
            break
        case 'TEST':
            let res = await axios.get('http://www.google.com')
            alert(res.data)
    }
})
*/

/* chrome related function here */
function chromeSendMessage(msg) {
    let promise = new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(msg, (res) => {
            resolve()
        })
    })
    return promise
}

/* general function here */
function unlock() {

}

function clearWallet() {
    let promise = new Promise((resolve, reject) => {
        chrome.storage.sync.clear(() => {
            resolve()
        })
    })
    return promise
}

function saveStorage(key, value) {
    value = JSON.stringify(value)
    let json = {}
    json[key] = value
    let promise = new Promise((resolve, reject) => {
        chrome.storage.sync.set(json, () => {
            resolve()
        })
    })
    return promise
}

async function saveWallet(address, encryptedWallet) {
    await saveStorage('mnemonic', encryptedWallet)
    await saveStorage('address', address)
}

async function createWallet(password) {
    // clear wallet
    await clearWallet()
    // generate key pair
    let wallet = generateWallet()
    // encrypt it and store in local db
    let encryptedWallet = encrypt(wallet.mnemonic, password)
    await saveWallet(wallet.address, encryptedWallet)
    // mint some balance
    await mint(wallet.address, 1000)
    // get some balance
    let balance = await getBalance(wallet.address).balance
    await saveStorage('balance', balance)
    return wallet
}

function encrypt(text, password) {
    // generate key
    const iv = forge.random.getBytesSync(32)
    const salt = forge.random.getBytesSync(128)
    const key = forge.pkcs5.pbkdf2(password, salt, 8, 32)
    let cipher = forge.cipher.createCipher('AES-CBC', key)
    cipher.start({iv:iv})
    cipher.update(forge.util.createBuffer(text))
    cipher.finish()
    let encryptedWallet = {
        iv: forge.util.encode64(iv),
        salt: forge.util.encode64(salt),
        cipherText: cipher.output.toHex()
    }
    return encryptedWallet
}

function decrypt(encrypted, password) {
    const iv = forge.util.decode64(encrypted.iv)
    const salt = forge.util.decode64(encrypted.salt)
    const key = forge.pkcs5.pbkdf2(password, salt, 8, 32)
    let decipher = forge.cipher.createDecipher('AES-CBC', key)
    decipher.start({iv:iv})
    decipher.update(forge.util.createBuffer(forge.util.hexToBytes(encrypted.cipherText)))
    decipher.finish()
    return decipher.output.toString()
}

/** libra related function */
function generateWallet () {
    let bytes = forge.random.getBytesSync(16)
    let mnemonic = bip39.entropyToMnemonic(forge.util.bytesToHex(bytes))
    const wallet = new LibraWallet({
        mnemonic: mnemonic
    })
    const account = wallet.newAccount()

    return {
        address: account.getAddress().toHex(),
        mnemonic: wallet.config.mnemonic
    }
}

async function getBalance (address) {
    const client = new LibraClient({
        transferProtocol: 'https',
        host: 'ac-libra-testnet.kulap.io',
        port: '443',
        dataProtocol: 'grpc-web-text'
    })
    const accountState = await client.getAccountState(address)
    const balance = BigNumber(accountState.balance.toString(10))
    const balanceUnit = balance.dividedBy(BigNumber(1e6))
    return {
        balance: balanceUnit,
        balanceValue: balance.toString(10)
    }
}

async function mint (address, amount) {
    return await axios.post('https://libraservice3.kulap.io' + '/mint', { address: address, amount: amount })
}