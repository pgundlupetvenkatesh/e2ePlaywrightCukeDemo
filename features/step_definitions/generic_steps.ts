import assert, { Assert } from 'assert';
import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from "@playwright/test";
import fs from 'fs'; // Node.js File System module
import path from 'path';
import { getPage, getlog } from '../support/hooks.ts';
import * as helperUtils from '../support/helpers/helper.ts';

// Get __dirname for CommonJS environment
const __dirname = path.dirname(new URL(import.meta.url).pathname);

setDefaultTimeout(30 * 1000);
let page: any;
let log = getlog();

Given("I navigate to Google maps", async () => {
    log.info("I navigate to Google maps step def...")
    page = getPage();
    await page.goto("https://maps.google.com/");
    await expect(page).toHaveTitle(/Google Maps/);
    log.info("Navigated to Google Maps");
});

// I enter 'Sacramento CA' as source
When("I enter {string} as source", async (srcCity: string) => {
    log.info(`Entering source city: ${srcCity}`);
    const srchBox = page.locator('#searchboxinput');
    await expect(srchBox).toBeVisible();
    await srchBox.fill(srcCity);
    await page.keyboard.press('Enter');
    log.info(`Searched for ${srcCity}`);
});

// I should see 'Sacramento' on the side panel
Then("I should see {string} on the side panel", async (location: string) => {
    const loc = page.getByRole('heading').filter({ has: page.getByText(location) })
    await expect(loc).toBeVisible();
    console.log(`I see '${loc}' on the side panel step def...`);
});

// I click the 'Directions' button
When("I click the {string} button", async (btnName: string) => {
    const btn = page.locator('button', { hasText: btnName });
    await expect(btn).toBeVisible();
    await btn.click();
});

// I enter "San Francisco CA" as destination
When("I enter {string} as destination", async (destCity: string) => {
    const txtField = page.getByPlaceholder('Choose starting point, or click on the map...');
    await expect(txtField).toBeVisible();
    await txtField.fill(destCity);

    await page.keyboard.press('Enter');
});

// I should see the url includes "38.171651,-122.6790579" coordinates
Then("I should see the url includes {string} coordinates", async (coords: string) => {
    await page.waitForURL(helperUtils.regex);
    await page.waitForURL(new RegExp(`${coords}`));

    let url: string = page.url();
    const coordinates = await helperUtils.extractCoordinatesFromURL(url);

    assert.strictEqual(coordinates, coords, `The url ${url} contains the coordinates ${coords}`);
});

Then("I should see following source and destination locations in the side panelbar:", async (dataTable) => {
    const locations = dataTable.raw();
    log.info(`Verifying locations in side panel: ${locations}`);
    const searchBox = page.locator('input[class="tactile-searchbox-input"]').filter({visible: true});
    log.info(`Search box value: ${searchBox}`);
    const inputTxt: string[] = await searchBox.evaluateAll((elements: any) => {
    return elements.map((ele: any) => ele.getAttribute('aria-label') || '');
    });
    log.info(`Input text values: ${inputTxt}`);
    inputTxt.forEach((txt: string, index: number) => {
        const exist: boolean = txt.includes(locations[index]);
        assert.ok(exist, `Location ${locations[index]} is present in the side panel`);
    });
});

// I save all routes to a text file "directions.txt"
Then("I save all routes to a text file {string}", async (fileName: string) => {
    log.info(`Saving routes to file: ${fileName}`);
    const modesAttr = page.locator('span[class="Os0QJc google-symbols"]')
    await expect(modesAttr.first()).toBeVisible();
    const dirModes: string[] = await modesAttr.evaluateAll((elements: any) => {
    return elements.map((ele: any) => ele.getAttribute('aria-label') || '');
    });
    const dirTitles = page.locator('h1[id^="section-directions-trip-title-"]')
    const timeDivs = page.locator('div[class^="Fk3sm fontHeadlineSmall"]')
    const milesDivs = page.locator('div[class="ivN21e tUEI8e fontBodyMedium"]')
    await expect(dirTitles.first()).toBeVisible();

    const h1s = await dirTitles.all();
    const time = await timeDivs.all();
    const miles = await milesDivs.all();

    log.info(`Found ${h1s.length} routes`);

    const routes: string[] = [];
    for (let i = 0; i < h1s.length; i++) {
        const mode = i < dirModes.length ? dirModes[i] : 'N/A';
        const route = await h1s[i].innerText();
        const timeText = i < time.length ? await time[i].innerText() : 'N/A';
        const milesText = i < miles.length ? await miles[i].innerText() : 'N/A';
        
        const routeInfo = `Mode: ${mode}\nDirections: ${route}\nTime: ${timeText}\nMiles: ${milesText}`;
        routes.push(routeInfo);
        log.debug(`Route ${i + 1}: ${route}`);
    }
    log.debug(`Route from routes: ${routes}`);

    //Write to file and read content to verify
    const opFile = path.join(__dirname, `../support/output/${fileName}`);
    const content = routes.join('\n---\n')
    try {
        fs.writeFileSync(opFile, content, 'utf-8');
        log.info(`Routes saved to ${opFile}`);
    } catch (err) {
        log.error(`Error writing to file: ${err}`);
    }
    const fileContent = fs.readFileSync(opFile, 'utf-8');
    // expect(fileContent).toBe(content);
    assert.strictEqual(fileContent, content, 'File content matches the routes content');

    log.silly(`Routes saved to file: ${opFile}`);
});