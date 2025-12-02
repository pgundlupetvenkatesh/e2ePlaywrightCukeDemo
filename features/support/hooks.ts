import { After, AfterAll, Before, Status, setDefaultTimeout, BeforeAll } from "@cucumber/cucumber";
import { chromium } from "@playwright/test";
import type { Browser, Page, BrowserContext } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { log } from './helpers/logger.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const headlessMode: boolean = process.env.HEADLESS === 'true' ? true : false;

setDefaultTimeout(30 * 1000);

let browser: Browser
let page: Page;
let context: BrowserContext;

BeforeAll(async function () {
    log.silly("Setting up browser...");
    try {
        browser = await chromium.launch({ 
            headless: headlessMode,
            args: ['--start-maximized']
        });
        log.info("Browser launched successfully");
        
        context = await browser.newContext({
            colorScheme: 'dark',
            acceptDownloads: true,
            locale: 'en-US',
            viewport: null
        });
        
        page = await context.newPage();
        log.info("Page created successfully");

        page.on('download', async download => {
            const filePath = path.join(__dirname, './downloads', download.suggestedFilename());
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            await download.saveAs(filePath);
            log.info(`Downloaded file saved to: ${filePath}`);
        });
    } catch (error) {
        log.error("Error launching browser:", error);
        throw error;
    }
});

Before(async function (scenario) {
    log.info(`Starting scenario: ${scenario.pickle.name}`);
});

After(async function (scenario) {
    log.info(`Completed scenario: ${scenario.pickle.name}`);
});

AfterAll(async function () {
    log.info("Closing browser...");
    if (browser) {
        try {
            await context.close();
            await browser.close();
            log.info("Browser closed successfully");
        } catch (error) {
            log.error("Error closing browser:", error);
        }
    }
});

// Export for step definitions to use
export function getPage() {
    if (!page) {
        throw new Error("Page not initialized. BeforeAll hook may have failed.");
    }
    return page;
}
export function getlog() {
    return log;
}