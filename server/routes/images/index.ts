import {airlineLogos} from "~/plugins/airline-logos";
import {countries} from "~/plugins/flags";
import {customDataDirectory} from "~~/utils";
import {join} from "path";
import {readFileSync} from "node:fs";

const countriesData = JSON.parse(readFileSync(join(customDataDirectory, 'country-codes.json'), 'utf-8'))

export default defineCachedEventHandler(() => {
    return {
        airlines: Array.from(airlineLogos),
        countries: Array.from(countries),
        countriesData,
    };
}, {
    maxAge: import.meta.dev ? 1 : 60 * 60 * 24 * 7,
})
