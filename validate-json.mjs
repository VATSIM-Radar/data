import {readFileSync} from "node:fs";
import {join} from "path";

const json = JSON.parse(readFileSync(join(import.meta.dirname, 'custom-data', 'airlines.json'), 'utf-8'));

const airlines = (await (await fetch(`https://gng.aero-nav.com/AERONAV/icao_fhairlines?action=get&oper=grid&_search=false&nd=${Date.now()}&rows=10000&page=1&sidx=icao&sord=asc`, {
    responseType: 'json'
})).json()).rows

const allowed = [
    'WTB',
    'MXB',
    'HXB',
    'MBC',
    'SKS',
    'HEC',
    'NBO'
]

for(let i = 0; i < json.length; i++){
    const airline = json[i]

    const duplicateAirline = airlines.find(x => x.icao === airline.icao);

    if (duplicateAirline && (!('virtual' in duplicateAirline) || duplicateAirline.virtual === airline.virtual) && (!allowed.includes(airline.icao) || json.some((x, index) => x.icao === airline.icao && index !== i))) {
        throw new Error(`${airline.icao} virtual airline already exists`)
    }
    airlines.push(airline)
}
