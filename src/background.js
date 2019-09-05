chrome.runtime.onMessage.addListener( (message, sender, reply) => {
    if(message.type == "FROM_PAGE") {
        chrome.windows.create({
            'url': chrome.extension.getURL('popup/popup.html?action=confirm&destination=xxx&amount=100'),
            //'url': 'popup/popup.html#/confirm',
            'type': 'popup',
            'width': 360,
            'height': 600
        }, (w) => {
            
         })
        //reply(wallet.address)
    } 
})

chrome.runtime.onMessageExternal.addListener( (msg, sender, response) => {
    alert(JSON.stringify(msg))
})