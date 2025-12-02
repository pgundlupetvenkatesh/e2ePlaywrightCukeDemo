import { Logger } from "tslog";

const log = new Logger({
    type: "pretty",
    prettyLogTemplate: "{{mm}}.{{dd}}.{{yyyy}} {{hh}}:{{MM}}:{{ss}}:{{ms}} {{logLevelName}}[{{name}}]\t",
    name: "e2e-playwright-cuke-demo",
    prettyLogTimeZone: "local"
});

export { log };