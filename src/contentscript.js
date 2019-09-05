const inpageContent = 'window.libra = { balance: 0 }'

const container = document.head || document.documentElement
const scriptTag = document.createElement('script')
scriptTag.setAttribute('async', false)
scriptTag.textContent = inpageContent
//scriptTag.textContent = 'window.libra = { balance: 0}'
container.insertBefore(scriptTag, container.children[0])
container.removeChild(scriptTag)


window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    //alert(JSON.stringify(event.data))
    if (event.source != window)
        return;

    if (event.data.type && (event.data.type == "FROM_PAGE")) {
        this.chrome.runtime.sendMessage(event.data)
    }
});

chrome.runtime.onMessage.addListener( (msg, sender, response) => {
    alert(JSON.stringify(msg))
})