import type { Elysia } from "elysia";
import { t } from "elysia";
import type { RequestParams, RequestQuery, RequestWithBody } from "../types";
import { Stream } from '@elysiajs/stream'
import { rateLimiter } from '../utils/RateLimiter';
import { 
    createShortLink, 
    getShortLinkByShortCode, 
    getShortLinksCount, 
    getClicksCount,
    getBrandedLinksCount,
    getShortLinkByQuery 
} from "../controllers/ShortLinkController";
import { addClient, removeClient } from '../utils/notifications';

const shortLinkRoutes = (app: Elysia) => {
    app.get(
        "/short-link/:shortCode",
        async ({ ip, params: { shortCode }, headers, set }: RequestParams) => {
            rateLimiter(ip?.address)

            const res = await getShortLinkByShortCode(shortCode, headers?.["x-security-token"] ?? "")

            set.status = Number(res.status || 200);

            return res
        },
        {
            headers: t.Object({
                'x-security-token': t.Optional(t.String())
            }),
            detail: {
                summary: "Get data of a short link",
                tags: ["short-links"]
            }
        }
    )
    app.get(
        "/short-links",
        async ({ ip, query, set }: RequestQuery) => {
            rateLimiter(ip?.address)

            const res = await getShortLinkByQuery(query.shortCodes)

            set.status = Number(res.status || 200);

            return res
        },
        {
            query: t.Object({
                shortCodes: t.String(),
            }),
            headers: t.Object({
                'x-security-token': t.Optional(t.String())
            }),
            detail: {
                summary: "Get data of a short link",
                tags: ["short-links"]
            }
        }
    )
    app.post(
		"/short-links",
        async ({ body, set }: RequestWithBody) => {
            const res = await createShortLink(body.url, body.shortCode, body?.userId, body?.expirationDate)

            set.status = Number(res.status || 201)

            return res
		},
		{
			body: t.Object(
				{
					url: t.String(),
                    shortCode: t.String(),
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
        '/short-links/count',
        async ({ ip, set }: RequestParams) => new Stream(async (stream) => {
            rateLimiter(ip?.address)

            stream.send({ links: await getShortLinksCount()})
            stream.send({ clicks: await getClicksCount()})
            stream.send({ users: await getBrandedLinksCount()})

            set.status = Number(200);
            stream.close()
        }),
        {
            detail: {
                summary: "Get the number of short links",
                tags: ["short-links"]
            }
        }
    )
    app.ws('/short-links/ws-count-links', {
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
