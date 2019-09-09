class LibraService {
    constructor () {

    }

    async createWallet(password) {
        let msg = {
            from: 'popup',
            type: 'WALLET_CREATE_REQUEST',
            data: {
                password: password
            }
        }
        let promise = new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(msg, (res) => {
                resolve(res.data)
            })
        })
        return promise
    }

    async checkWalletExist() {
        let msg = {
            from: 'popup',
            type: 'WALLET_EXIST_REQUEST'
        }
        let promise = new Promise( (resolve, reject) => {
            chrome.runtime.sendMessage(msg, (res) => {
                if(res.error) reject(res.error)
                resolve()
            })
        })
        return promise
    }

    async unlockWallet(password) {
        let msg = {
            from: 'popup',
            type: 'WALLET_UNLOCK_REQUEST',
            data: {
                password: password
            }
        }
        let promise = new Promise( (resolve, reject) => {
            chrome.runtime.sendMessage(msg, (res) => {
                if(!res.error) {
                    resolve()
                } else reject(res.error)
            })
        })
        return promise
    }

    async getWalletInfo() {
        let msg = {
            from: 'popup',
            type: 'WALLET_INQUIRY_REQUEST'
        }
        let promise = new Promise( (resolve, reject) => {
            chrome.runtime.sendMessage(msg, (res) => {
                if(!res.error) {
                    resolve(res.data)
                } else reject(res.error)
            })
        })
        return promise
    }

    async inquiryBalance(address) {
        let msg = {
            from : 'popup',
            type: 'BALANCE_INQUIRY_REQUEST',
            data: {
                address: address
            }
        }
        let promise = new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(msg, (res) => {
                resolve(res.data.balance)
            })
        })
        return promise
    }

    async updateBalance(address) {
        let msg = {
            from: 'popup',
            type: 'BALANCE_UPDATE_REQUEST',
            data: {
                address: address
            }
        }
        let promise = new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(msg, (res) => {
                resolve(res.data.balance)
            })
        })
        return promise
    }

    /*
    getClient () {
        return new LibraClient({
            transferProtocol: 'https',
            host: 'ac-libra-testnet.kulap.io',
            port: '443',
            dataProtocol: 'grpc-web-text'
        }) 
    }

    isWalletExist () {
        const wallet = this.loadWallet()
        if(wallet.address) return true
        else return false
    }

    loadWallet () {
        const mnemonic = store.get('mnemonic')
        const address = store.get('address')
        const balance = store.get('balance')
        return {
            mnemonic: mnemonic,
            address: address,
            balance: balance
        }
    }

    createWallet () {
        const wallet = new LibraWallet()
        const account = wallet.newAccount()

        return {
            address: account.getAddress().toHex(),
            mnemonic: wallet.config.mnemonic
        }
    }

    saveWallet (wallet) {
        store.set('mnemonic', wallet.mnemonic)
        store.set('address', wallet.address)
    }

    saveBalance (balance) {
        store.set('balance', balance)
    }

    async getBalance (client, address) {
        const accountState = await client.getAccountState(address)
        const balance = BigNumber(accountState.balance.toString(10))
        const balanceUnit = balance.dividedBy(BigNumber(1e6))
        return {
            balance: balanceUnit,
            balanceValue: balance.toString(10)
        }
    }

    async mint (address, amount) {
        return await axios.post('https://libraservice3.kulap.io' + '/mint', { address: address, amount: amount })
    }

    // because chrome extension don't allow call to libexplorer api, so we use kulap api instead
    async getTransactionHistory (address) {
        const url = 'https://libraservice3.kulap.io/transactionHistory'
        const request = {
            address: address
        }
        try {
            const response = await axios.post(url,request)
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
    */
    // copy from libra-wallet-poc
    async transfer (client, mnemonic, address, amount) {
        const wallet = new LibraWallet({ mnemonic: mnemonic })
        const account = wallet.generateAccount(0) // Derivation paths to "LIBRA WALLET: derived key$0"
        const amountToTransfer = BigNumber(amount).times(1e6) // Amount in micro libras

        // Stamp account state before transfering
        const beforeAccountState = await client.getAccountState(account.getAddress())

        // Transfer
        const response = await client.transferCoins(account, address, amountToTransfer)
        // mock
        return response
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

    test() {
        let msg = {
            type: 'ACCOUNT_INFO'
        }
        let promise = new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(msg, (res) => {
                resolve(res.type)
            })
        })
        return promise
    }
}

export default LibraService