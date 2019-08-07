'use strict';
import path from "path";
import { app, protocol, BrowserWindow, globalShortcut, ipcMain, dialog, Tray, Menu , Dialog} from 'electron';
import winston from "winston";
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
const isDevelopment = process.env.NODE_ENV !== 'production';
import assert from "assert";

import parseSchedule from './scheduler/parseSchedule';
import { get_tonight, get_tomorrow } from "./scheduler/time_utils";

import scheduler from "./scheduler/Scheduler";

declare const __static:string;

(global as any).scheduler = scheduler;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let commandWindow: BrowserWindow | null = null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

let scheduleListWindow: BrowserWindow | null = null;

function createScheduleListWindow() {
    if (!scheduleListWindow) {
        console.log('creating schedule list window');

        scheduleListWindow = new BrowserWindow({
            show: false,
            // width: 800,
            width: 1200,
            height: 800,
            transparent: true,
            frame: false,
            skipTaskbar: true,
            webPreferences: {
                nodeIntegration: true,
            },
        });

        if (process.env.WEBPACK_DEV_SERVER_URL) {
            // Load the url of the dev server if in development mode
            scheduleListWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string + "schedules");
            if (!process.env.IS_TEST) { scheduleListWindow.webContents.openDevTools() }
        } else {
            // Load the index.html when not in development
            // console.log('load url');
            scheduleListWindow.loadURL('app://./schedules.html');
        }
        // scheduleListWindow.webContents.openDevTools()

        // BrowserWindow.addDevToolsExtension(path.join(__dirname, "./extensions/vuejsdevtool/3.1.6_0"));

        scheduleListWindow.on('closed', function () {
            scheduleListWindow = null;
        });

        scheduleListWindow.webContents.on('devtools-opened', () => {
            scheduleListWindow!.webContents.addWorkSpace(__dirname);
        });

        ipcMain.on('schedules-escape', () => {
            if (process.env.WEBPACK_DEV_SERVER_URL) {
                scheduleListWindow && scheduleListWindow!.destroy();
                scheduleListWindow = null;
            } else {
                scheduleListWindow!.hide();
            }
        });

        /*see https://electron.atom.io/docs/api/web-contents/*/
        scheduleListWindow.webContents.on('did-finish-load', async () => {
            const schedules = await scheduler.list();
            scheduleListWindow!.webContents.send('schedules', schedules);
            scheduleListWindow!.show();
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
        commandWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string + "command");
        // if (!process.env.IS_TEST) { commandWindow.webContents.openDevTools() }
    } else {
        createProtocol('app');
        // Load the index.html when not in development
        // console.log('load url');
        commandWindow.loadURL('app://./command.html');
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
        createScheduleListWindow()
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
                try{
                const schedule = parseSchedule(raw_command);
                assert(schedule, "Wrong command: " + raw_command);
                /* This works because CouchDB/PouchDB _ids are sorted lexicographically. */
                winston.info("parsedCommand");
                // @ts-ignore
                winston.info(schedule);
                if (schedule) {
                    scheduler.add(schedule!);
                    console.log('ADDED new Schedule', schedule.task);
                }
                }catch(err){
                    const error = err as Error;
                    dialog.showErrorBox("错误命令", error.message);
                }
        }
    });
}


scheduler.on('due', function (schedule) {
    dialog.showMessageBox({
        type: 'info',
        // icon: './static/timer.png', //has problem with mac, disable for now
        message: schedule.task,
        detail: schedule.task + "\r\n" + schedule.due.toLocaleString(),
        cancelId: 1, // same as remind
        defaultId: 1,
        buttons: ['Mark as Complete', "In 10 mins", "In 1 Hour", "Tonight", "Tomorrow", "Next Week"]
    }, function (btn_index) {
        if (btn_index === 0) {
            scheduler.complete(schedule);
        } else if (btn_index >= 1) {
            switch (btn_index) {
                case 2:
                    schedule.due.setHours(schedule.due.getHours() + 1)
                    break
                case 3:
                    schedule.due = get_tonight()
                case 4:
                    schedule.due = get_tomorrow()
                    break
                case 5:
                    schedule.due.setDate(schedule.due.getDate() + 7)
                    break
                case 1:
                    schedule.due.setMinutes(schedule.due.getMinutes() + 10)
                default:
                    break
            }
            scheduler.update_due(schedule)
        }
    })
})


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


let scheduleSubMenu = null
let tray: Tray | null = null;


const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (commandWindow) {
            if (commandWindow.isMinimized()) commandWindow.restore()
            commandWindow.focus()
        }
    })


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

    app.on('ready', () => {
        tray = new Tray(path.join(__static, 'Icon-Small.png'))
        tray.setToolTip('Time it')
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Close', type: 'normal', role: 'quit' }
        ])

        tray.setContextMenu(contextMenu)
        tray.on('double-click', function () {
            dialog.showMessageBox({
                type: 'warning',
                message: 'Close Timeit?',
                detail: 'Are you sure?',
                buttons: ['OK', 'NO']
            }, function (btn_index) {
                if (btn_index === 0) {
                    app.quit()
                }
            })
        })
    })

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
    scheduler.init();

}

