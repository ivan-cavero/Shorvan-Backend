import { createClient } from "@libsql/client";
import {
	env,
} from 'node:process';

const clients: { [key: string]: ReturnType<typeof createClient> } = {}

export const getClient = (dbName: string) => {
	if (!clients[dbName]) {
		const url = env[`${dbName.toUpperCase()}_DATABASE_URL`]
		const authToken = env[`${dbName.toUpperCase()}_AUTH_TOKEN`]

		if (!url || !authToken) {
			throw new Error(`Database credentials for '${dbName}' are not defined.`)
		}

		clients[dbName] = createClient({ url, authToken })
	}

	return clients[dbName]
}
