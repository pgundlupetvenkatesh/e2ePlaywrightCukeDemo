import { After, AfterAll, Before, Status, setDefaultTimeout, BeforeAll } from "@cucumber/cucumber";
import { launchBrowser, setContext } from './helpers/browser_manager.ts';
import type { Browser, Page, BrowserContext } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { log } from './helpers/logger.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

setDefaultTimeout(30 * 1000);

let browser: Browser
let page: Page;
let context: BrowserContext;

BeforeAll(async function () {
    log.silly("Setting up browser...");
    try {
        browser = await launchBrowser();
        log.info("Browser launched successfully");
        
        log.info(`browser Type: ${browser.browserType().name()}`);
        context = await setContext(browser);
        
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
    await context.clearCookies();
    log.info(`Starting scenario: ${scenario.pickle.name}`);
});

After(async function (scenario) {
    let tags = scenario.pickle.tags.map(tag => tag.name).join(", ");
    log.info(`Scenario: '${scenario.pickle.name}' with tags: ${tags} ${scenario.result?.status} and had ${scenario.pickle.steps.length} steps.`);
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