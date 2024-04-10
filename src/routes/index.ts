import type { Elysia } from "elysia"
import type { RequestWithIP } from "../types"
import { getRateLimitInfo } from "../utils/RateLimiter"
import shortLinkRoutes from "./ShortLinkRoutes"

const setupRoutes = (app: Elysia) => {
	app.get("/", ({ ip }: RequestWithIP) =>  `Server is up | Your IP: ${ip.address}`)
	
	shortLinkRoutes(app)

	app.get("/api-limit", ({ ip }: RequestWithIP) => getRateLimitInfo(ip?.address))
}

export default setupRoutes
