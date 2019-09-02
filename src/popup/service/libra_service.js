const BigNumber = require('bignumber.js')
const { LibraClient, LibraWallet, LibraAdmissionControlStatus } = require('kulap-libra')
const axios = require('axios')
const moment = require('moment')
const store = require('store')

class Libra {
    constructor () {
        this.client = new LibraClient({
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

    async getBalance (address) {
        const accountState = await this.client.getAccountState(address)
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
}

export default Libra