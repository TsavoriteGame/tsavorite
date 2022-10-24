import { ipcMain } from 'electron';
import * as fs from 'fs';

export function setupIPC(sendToUI) {

  ipcMain.on('LOG', async (e, data) => {
    if(data.type !== 'error') return;

    const timestamp = new Date().toString();
    fs.appendFileSync('error.log', `[${timestamp}] ${data.message}\n`);
  });

};
