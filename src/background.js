const axios = require('axios')
const BigNumber = require('bignumber.js')
const { LibraClient, LibraWallet, LibraAdmissionControlStatus } = require('kulap-libra')
const moment = require('moment')
const forge = require('node-forge')
const bip39 = require('bip39')

const LOCK_TIME_PERIOD = 5 * 60
const NOTIFICATION_TIME_PERIOD = 1 * 60
const LIBRA_SERVICE_URL = 'https://libraservice3.kulap.io'

let wallet = {}
let balance = 0
let transactions = []
let isWalletLocked = true

function reloadExtension() {
    chrome.runtime.onMessage.addListener( (msg, sender) => {
        return true
    })
}

chrome.runtime.reload ? reloadExtension(): true

chrome.runtime.onStartup.addListener(() => {
    chrome.runtime.reload()
})

chrome.runtime.onInstalled.addListener(() => {
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
                if(!isExist) {
                    response.error = 'EMPTY'
                }
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
            case 'BALANCE_INQUIRY_REQUEST':
                balance = await inquiryBalance()
                response = {
                    type: 'BALANCE_INQUIRY_RESPONSE',
                    data: {
                        address: msg.data.address,
                        balance: balance
                    }
                }
                reply(response)
                break
            case 'BALANCE_UPDATE_REQUEST':
                balance = await updateBalance(msg.data.address)
                response = {
                    type: 'BALANCE_UPDATE_RESPONSE',
                    data: {
                        address: msg.data.address,
                        balance: balance
                    }
                }
                reply(response)
                break
            case 'TRANSACTION_INQUIRY_REQUEST':
                transactions = await inquiryTransaction()
                response = {
                    type: 'TRANSACTION_INQUIRY_RESPONSE',
                    data: {
                        address: msg.data.address,
                        transactions: transactions
                    }
                }
                reply(response)
                break
            case 'TRANSACTION_UPDATE_REQUEST':
                transactions = await updateTransaction(msg.data.address)
                response = {
                    type: 'TRANSACTION_UPDATE_RESPONSE',
                    data: {
                        address: msg.data.address,
                        transactions: transactions
                    }
                }
                reply(response)
                break
            case 'TRANSFER_REQUEST':
                response = {
                    type: 'TRANSFER_RESPONSE'
                }
                try {
                    const result = await transfer(wallet.mnemonic, msg.data.address, msg.data.amount)
                    const time = result.signedTransaction.transaction.expirationTime.toNumber() * 1000
                    response.data = {
                        address: msg.data.address,
                        amount: msg.data.amount,
                        expirationTime: time
                    }
                    transactions = await updateTransaction(wallet.address)
                    const transaction = transactions[0]
                    const id = transaction.transactionVersion.toString()
                    await chromeSendNotification(id, 'Outgoing Transaction', 'You send ' + msg.data.amount + ' Lib')
                } catch (err) {
                    response.error = err
                }
                reply(response)
                break
            case 'INPAGE_ACCOUNT_REQUEST':
                response = {
                    type: 'INPAGE_ACCOUNT_RESPONSE',
                    id: msg.id
                }
                if(isWalletLocked)
                    response.error = 'LOCKED'
                else response.data = {
                    address: wallet.address
                }
                await chromeSendTabMessage(response)
                break
            case 'INPAGE_BALANCE_REQUEST':
                response = {
                    type: 'INPAGE_BALANCE_RESPONSE',
                    id: msg.id
                }
                if(isWalletLocked)
                    response.error = 'LOCKED'
                else {
                    balance = await updateBalance(wallet.address)
                    response.data = {
                        balance: balance
                    }
                }
                await chromeSendTabMessage(response)
                break
            case 'INPAGE_TRANSACTION_REQUEST':
                response = {
                    type: 'INPAGE_TRANSACTION_RESPONSE',
                    id: msg.id
                }
                if(isWalletLocked)
                    response.error = 'LOCKED'
                else {
                    transactions = await updateTransaction(wallet.address)
                    response.data = {
                        transactions: transactions
                    }
                }
                await chromeSendTabMessage(response)
                break
            case 'INPAGE_TRANSFER_REQUEST':
                response = {
                    type: 'INPAGE_TRANSACTION_RESPONSE',
                    id: msg.id
                }
                if(isWalletLocked) {
                    response.error = 'LOCKED'
                    await chromeSendTabMessage(response)
                } else {
                    const query = 'destination=' + msg.data.address + '&amount=' + msg.data.amount + '&id=' + msg.id
                    const path = chrome.extension.getURL('popup/popup.html?action=confirm&' + query)
                    chrome.windows.create({
                        'url': path,
                        'type': 'popup',
                        'width': 360,
                        'height': 600
                    }, (w) => {
                        
                    })
                }
                break
            case 'INPAGE_TRANSFER_NOTIFICATION':
                response = {
                    type: 'INPAGE_TRANSFER_RESPONSE',
                    id: msg.id
                }
                if(!msg.error) {
                    transactions = await updateTransaction(wallet.address)
                    const transaction = transactions[0]
                    response.data = {
                        address: msg.data.address,
                        amount: msg.data.amount,
                        transaction: transaction
                    }
                } else {
                    response.error = msg.error
                }
                reply(response)
                await chromeSendTabMessage(response)
                break
        }
        return true
    })

    chrome.notifications.onClicked.addListener((id) => {
        chrome.tabs.create({url:'https://libexplorer.com/version/' + id})
    })

    addNotificationAlarm()
})

