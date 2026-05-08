import path from 'path';
import fs from 'fs';
import type { Locator } from '@playwright/test';
import { getlog } from '../hooks.ts';

let log = getlog();
export const regex = /[-+]?(?:[1-8]?\d(?:\.\d+)?|90(\.0+)?),\s*[-+]?(?:180(\.0+)?|(?:(?:1[0-7]\d)|([1-9]?\d))(?:\.\d+)?)/

export const extractCoordinatesFromURL = async (url: string): Promise<string | null> => {
    log.info(`Page URL: ${url}`);
    const matches = url.match(regex);

    if(matches) {
        const returnMatches = matches[0].split(',');
        const lat = returnMatches[0]
        const long = returnMatches[1]
        log.info(`Latitude,Longitude: ${lat},${long}`);
        return `${lat},${long}`;
    }
    else {
        log.warn(`Coordinates didn't match with regex`);
    }

    return null;
}

//Write to file and read content to verify
export async function writeToFile(fileName: string, data: string) {
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const opFile = path.join(__dirname, `../output/${fileName}`);

    try {
        fs.writeFileSync(opFile, data, 'utf-8');
        log.silly(`Routes saved to ${opFile}`);
    } catch (err) {
        log.error(`Error writing to file: ${err}`);
    }

    return fs.readFileSync(opFile, 'utf-8');
}

export const formatToPointOne = (str: any) => {
    return str.split(',').map((num: string) => num.replace(/(\.\d).*$/, '$1')).join(',');
}

export const buildRoutesSummary = async (h1s: Locator[], time: Locator[], miles: Locator[], dirModes: string[]): Promise<string[]> => {
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
    
    return routes;
}