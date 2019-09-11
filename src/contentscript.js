const container = document.head || document.documentElement
const scriptTag = document.createElement('script')
scriptTag.setAttribute('async', false)
scriptTag.src = chrome.runtime.getURL('inpage.js')
//scriptTag.textContent = 'window.libra = { balance: 0}'
container.insertBefore(scriptTag, container.children[0])
container.removeChild(scriptTag)


window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return
    if (!event.data.type)
        return
    chrome.runtime.sendMessage(event.data)
});

chrome.runtime.onMessage.addListener( (msg, sender, response) => {
    let event = new CustomEvent(msg.id, {
        detail: msg
    })
    document.dispatchEvent(event)
})