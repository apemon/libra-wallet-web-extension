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

    async transfer(address, amount) {
        let msg = {
            from: 'popup',
            type: 'TRANSFER_REQUEST',
            data: {
                address: address,
                amount: amount
            }
        }
        let promise = new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(msg, (res) => {
                if(res.error)
                    reject(res.error)
                else resolve(res.data)
            })
        })
        return promise
    }

    async notifyInpageTransferSuccess(id, address, amount, expirationTme) {
        let msg = {
            from: 'popup',
            type: 'INPAGE_TRANSFER_NOTIFICATION',
            id: id,
            data: {
                address: address,
                amount: amount,
                expirationTme: expirationTme
            }
        }
        let promise = new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(msg, (res) => {
                window.close()
            })
        })
        return promise
    }

    async notifyInpageTransferReject(id, address, amount) {
        let msg = {
            from: 'popup',
            type: 'INPAGE_TRANSFER_NOTIFICATION',
            id: id,
            data: {
                address: address,
                amount: amount
            },
            error: 'REJECTED_BY_USER'
        }
        let promise = new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(msg, (res) => {
                window.close()
            })
        })
        return promise
    }
}

export default LibraService