import path from 'path';
import fs from 'fs';
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