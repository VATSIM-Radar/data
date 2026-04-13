import {useRuntimeConfig} from "nitropack/runtime";
import {readFileSync} from "node:fs";
import {join} from "path";
import {customDataDirectory, dataDirectory, RadarDataAirline} from "~~/utils";

export default defineCachedEventHandler(async (event) => {
    const airlines: RadarDataAirline[] = JSON.parse(readFileSync(join(dataDirectory, 'airlines.json'), 'utf-8')).list
    const virtualAirlines: RadarDataAirline[] = JSON.parse(readFileSync(join(dataDirectory, 'virtual-airlines.json'), 'utf-8')).list
    const customList: RadarDataAirline[] = JSON.parse(readFileSync(join(customDataDirectory, 'airlines.json'), 'utf-8'))

    for(const airline of customList) {
        const list = airline.virtual ? virtualAirlines : airlines

        const existing  = list.find(x => x.icao === airline.icao);
        if (existing) Object.assign(existing, airline);
        else list.push(airline);
    }

    return {
        airlines,
        virtual: virtualAirlines,
    };
}, {
    maxAge: import.meta.dev ? 1 : 60 * 60 * 24 * 7,
})
