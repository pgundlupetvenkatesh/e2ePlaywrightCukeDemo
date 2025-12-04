import { chromium, firefox, webkit, type Browser } from "@playwright/test";

const options = {
    headless: process.env.HEADLESS === 'true' ? true : false,
    args: ['--start-maximized']
}

export const launchBrowser = async (browserType?: string) => {
    browserType = process.env.BROWSER || "chrome";
    
    switch (browserType) {
        case "chrome":
            return chromium.launch(options);
        case "firefox":
            return firefox.launch(options);
        case "webkit":
            return webkit.launch(options);
        default:
            throw new Error("Please set the a browser to launch")
    }

}

export const setContext = (browser: Browser) => {
    return browser.newContext({
        colorScheme: 'dark',
        acceptDownloads: true,
        locale: 'en-US',
        viewport: null
    });
}