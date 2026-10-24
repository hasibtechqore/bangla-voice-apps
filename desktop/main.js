// SEO Academy Bangla Voice — desktop wrapper (Electron).
// Loads the live website. The custom user-agent string "BanglaVoiceApp" is
// how the website knows it runs inside the app: the theme hides the
// "Download App" section whenever this string is present, so the download
// buttons appear only in a real browser, never inside the app itself.
const { app, BrowserWindow, shell } = require('electron');

const SITE_URL = 'https://seoacademybanglavoice.blogspot.com/';
const APP_UA = 'BanglaVoiceApp/1.0';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'SEO Academy Bangla Voice',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadURL(SITE_URL, { userAgent: APP_UA });

  // Open external links (Facebook, WhatsApp, etc.) in the system browser,
  // never inside the app window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(SITE_URL) && !url.includes('seoacademybangla.top')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
