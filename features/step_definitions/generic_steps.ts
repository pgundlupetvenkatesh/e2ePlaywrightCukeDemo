import assert, { Assert } from 'assert';
import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from "@playwright/test";
import { getPage, getlog } from '../support/hooks.ts';
import * as helperUtils from '../support/helpers/helper.ts';
import { Common } from '../../pages/common.ts';

setDefaultTimeout(30 * 1000);
let page: any;
let log = getlog();
let obj: Common;

Given("I navigate to Google maps", async () => {
    log.info("I navigate to Google maps step def...")
    page = getPage();
    obj = new Common(page);
    await page.goto("https://maps.google.com/");
    await expect(page).toHaveTitle(/Google Maps/);
    log.info("Navigated to Google Maps");
});

// I enter 'Sacramento CA' as source
When("I enter {string} as source", async (srcCity: string) => {
    log.info(`Entering source city: ${srcCity}`);
    const srchBox = page.locator(obj.srchBox);
    await obj.fillIn(srcCity, srchBox);
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
    const txtField = await page.getByPlaceholder(obj.destTxtFieldPlaceholder);
    await obj.fillIn(destCity, txtField);
});

// I should see the url includes "38.171651,-122.6790579" coordinates
Then("I should see the url includes {string} coordinates", async (coords: string) => {
    try {
        await page.waitForURL(helperUtils.regex);
        log.info("URL matches coordinate regex pattern");
    } catch (error) {
        log.error(`URL does not match expected coordinate regex pattern: ${helperUtils.regex}`);
        throw error; // Re-throw to fail the test
    }

    try {
        await page.waitForURL(new RegExp(`${coords}`));
        log.info(`URL contains expected coordinates: ${coords}`);
    } catch (error) {
        log.error(`URL does not contain expected coordinates: ${coords}`);
        throw error; // Re-throw to fail the test
    }

    let url: string = page.url();
    const coordinates = await helperUtils.extractCoordinatesFromURL(url);

    assert.strictEqual(coordinates, coords, `The url ${url} contains the coordinates ${coords}`);
});

Then("I should see following source and destination locations in the side panelbar:", async (dataTable) => {
    const locations = dataTable.raw();
    log.info(`Verifying locations in side panel: ${locations}`);
    const searchBox = page.locator(obj.srcDestSidePanel).filter({visible: true});
    log.info(`Search box value: ${searchBox}`);
    const inputTxt: string[] = await obj.getValsByEleAttr(searchBox);
    log.info(`Input text values: ${inputTxt}`);
    inputTxt.forEach((txt: string, index: number) => {
        const exist: boolean = txt.includes(locations[index]);
        assert.ok(exist, `Location ${locations[index]} is present in the side panel`);
    });
});

// I save all routes to a text file "directions.txt"
Then("I save all routes to a text file {string}", async (fileName: string) => {
    log.info(`Saving routes to file: ${fileName}`);
    const modesAttr = page.locator(obj.trvlModes)
    await expect(modesAttr.first()).toBeVisible();
    const dirModes: string[] = await obj.getValsByEleAttr(modesAttr);
    const dirTitles = page.locator(obj.tripTitles)
    const timeDivs = page.locator(obj.tripTimes)
    const milesDivs = page.locator(obj.tripMiles)
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

    const content = routes.join('\n---\n')
    const fileContent = await obj.writeToFile(fileName, content);
    // expect(fileContent).toBe(content);
    assert.strictEqual(fileContent, content, 'File content matches the routes content');
});