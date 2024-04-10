const wsClients = new Set<WebSocket>();

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const addClient = (client: any): void => {
 wsClients.add(client);
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const removeClient = (client: any): void => {
 wsClients.delete(client);
};

export const notifyClients = (data: object): void => {
    for (const client of wsClients) {
        client.send(JSON.stringify({ type: 'shortLinksCount', ...data }));

    }
};
