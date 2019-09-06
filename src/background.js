const axios = require('axios')
const BigNumber = require('bignumber.js')
const { LibraClient, LibraWallet, LibraAdmissionControlStatus } = require('kulap-libra')
const moment = require('moment')

let isWalletLocked = true

chrome.runtime.onInstalled.addListener(() => {

})

chrome.alarms.onAlarm.addListener((alarm) => {
    isWalletLocked = true
})

chrome.runtime.onMessage.addListener( (msg, sender, reply) => {
    switch (msg.type) {
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

/* function here */
function unlock() {

}

