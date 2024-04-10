import { cors } from "@elysiajs/cors";
import { cron } from '@elysiajs/cron';
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import type { Elysia } from "elysia";
import { ip } from "elysia-ip";

import { deleteExpireLinks } from "./cron/ShortLinkCron";

export function setup(app: Elysia) {
	app
    .use(swagger())
    .use(serverTiming())
    .use(cors())
    .use(cron(deleteExpireLinks))
    .use(ip())
}
