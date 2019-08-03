// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron')

// console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

// ipcRenderer.on('asynchronous-reply', (event, arg) => {
//   console.log(arg) // prints "pong"
// })
// ipcRenderer.send('asynchronous-message', 'ping')

let command = document.querySelector("#command");
command.focus()

window.addEventListener('keyup', function(e) {
    /* code, see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code */
    if (e.code === "Escape") {
        ipcRenderer.send('command-escape')
    } else if (e.code === "KeyL" && e.altKey) {
        ipcRenderer.send('command-list')
        e.preventDefault()
        e.stopPropagation()
        setTimeout(()=>{
            command.value = ""; //hack to remove special characters by mac's option+l
        }, 20)
    } else if (e.code === "Enter") {
        ipcRenderer.send("command-enter", command.value)
        command.value = ""
    }
}, true)