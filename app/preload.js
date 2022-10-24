const { contextBridge, ipcRenderer } = require('electron');

let functions = {};

contextBridge.exposeInMainWorld(
  'api',
  {
    send: (event, data) => {

      console.log('[Send]', event, data);
      ipcRenderer.send(event, data);
    },

    receive: (event, func) => {

      // cache functions
      functions[event] = func;

      const callFunc = (ev, ...args) => {
        console.log('[Receive]', event, ...args);

        func(...args);
      };

      ipcRenderer.on(event, callFunc);
    }
  }
);
