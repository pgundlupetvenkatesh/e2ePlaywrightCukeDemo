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