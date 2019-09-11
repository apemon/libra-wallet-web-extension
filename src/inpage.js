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

    test () {
        let id = uuid()
        let request = {
            tyoe: 'TEST',
            id: id
        }
        window.postMessage(request, '*')
    }
}

window.libra = new LibraMask()