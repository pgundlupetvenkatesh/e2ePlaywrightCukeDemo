import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class Common {
    private readonly page: Page
    srchBox = '#searchboxinput';
    destTxtFieldPlaceholder = 'Choose starting point, or click on the map...';
    srcDestSidePanel = "div[id='section-directions-trip-details-msg-0']";
    trvlModes = "span[class='Os0QJc google-symbols']";
    tripTitles = "h1[id^='section-directions-trip-title-']";
    tripTimes = "div[class^='Fk3sm fontHeadlineSmall']";
    tripMiles = "div[class='ivN21e tUEI8e fontBodyMedium']";

    constructor(page: Page) {
        this.page = page;
    }

    async fillIn(val: string, field: Locator) {
        await expect(field).toBeVisible();
        await field.fill(val);
        await this.page.keyboard.press('Enter');
    }

    async getValsByEleAttr(locatorStr: Locator, attr: string = 'aria-label'): Promise<string[]> {
        const values: string[] = await locatorStr.evaluateAll((elements, attribute) => {
            return elements.map((ele: any) => ele.getAttribute(attribute) || '');
        }, attr);
        
        return values;
    }
};