// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import { ipcRenderer } from 'electron';

const command = document.querySelector('#command') as HTMLInputElement;

command.focus();

window.addEventListener('keyup', e => {
    /* code, see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code */
    if (e.code === 'Escape') {
        ipcRenderer.send('command-escape');
    } else if (e.code === 'KeyL' && e.altKey) {
        ipcRenderer.send('command-list');
        e.preventDefault();
        e.stopPropagation();
        setTimeout(() => {
            command.value = ''; // hack to remove special characters by mac's option+l
        }, 20);
    } else if (e.code === 'Enter') {
        ipcRenderer.send('command-enter', command.value);
        command.value = '';
    }
}, true);