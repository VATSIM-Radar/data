# VATSIM Radar data

## Airlines List

```typescript
interface RadarDataAirline {
    icao: string
    name: string
    callsign: string
    virtual: boolean
}
```

- https://data.vatsim-radar.com/airlines
- https://data.vatsim-radar.com/airlines/all

Source: https://gng.aero-nav.com/

- When making a PR, use /custom-data/airlines.json to propose your changes
- Other files in data are auto-generated
- Trying to make VA to show on VR via remarks? Add it to custom-data, or to https://gng.aero-nav.com/AERONAV/icao_fhairlines

Data updates within 7 days after merge.
