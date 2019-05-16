// Modules to control application life and create native browser window
const {app, BrowserWindow, session} = require('electron')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true
    }
  })


  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

require('./hookCapture')({ app, session })
require('./hookCookieLoading')({ app, session })