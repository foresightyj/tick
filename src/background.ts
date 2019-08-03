'use strict';

import url from "url";
import path from "path";
import { app, protocol, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import winston from "winston";
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
const isDevelopment = process.env.NODE_ENV !== 'production';

import Schedule from "./scheduler/Schedule";
// import scheduler from "./scheduler/Scheduler";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let commandWindow: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

let scheduleListWindow: BrowserWindow | null;

import "./testorm";

function createScheduleListWindow() {
    if (scheduleListWindow === null) {
        scheduleListWindow = new BrowserWindow({
            width: 800,
            height: 800,
            // fullscreen : true,
            icon: './static/AppIcon40x40@2x.png',
            skipTaskbar: true,
        });
        scheduleListWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'ui/schedules/schedules.html'),
            protocol: 'file:',
            slashes: true,
        }));

        // scheduleListWindow.webContents.openDevTools()

        // BrowserWindow.addDevToolsExtension(path.join(__dirname, "./extensions/vuejsdevtool/3.1.6_0"));

        scheduleListWindow.on('closed', function () {
            scheduleListWindow = null;
        });

        scheduleListWindow.webContents.on('devtools-opened', () => {
            scheduleListWindow!.webContents.addWorkSpace(__dirname);
        });

        ipcMain.on('schedules-escape', () => {
            scheduleListWindow!.hide();
        });

        /*see https://electron.atom.io/docs/api/web-contents/*/
        scheduleListWindow.webContents.on('did-finish-load', () => {
            // scheduler.list(function(err, schedules) {
            // if (err) {
            //     winston.error(err);
            // } else {
            //     scheduleListWindow!.webContents.send('schedules', schedules);
            // }
            // });
        });
    } else {
        scheduleListWindow.isVisible() ? scheduleListWindow.hide() : scheduleListWindow.show();
    }
}

function createCommandWindow() {
    // Create the browser window.
    commandWindow = new BrowserWindow({
        show: false,
        backgroundColor: '#535a60',
        width: 400,
        height: 60,
        transparent: true,
        frame: false,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        commandWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
        if (!process.env.IS_TEST) { commandWindow.webContents.openDevTools() }
    } else {
        createProtocol('app');
        // Load the index.html when not in development
        // console.log('load url');
        commandWindow.loadURL('app://./index.html');
    }

    commandWindow.on('closed', () => {
        commandWindow = null;
    });

    ipcMain.on('command-escape', () => {
        // see https://electron.atom.io/docs/api/ipc-main/
        commandWindow && commandWindow.hide();
    });

    ipcMain.on('command-list', () => {
        // see https://electron.atom.io/docs/api/ipc-main/
        commandWindow && commandWindow.hide();
        // createScheduleListWindow()
    });

    ipcMain.on('command-enter', (event: string, raw_command: string) => {
        commandWindow && commandWindow.hide();
        raw_command = raw_command.trim();
        const first_token = raw_command.split(/\s+/, 1)[0];
        switch (first_token) {
            case 'list':
                createScheduleListWindow();
                break;
            case 'quit':
            case 'exit':
                app.quit();
                break;
            case 'reboot':
            case 'restart':
                app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
                app.exit(0);
                break;
            default:
                const schedule = Schedule.parseCommand(raw_command);
                if (!schedule) {
                    alert("Wrong command: " + raw_command);
                    break;
                }
                /* This works because CouchDB/PouchDB _ids are sorted lexicographically. */
                winston.info("parsedCommand");
                // @ts-ignore
                winston.info(schedule);
            // scheduler.add(schedule);
        }
    });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (commandWindow === null) {
        createCommandWindow();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // disable due to GFW
        // Install Vue Devtools
        // try {
        //     await installVueDevtools(); 
        // } catch (e) {
        //     console.error('Vue Devtools failed to install:', e.toString());
        // }
    }
    createCommandWindow();
    console.log('Started successfully. Register shortcuts!');
    globalShortcut.register('alt+s', function () {
        if (commandWindow) {
            commandWindow.isVisible() ? commandWindow.hide() : commandWindow.show();
            if (scheduleListWindow) {
                scheduleListWindow.isVisible() ? scheduleListWindow.hide() : commandWindow.show();
            }
        }
    });
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit();
            }
        });
    } else {
        process.on('SIGTERM', () => {
            app.quit();
        });
    }
}
