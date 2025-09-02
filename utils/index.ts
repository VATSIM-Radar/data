import {join} from 'path'
import {readFileSync} from "node:fs";

export const dataDirectory = join(process.cwd(), 'data')
export const customDataDirectory = join(process.cwd(), 'custom-data')

export function readFileOrFail(...args: Parameters<typeof readFileSync>) {
    try {
        readFileSync(...args)
    } catch {
        return null
    }
}

export interface RadarDataAirline {
    icao: string
    name: string
    callsign: string
    virtual: boolean
}
