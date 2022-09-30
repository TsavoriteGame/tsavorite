import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  log(...message): void {
    console.log(...message);
  }

  error(...message): void {
    console.error(...message);
  }
}
