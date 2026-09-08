import {readFileSync} from "node:fs";
import {join} from "path";
import {customDataDirectory} from "~~/utils/index";
import sharp from "sharp";

export interface OverrideEntry {
    url: string;
    invert?: boolean;
}

// Fallback chain used when no override is set for an airline code.
export const LOGO_SOURCES = [
    'https://raw.githubusercontent.com/Jxck-S/airline-logos/main/flightaware_logos',
    'https://raw.githubusercontent.com/Jxck-S/airline-logos/main/fr24_banners',
    'https://raw.githubusercontent.com/Jxck-S/airline-logos/main/radarbox_logos',
];

// Logos are processed at up to 128x128 and displayed at 24x24 via CSS.
export const MAX_PROCESS_SIZE = 128;

// Pixels darker than this brightness are brightened to white for dark mode visibility.
export const BRIGHTNESS_THRESHOLD = 64;

// User-provided overrides (URL overrides and per-airline processing flags).
export const airlineLogoOverrides = JSON.parse(
    readFileSync(join(customDataDirectory, 'airline-logo.json'), 'utf-8'),
) as Record<string, string | OverrideEntry>;

// Enumerate available airline codes from the upstream logo repository.
// Only used to bootstrap generation (no committed logos yet) or when forced.
export async function fetchRemoteCodes(): Promise<Set<string>> {
    const codes = new Set<string>();

    for (const directory of ['flightaware_logos', 'fr24_banners', 'radarbox_logos']) {
        try {
            const response = await fetch(`https://api.github.com/repos/Jxck-S/airline-logos/contents/${ directory }`);
            if (!response.ok) continue;

            const files: Array<{ name: string }> = await response.json();
            for (const file of files) {
                const code = file.name.replace(/\.png$/i, '');
                if (/^[A-Z]{3}$/.test(code)) codes.add(code);
            }
        }
        catch {
            // Network failures are non-fatal; generation continues with committed logos only.
        }
    }

    return codes;
}

export async function downloadLogo(url: string): Promise<Buffer | null> {
    try {
        const response = await fetch(url, { redirect: 'follow' });
        if (!response.ok) return null;

        return Buffer.from(await response.arrayBuffer());
    }
    catch {
        return null;
    }
}

// Resize and optionally brighten dark pixels to white, replicating the former
// client-side canvas thresholding so logos stay visible in dark mode.
export async function processLogo(input: Buffer, invert: boolean): Promise<Buffer> {
    const metadata = await sharp(input).metadata();
    if (!metadata.width || !metadata.height) throw new Error('Invalid image dimensions');

    const scale = Math.min(MAX_PROCESS_SIZE / metadata.width, MAX_PROCESS_SIZE / metadata.height);
    const width = Math.max(1, Math.round(metadata.width * scale));
    const height = Math.max(1, Math.round(metadata.height * scale));

    const pipeline = sharp(input)
        .resize({ width, height, fit: 'inside', withoutEnlargement: true });

    return pipeline.png().toBuffer();
}

export function resolveOverrides(code: string): { url: string; invert: boolean } | null {
    const entry = airlineLogoOverrides[code];
    if (!entry) return null;

    if (typeof entry === 'string') return { url: entry, invert: true };

    return {
        url: entry.url,
        invert: entry.invert ?? true,
    };
}