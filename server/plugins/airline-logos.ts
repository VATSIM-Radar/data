import {defineCronJob} from "../../utils/cron";
import {join} from "path";
import {dataDirectory} from "~~/utils";
import {existsSync, mkdirSync, readdirSync, writeFileSync} from "node:fs";
import {downloadLogo, fetchRemoteCodes, LOGO_SOURCES, processLogo, resolveOverrides} from "~~/utils/airline-logos";

export let airlineLogos: Set<string> = new Set()

const date = new Date()
const force = date.getFullYear() === 2026 && date.getMonth() === 8 && date.getDate() === 8

export default defineNitroPlugin(() => {
    defineCronJob('0 0 * * *', async () => {
        const dataPath = join(dataDirectory, 'logos');
        mkdirSync(dataPath, {recursive: true})

        let codes = new Set<string>();
        for (const file of readdirSync(dataPath)) {
            if (file.endsWith('.png')) codes.add(file.slice(0, -4));
        }

        const remoteCodes = await fetchRemoteCodes();
        if (remoteCodes.size > 0) codes = remoteCodes;

        const manifest: string[] = [];

        for (const code of codes) {
            const filePath = join(dataPath, `${code}.png`);

            if (!force && existsSync(filePath)) {
                manifest.push(code);
                continue;
            }

            const override = resolveOverrides(code);
            const sources = override ? [override.url] : LOGO_SOURCES.map(source => `${source}/${code}.png`);
            const invert = override?.invert ?? true;

            for (const source of sources) {
                const image = await downloadLogo(source);
                if (!image) continue;

                try {
                    const processed = await processLogo(image, invert);
                    writeFileSync(filePath, processed);
                    manifest.push(code);
                    console.log(manifest.length)
                    break;
                } catch (e) {
                    console.error(e);
                }
            }
        }

        console.log(manifest.length)
        airlineLogos = new Set(manifest)
    })
})