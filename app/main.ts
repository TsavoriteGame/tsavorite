import { app, BrowserWindow, screen, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as rpc from 'discord-rpc';

const Config = require('electron-config');
const config = new Config();

let win: BrowserWindow = null;
const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  const size = screen.getPrimaryDisplay().workAreaSize;

  const opts: any = {
    show: false,
    icon: __dirname + '/favicon.ico',
    minWidth: 1440,
    minHeight: 900
  };

  Object.assign(opts, config.get('winBounds'));

  if(!opts.width) opts.width = size.width;
  if(!opts.height) opts.height = size.height;
  if(!opts.x) opts.x = 0;
  if(!opts.y) opts.y = 0;

  // Create the browser window.
  win = new BrowserWindow({
    ...opts,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
  });

  win.setMenu(null);
  win.once('ready-to-show', win.show);

  win.on('close', () => {
    config.set('winBounds', win.getBounds());
  });

  win.webContents.on("new-window", (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4889');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
       // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  const handleRedirect = (e, url) => {
    console.log(e.sender.getURL(), url);
    if (url !== e.sender.getURL()) {
      e.preventDefault();
      shell.openExternal(url);
    }
  }

  win.webContents.on('will-navigate', handleRedirect);

  const DISCORD_CLIENT_ID = '1024434854663835708';

  rpc.register(DISCORD_CLIENT_ID); // only needed if we want spectate / join / ask to join

  const rpcClient = new rpc.Client({ transport: 'ipc' });
  let startTimestamp: Date;

  const setActivity = () : void => {
    if (!rpcClient || !win) {
      return;
    }

    win.webContents.executeJavaScript('window.discordRPCStatus')
      .then(result => {
        if(!result) {
          rpcClient.clearActivity();
          startTimestamp = null;
          return;
        }

        if(!startTimestamp) {
          startTimestamp = new Date();
        }

        rpcClient.setActivity({
          startTimestamp,
          state: result.state,
          details: result.details || 'Idle',
          largeImageKey: 'game-image'
        });
      });
  };

  rpcClient.on('ready', function () {
    setActivity();

    setInterval(function() {
      setActivity();
    }, 15e3);
  });

  rpcClient
    .login({ clientId: DISCORD_CLIENT_ID })
    .catch(console.error);

} catch (e) {
  // Catch Error
  // throw e;
}
