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

    async inquiryTransaction(address) {
        let msg = {
            from: 'popup',
            type: 'TRANSACTION_INQUIRY_REQUEST',
            data: {
                address: address
            }
        }
        let promise = new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(msg, (res) => {
                resolve(res.data.transactions)
            })
        })
        return promise
    }

    async updateTransaction(address) {
        let msg = {
            from: 'popup',
            type: 'TRANSACTION_UPDATE_REQUEST',
            data: {
                address: address
            }
        }
        let promise = new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(msg, (res) => {
                resolve(res.data.transactions)
            })
        })
        return promise
    }
    
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