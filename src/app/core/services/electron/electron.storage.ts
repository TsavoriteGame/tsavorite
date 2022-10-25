import { Injectable } from '@angular/core';
import { StorageEngine } from '@ngxs/storage-plugin';
import { debounceTime, Subject } from 'rxjs';
import { ElectronService } from './electron.service';


@Injectable({
  providedIn: 'root'
})
export class ElectronStorageService implements StorageEngine {

  private readonly savefile = 'profile.tsavfile';
  private readonly queue = new Subject<any>();
  private memoryFile = {};

  get length(): number {
    if(this.electronService.isElectron) {
      return window.localStorage.length;
    }

    return Object.keys(this.memoryFile).length;
  }

  constructor(private electronService: ElectronService) {
    this.init();
  }

  private init() {
    if(!this.electronService.isElectron) {
      return;
    }

    if(this.electronService.fs.existsSync(this.savefile)) {
      const loadData = this.electronService.fs.readFileSync(this.savefile, 'utf-8');
      this.memoryFile = JSON.parse(loadData);
    }

    this.queue.pipe(
      debounceTime(5000)
    ).subscribe(state => this.writeFile(state));
  }

  getItem(key: string) {
    if(!this.electronService.isElectron) {
      return window.localStorage.getItem(key);
    }

    return this.memoryFile[key];
  }

  setItem(key: string, val: any): void {
    if(!this.electronService.isElectron) {
      window.localStorage.setItem(key, val);
      return;
    }

    this.memoryFile[key] = val;
    this.queueUpdate();
  }

  removeItem(key: string): void {
    if(!this.electronService.isElectron) {
      window.localStorage.removeItem(key);
      return;
    }

    delete this.memoryFile[key];
    this.queueUpdate();
  }

  clear(): void {
    if(!this.electronService.isElectron) {
      window.localStorage.clear();
      return;
    }

    this.memoryFile = {};
    this.queueUpdate();
  }

  private queueUpdate() {
    this.queue.next(this.memoryFile);
  }

  private writeFile(data: any, file = this.savefile) {
    const writeData = JSON.stringify(data, null, 4);
    this.electronService.fs.writeFileSync(`${file}.bak`, writeData);
    this.electronService.fs.copyFileSync(`${file}.bak`, `${file}`);
    this.electronService.fs.unlinkSync(`${file}.bak`);
  }

}
