# e2ePlaywrightCukeDemo
This demo was built and tested in `iOS Mac Pro` so all below installers and dependencies related to that.

### Dependencies
* Install Playwright Test for VSCode
* Install NodeJS and npm
* Playwright: `npm init playwright@latest`
* Cucumber: `npm i @cucumber/cucumber -D`
* TypeScript exec for Node.js: `npm i ts-node -D`
* tsLog as Logger

Press `command` + `,` to open Settings and search for `cucumber`. Edit `settings.json` and update features path in `cucumber.features` and step defs path in `cucumber.glue`.
```
"src/test/**/*.feature",
"tests/**/*.feature",
"*specs*/**/*.feature"
```
## Running Test
Run `npm test -- --tags @google-map` command in the terminal to kick the Cucumber feature test. 

## Testing
All routes data will be saved in `features/support/output/routes.txt` file.

## Report
`cucumber-report.html` file gets created in project home directory
![alt text](image.png)

## ToDo
1. Browser context(desired capabilities)
3. Screenshot on failure