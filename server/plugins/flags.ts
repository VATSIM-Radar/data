import {defineCronJob} from "../../utils/cron";
import {join} from "path";
import {customDataDirectory, dataDirectory} from "~~/utils";
import {readFileSync, writeFileSync} from "node:fs";

// Downloads the country flags used by the pilot overlays from flagcdn.com
// into `public/flags/{code}.png` so the app does not depend on an external
// CDN at runtime. Run via `yarn fetch:flags`.
interface CountryCodeEntry {
    prefix: string;
    countryCode: string;
    name?: string;
    afterPrefixLength?: number;
}

const SOURCE = (code: string) => `https://flagcdn.com/w160/${ code }.png`;
const OUTPUT = join(dataDirectory, 'flags');

export let countries: Set<string> = new Set()

export default defineNitroPlugin(() => {
    defineCronJob('0 0 * * *', async () => {
        const entries = JSON.parse(readFileSync(join(customDataDirectory, 'country-codes.json'), 'utf-8')) as CountryCodeEntry[];
        const codes = [...new Set(entries.map(entry => entry.countryCode.toLowerCase()))];

        let downloaded = 0;
        let failed = 0;

        for (const code of codes) {
            const filePath = join(OUTPUT, `${ code }.png`);

            try {
                const response = await fetch(SOURCE(code));
                if (!response.ok) {
                    console.log(response.url)
                    response.text().catch(console.error).then(console.log)
                    console.error(`Failed (${ response.status }): ${ code }`);
                    failed++;
                    continue;
                }

                const buffer = Buffer.from(await response.arrayBuffer());
                writeFileSync(filePath, buffer);
                countries.add(code)
                downloaded++;
            }
            catch (error) {
                console.error(`Failed: ${ code }`, error);
                failed++;
            }
        }

        console.log(`Done: ${ downloaded } downloaded, ${ failed } failed.`);
    })
})