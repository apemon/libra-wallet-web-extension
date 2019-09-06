const uuid = require('uuid/v4')

class LibraMask {
    constructor () {
        this.promises = {}
    }

    getAccount() {
        let id = uuid()
        let request = {
            type: 'ACCOUNT_REQUEST',
            id: id
        }
        let promise = new Promise((resolve, reject) => {
            document.addEventListener(id, (e) => {
                alert(JSON.stringify(e))
                resolve(e.detail)
            })
        })
        window.postMessage(request, '*')
        return promise
    }

    transfer(destination, amount) {
        let id = uuid()
        let request = {
            type: 'TRANSFER_REQUEST',
            id: id,
            data: {
                destination: destination,
                amount: amount | 0
            }
        }
        let promise = new Promise((resolve, reject) => {
            document.addEventListener(id, (e) => {
                resolve(e.data)
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