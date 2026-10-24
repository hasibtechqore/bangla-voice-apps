// SEO Academy Bangla Voice — desktop wrapper (Electron).
// Loads the live website directly on its custom domain. The custom
// user-agent marker "BanglaVoiceApp" is how the website knows it runs
// inside the app: the theme hides the "Download App" section whenever
// this string is present, so the download buttons appear only in a real
// browser, never inside the app itself.
const { app, BrowserWindow, shell, Menu } = require('electron');

const SITE_URL = 'https://www.seoacademybangla.top/';
const SITE_HOSTS = ['www.seoacademybangla.top', 'seoacademybangla.top', 'seoacademybanglavoice.blogspot.com'];
const APP_UA = 'BanglaVoiceApp/1.0';

// Remove Electron's default menu bar (File / Edit / View / Window /
// Help) so the app window shows only the website, like a real app.
Menu.setApplicationMenu(null);

function isSiteUrl(url) {
  try {
    return SITE_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

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

  // Append the marker to the DEFAULT user-agent (do not replace it) and
  // keep it for every navigation in this window, so the site always
  // recognises the app — including after redirects.
  win.webContents.setUserAgent(win.webContents.getUserAgent() + ' ' + APP_UA);

  win.loadURL(SITE_URL);

  // Any link that would leave the site — including same-window clicks
  // (e.g. a download button) and new windows — opens in the system
  // browser instead of hijacking the app window.
  win.webContents.on('will-navigate', (event, url) => {
    if (!isSiteUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!isSiteUrl(url)) {
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
