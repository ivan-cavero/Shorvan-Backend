import { createClient } from "@libsql/client"

const clients: { [key: string]: ReturnType<typeof createClient> } = {}

export const getClient = (dbName: string) => {
	if (!clients[dbName]) {
		const url = process.env[`${dbName.toUpperCase()}_DATABASE_URL`]
		const authToken = process.env[`${dbName.toUpperCase()}_AUTH_TOKEN`]

		if (!url || !authToken) {
			throw new Error(`Database credentials for '${dbName}' are not defined.`)
		}

		clients[dbName] = createClient({ url, authToken })
	}

	return clients[dbName]
}
