import { Injectable } from '@angular/core';
import { ElectronService } from '../electron/electron.service';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor(private electronService: ElectronService) {
    this.init();
  }

  init() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.error(error.stack);
    };
  }

  log(...message): void {
    console.log(...message);

    if(this.electronService.isElectron) {
      this.electronService.ipcRenderer.send('LOG', { type: 'log', message });
    }
  }

  info(...message): void {
    console.info(...message);

    if(this.electronService.isElectron) {
      this.electronService.ipcRenderer.send('LOG', { type: 'info', message });
    }
  }

  error(...message): void {
    console.error(...message);

    if(this.electronService.isElectron) {
      this.electronService.ipcRenderer.send('LOG', { type: 'error', message });
    }
  }
}
