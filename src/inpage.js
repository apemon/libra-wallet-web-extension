const uuid = require('uuid/v4')

class LibraMask {
    constructor () {
        
    }

    getAccount() {
        let id = uuid()
        let request = {
            type: 'INPAGE_ACCOUNT_REQUEST',
            from: 'inpage',
            id: id
        }
        let promise = new Promise((resolve, reject) => {
            document.addEventListener(id, (e) => {
                if(e.detail.error)
                    reject(e.detail.error)
                else
                    resolve(e.detail.data.address)
            })
        })
        window.postMessage(request, '*')
        return promise
    }

    getBalance() {
        let id = uuid()
        let request = {
            type: 'INPAGE_BALANCE_REQUEST',
            from: 'inpage',
            id: id
        }
        let promise = new Promise((resolve, reject) => {
            document.addEventListener(id, (e) => {
                if(e.detail.error)
                    reject(e.detail.error)
                else
                    resolve(e.detail.data.balance)
            })
        })
        window.postMessage(request, '*')
        return promise
    }

    getTransactions() {
        let id = uuid()
        let request = {
            type: 'INPAGE_TRANSACTION_REQUEST',
            from: 'inpage',
            id: id
        }
        let promise = new Promise((resolve, reject) => {
            document.addEventListener(id, (e) => {
                if(e.detail.error)
                    reject(e.detail.error)
                else
                    resolve(e.detail.data.transactions)
            })
        })
        window.postMessage(request, '*')
        return promise
    }

    transfer(destination, amount) {
        let id = uuid()
        let request = {
            type: 'INPAGE_TRANSFER_REQUEST',
            from: 'inpage',
            id: id,
            data: {
                address: destination,
                amount: amount
            }
        }
        let promise = new Promise((resolve, reject) => {
            document.addEventListener(id, (e) => {
                if(e.detail.error)
                    reject(e.detail.error)
                else
                    resolve(e.detail.data.transaction)
            })
        })
        window.postMessage(request, '*')
        return promise
    }

    sign(text) {
        let id = uuid()
        let request = {
            type: 'INPAGE_SIGN_REQUEST',
            from: 'inpage',
            id: id,
            data: {
                text: text,
                hostname: window.location.hostname
            }
        }
        let promise = new Promise((resolve, reject) => {
            document.addEventListener(id, (e) => {
                if(e.detail.error)
                    reject(e.detail.error)
                else
                    resolve(e.detail.data)
            })
        })
        window.postMessage(request, '*')
        return promise
    }

    verify(text, signature) {
        let id = uuid()
        let request = {
            type: 'INPAGE_VERIFY_REQUEST',
            from: 'inpage',
            id: id,
            data: {
                text: text,
                signature: signature
            }
        }
        let promise = new Promise((resolve, reject) => {
            document.addEventListener(id, (e) => {
                if(e.detail.error)
                    reject(e.detail.error)
                else
                    resolve()
            })
        })
        window.postMessage(request, '*')
        return promise
    }
}

window.libra = new LibraMask()