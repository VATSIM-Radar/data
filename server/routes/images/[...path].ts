// server/routes/uploads/[...path].ts

import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { resolve, sep } from 'node:path'
import { sendStream, setHeader, createError } from 'h3'
import {join} from "path";
import {dataDirectory} from "~~/utils";

const root = join(dataDirectory)

export default defineEventHandler(async (event) => {
    if (
        handleCors(event, {
            origin: '*',
            methods: ['GET', 'HEAD', 'OPTIONS'],
        })
    ) {
        return
    }

    const path = getRouterParam(event, 'path') ?? ''

    const filePath = resolve(root, path)

    // защита от ../
    if (!filePath.startsWith(root + sep)) {
        throw createError({ statusCode: 403 })
    }

    try {
        const fileStat = await stat(filePath)

        if (!fileStat.isFile()) {
            throw createError({ statusCode: 404 })
        }

        if(!filePath.endsWith('.png'))    throw createError({ statusCode: 404 })

        return sendStream(event, createReadStream(filePath))
    } catch {
        throw createError({ statusCode: 404 })
    }
})