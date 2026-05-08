import assert, { Assert } from 'assert';
import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from "@playwright/test";
import { getPage, getlog, DEFAULT_TIMEOUT } from '../support/hooks.ts';
import * as helperUtils from '../support/helpers/helper.ts';
import { Common } from '../../pages/common.ts';

setDefaultTimeout(DEFAULT_TIMEOUT);
let page: any;
let log = getlog();
let obj: Common;

Given("I navigate to Google maps", async function () {
    log.info("I navigate to Google maps step def...")
    page = getPage();
    obj = new Common(page);
    const baseUrl = this.parameters.baseUrl;
    await page.goto(baseUrl);
    await expect(page).toHaveTitle(/Google Maps/);
    log.info("Navigated to Google Maps");
});

// I enter 'Sacramento CA' as source
When("I enter {string} as source", async (srcCity: string) => {
    log.info(`Entering source city: ${srcCity}`);
    const srchBox = page.getByRole('combobox', { name: obj.srchBox });
    await obj.fillIn(srcCity, srchBox);
    log.info(`Searched for ${srcCity}`);
});

// I should see 'Sacramento' on the side panel
Then("I should see {string} on the side panel", async (location: string) => {
    const loc = await page.getByRole('heading', { name: location })
    await expect(loc).toBeVisible();
    log.info(`I see '${loc}' on the side panel step def...`);
});

// I click the 'Directions' button
When(/^I click the '(.*)' (radio )?button$/, async (btnName: string, btnType: string) => {
    log.debug(`Looking for ${btnType ? 'radio' : 'button'} with name: ${btnName}`);
    const btn = btnType
        ? page.getByRole('radiogroup').getByRole('radio', { name: new RegExp(`^${btnName}`) })
        : page.getByRole('button', { name: btnName });
    
    log.debug(`${btn} is the button locator object`);
    await expect(btn).toBeVisible();
    log.debug(`Clicking the '${btnName}' ${btnType}`);
    
    await btn.click();
});

// I enter "San Francisco CA" as destination
When("I enter {string} as destination", async (destCity: string) => {
    const txtField = await page.getByPlaceholder(obj.destTxtFieldPlaceholder);
    await obj.fillIn(destCity, txtField);
    const tripTitls = await page.locator(obj.tripTitles);
    log.debug(`Trip titles locator value: ${await tripTitls.first().textContent()}`);
    
    await expect(tripTitls.first()).toBeVisible();
});

// I should see the url includes "38.171651,-122.6790579" coordinates
Then("I should see the url includes {string} coordinates", async (coords: string) => {
    const expectedFormatted = helperUtils.formatToPointOne(coords);

    try {
        // Wait for the URL to contain coordinates that match the expected format.
        // This will retry on every URL change until there is a matche or timeout occurs.
        await page.waitForURL((url: URL) => {
            const coordinates = url.toString().match(helperUtils.regex)?.[0] ?? null;
            if (!coordinates) return false;
            const actualFormatted = helperUtils.formatToPointOne(coordinates);
            log.debug(`URL coords: ${actualFormatted}, expected: ${expectedFormatted}`);
            return actualFormatted === expectedFormatted;
        });
        log.debug(`URL contains expected coordinates: ${expectedFormatted}`);
    } catch (error) {
        log.error(`URL never matched expected coordinates: ${expectedFormatted}. Current URL: ${page.url()}`);
        throw error;
    }
});

Then("I should see following source and destination locations in the searchbars:", async (dataTable) => {
    const locations = dataTable.raw();
    const searchBoxes = page.locator(`${obj.srcTxtBox}, ${obj.destTxtBox}`).filter({ visible: true });
    const inputTxt: string[] = await obj.getValsByEleAttr(searchBoxes);

    inputTxt.forEach((txt: string, index: number) => {
        const exist: boolean = txt.includes(locations[index]);
        assert.ok(exist, `Location ${locations[index]} is present in the searchbars`);
    });
});

// I save all routes to a text file "directions.txt"
Then("I save all routes to a text file {string}", async (fileName: string) => {
    log.info(`Saving routes to file: ${fileName}`);
    const modesAttr = page.locator(obj.trvlModes).first();
    await expect(modesAttr).toBeVisible();
    const dirModes: string[] = await obj.getValsByEleAttr(modesAttr);
    const dirTitles = page.locator(obj.tripTitles);
    const timeDivs = page.locator(obj.tripTimes);
    const milesDivs = page.locator(obj.tripMiles);
    await expect(dirTitles.first()).toBeVisible();
    const [h1s, time, miles] = await Promise.all([dirTitles.all(), timeDivs.all(), milesDivs.all()]);

    const routes = await helperUtils.buildRoutesSummary(h1s, time, miles, dirModes);
    log.debug(`Routes: ${routes}`);

    const content = routes.join('\n---\n')
    const fileContent = await helperUtils.writeToFile(fileName, content);
    // expect(fileContent).toBe(content);
    assert.strictEqual(fileContent, content, 'File content matches the routes content');
});