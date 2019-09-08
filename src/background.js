const axios = require('axios')
const BigNumber = require('bignumber.js')
const { LibraClient, LibraWallet, LibraAdmissionControlStatus } = require('kulap-libra')
const moment = require('moment')
const forge = require('node-forge')
const bip39 = require('bip39')

const LOCK_TIME_PERIOD = 1 * 60

let wallet = {}
let isWalletLocked = true

chrome.runtime.onInstalled.addListener(() => {
    
})

chrome.alarms.onAlarm.addListener((alarm) => {
    if(alarm.name == 'lockAlarm') {
        wallet = {}
        isWalletLocked = true
        chrome.alarms.clear(alarm.name)
    }
})

chrome.runtime.onMessage.addListener( async (msg, sender, reply) => {
    let response = {}
    switch (msg.type) {
        case 'WALLET_CREATE_REQUEST':
            const password = msg.data.password
            wallet = await createWallet(password)
            response = {
                type: 'WALLET_CREATE_RESPONSE',
                data: wallet
            }
            isWalletLocked = false
            reply(response)
            break
        case 'WALLET_EXIST_REQUEST':
            const isExist = await walletExist()
            response = {
                type: 'WALLET_EXIST_RESPONSE',
            }
            if(!isExist)
                response.error = 'EMPTY'
            reply(response)
            break
        case 'WALLET_INQUIRY_REQUEST':
            response = {
                type: 'WALLET_INQUIRY_RESPONSE',
            }
            if(isWalletLocked)
                response.error = 'LOCKED'
            else response.data = wallet
            reply(response)
            break
        case 'WALLET_UNLOCK_REQUEST':
            response = {
                type: 'WALLET_UNLOCK_RESPONSE'
            }
            try {
                wallet = await unlockWallet(msg.data.password)
                isWalletLocked = false
            } catch (err) {
                response.error = err
            }
            reply(response)
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
function addLockAlarm() {
    chrome.alarms.create('lockAlarm', {
        periodInMinutes: LOCK_TIME_PERIOD / 60
    })
}

async function unlockWallet(password) {
    let promise = new Promise( async (resolve, reject) => {
        try {
            let encrypted = await loadStorage('mnemonic')
            let mnemonic = decrypt(encrypted.mnemonic, password)
            let address = await loadStorage('address')
            let wallet = {
                mnemonic: mnemonic,
                address: address.address,
                nextLockTime: moment().add(LOCK_TIME_PERIOD, 'second').toDate().getTime()
            }
            addLockAlarm()
            resolve(wallet)
        } catch (err) {
            reject(err)
        }
    })
    return promise
}

async function walletExist() {
    let res = await loadStorage('address')
    if(!res.address) return false
    else return true
}

function clearStorage() {
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

function loadStorage(key) {
    let promise = new Promise((resolve, reject) => {
        chrome.storage.sync.get([key], (result)=> {
            resolve(result)
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
    await clearStorage()
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
    // get next lock time
    let nextLockTime = moment().add(LOCK_TIME_PERIOD, 'second').toDate().getTime()
    await saveStorage('nextLockTime', nextLockTime)
    wallet.nextLockTime = nextLockTime
    addLockAlarm()
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
    encrypted = JSON.parse(encrypted)
    const iv = forge.util.decode64(encrypted.iv)
    const salt = forge.util.decode64(encrypted.salt)
    const key = forge.pkcs5.pbkdf2(password, salt, 8, 32)
    let decipher = forge.cipher.createDecipher('AES-CBC', key)
    decipher.start({iv:iv})
    decipher.update(forge.util.createBuffer(forge.util.hexToBytes(encrypted.cipherText)))
    if(!decipher.finish()) throw new Error('wrong key')
    let decrypted = decipher.output.toString()
    return decrypted
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