chrome.alarms.onAlarm.addListener( async (alarm) => {
    if(alarm.name == 'lockAlarm') {
        wallet = {}
        isWalletLocked = true
        chrome.alarms.clear(alarm.name)
    } else if(alarm.name == 'notificationAlarm') {
        const previousHeight = transactions.length
        const addr = await loadStorage('address')
        transactions = await updateTransaction(addr.address)
        const currentHeight = transactions.length
        if(currentHeight > previousHeight) {
            const diff = currentHeight - previousHeight
            for(let i=0;i<diff;i++) {
                const transaction = transactions[i]
                const id = transaction.transactionVersion.toString()
                let title = ''
                let message = ''
                if(transaction.event == 'sent') {
                    title = 'Outgoing Transaction'
                    message = 'You send ' + transaction.amount + ' Lib'
                } else {
                    title = 'Incoming Transaction'
                    message = 'You receive ' + transaction.amount + ' Lib'
                }
                chromeSendNotification(id, title, message)
            }
        }
    }
})

/* chrome related function here */
function chromeSendMessage(msg) {
    let promise = new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(msg, (res) => {
            resolve()
        })
    })
    return promise
}

function chromeSendTabMessage(msg) {
    let promise = new Promise((resolve, reject) => {
        chrome.tabs.query({active: true}, (tabs) => {
            let activeTabs = tabs.filter((tab) => {
                return !tab.url.includes('chrome-extension://')
            })
            let activeTabId = activeTabs[0].id
            chrome.tabs.sendMessage(activeTabId, msg, (res) => {
                resolve()
            })
        })
    })
    return promise
}

function chromeSendNotification(id, title, message) {
    let options = {
        message: message,
        title: title,
        type: 'basic',
        iconUrl: 'icons/icon_128.png'
    }
    chrome.notifications.create(id, options)
}

/* general function here */
function addLockAlarm() {
    chrome.alarms.create('lockAlarm', {
        periodInMinutes: LOCK_TIME_PERIOD / 60
    })
}

function addNotificationAlarm() {
    chrome.alarms.create('notificationAlarm', {
        periodInMinutes: NOTIFICATION_TIME_PERIOD / 60
    })
}

async function inquiryBalance() {
    let balanceObj = await loadStorage('balance')
    return balanceObj.balance
}

async function updateBalance(address) {
    let balanceObj = await getBalance(address)
    let balance = balanceObj.balance
    await saveStorage('balance', balance)
    return balance
}

async function inquiryTransaction() {
    try {
        let transactionsObj = await loadStorage('transactions')
        return transactionsObj.transactions
    } catch (err) {
        return []
    }
}

async function updateTransaction(address) {
    let transactions = await getTransactionHistory(address)
    await saveStorage('transactions', transactions)
    return transactions
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
    try {
        let res = await loadStorage('address')
        return true
    } catch (err) {
        return false
    }
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
            if(Object.keys(result).length === 0)
                reject()
            else resolve(result)
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
    let balance = await getBalance(wallet.address)
    await saveStorage('balance', balance.balance)
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

function getClient () {
    return new LibraClient({
        transferProtocol: 'https',
        host: 'ac-libra-testnet.kulap.io',
        port: '443',
        dataProtocol: 'grpc-web-text'
    })
}

async function getBalance (address) {
    let client = getClient()
    const accountState = await client.getAccountState(address)
    const balance = BigNumber(accountState.balance.toString(10))
    const balanceUnit = balance.dividedBy(BigNumber(1e6)).toString(10)
    return {
        balance: balanceUnit,
        balanceValue: balance.toString(10)
    }
}

async function mint (address, amount) {
    return await axios.post(LIBRA_SERVICE_URL + '/mint', { address: address, amount: amount })
}

// because chrome extension don't allow call to libexplorer api, so we use kulap api instead
async function getTransactionHistory (address) {
    try {
        const response = await axios.post(LIBRA_SERVICE_URL + '/transactionHistory', {address: address})
        let transactions = response.data.transactions.map( (tx) => {
            // check minter
            if(tx.fromAddress == '000000000000000000000000000000000000000000000000000000000a550c18') {
                tx.event = 'mint'
            }
            // format date
            let date = moment(tx.date)
            tx.date = date.format('d MMM YYYY') + ' at ' + date.format('HH:mm')
            return tx
        })
        return transactions
    } catch (err) {
        throw new Error(err.message)
    }
}

// copy from libra-wallet-poc
async function transfer (mnemonic, address, amount) {
    const client = getClient()
    const wallet = new LibraWallet({ mnemonic: mnemonic })
    const account = wallet.generateAccount(0) // Derivation paths to "LIBRA WALLET: derived key$0"
    const amountToTransfer = BigNumber(amount).times(1e6) // Amount in micro libras

    // Stamp account state before transfering
    const beforeAccountState = await client.getAccountState(account.getAddress())

    // Transfer
    const response = await client.transferCoins(account, address, amountToTransfer)
    if (response.acStatus !== LibraAdmissionControlStatus.ACCEPTED) {
        throw new Error(`admission_control failed with status ${LibraAdmissionControlStatus[response.acStatus]}`)
    }

    // Ensure sender account balance was reduced accordingly
    await response.awaitConfirmation(client)
    const afterAccountState = await client.getAccountState(account.getAddress())
    if (afterAccountState.balance.toString(10) !== beforeAccountState.balance.minus(amountToTransfer).toString(10)) {
        throw new Error(`transfer failed`)
    }
    return response
}