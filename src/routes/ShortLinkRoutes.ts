import type { Elysia } from "elysia";
import { t } from "elysia";
import { createShortLink, getShortLink, getShortLinksCount } from "../controllers/ShortLinkController";
import type { RequestParams, RequestWithBody } from "../types";
import { rateLimiter } from '../utils/RateLimiter';
import { addClient, removeClient } from '../utils/notifications';

const shortLinkRoutes = (app: Elysia) => {
    app.get(
        "/short-link/:shortUrl",
        async ({ ip, params: { shortUrl }, headers, set }: RequestParams) => {
            rateLimiter(ip?.address)

            const res = await getShortLink(shortUrl, headers?.["x-security-token"] ?? "")

            set.status = Number(res.status || 200);

            return res
        },
        {
            headers: t.Object({
                'x-security-token': t.Optional(t.String())
            }),
            detail: {
                summary: "Get the number of short links",
                tags: ["short-links"]
            }
        }
    )
    app.post(
		"/short-links",
        async ({ body, set }: RequestWithBody) => {
            const res = await createShortLink(body.url, body.shortUrl, body?.userId, body?.expirationDate)

            set.status = Number(res.status || 201)

            return res
		},
		{
			body: t.Object(
				{
					url: t.String(),
                    shortUrl: t.String(),
                    userId: t.Optional(t.Number()),
                    expirationDate: t.Optional(t.Date())
				},
				{
					description: "Expected a url"
				}
			),
			detail: {
				summary: "Create a new short link",
				tags: ["short-links"]
			}
		}
	)
    app.get(
        "/short-links/count",
        async ({ ip, set }: RequestParams) => {
            rateLimiter(ip?.address)

            const res = await getShortLinksCount()

            set.status = Number(200);

            return res
        },
        {
            detail: {
                summary: "Get the number of short links",
                tags: ["short-links"]
            }
        }
    )
    app.ws('/short-links/ws-count', {
        open(ws) {
            addClient(ws);
            getShortLinksCount().then((count) => {
                ws.send(JSON.stringify({ type: 'shortLinksCount', count }));
            });
        },
        close(ws) {
            removeClient(ws);
        },
        message(ws, message) {
            ws.send({
                message,
                time: Date.now()
            });
        }
    });
}

export default shortLinkRoutes
