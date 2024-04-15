import { createShortLinkInDb, getShortLinkByShortCodeFromDb, getShortLinksCountFromDb, updateClickCount } from "../db/ShortLinkModel";
import { notifyClients } from '../utils/notifications';

export const getShortLinkByShortCode = async (shortCode: string, securityToken: string) => {
    try {
        const result = await getShortLinkByShortCodeFromDb(shortCode);
        
        if (!result || result.length === 0) {
            return {
                status: 404,
                message: 'Short link not found.'
            };
        }

        const shortLink = result[0];

        if (shortLink.click_count !== null && securityToken === 'secret') {
            await updateClickCount(Number(shortLink.id), Number(shortLink.click_count) + 1, new Date())
        }

        const { id, ...shortLinkData } = shortLink;
        return shortLinkData;
        
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getShortLinkByQuery = async (shortCodes: string) => {
    try {
        const result = await getShortLinkByShortCodeFromDb(shortCodes);

        if (!result || result.length === 0) {
            return {
                status: 404,
                message: 'Short link not found.'
            };
        }

        return { data: result, status: 200 }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const createShortLink = async (url: string, shortCode: string, userId?: number, expirationDate?: Date) => {
    if (!url || !shortCode) {
        return {
            status: 400,
            message: 'URL and short URL are required.'
        }
    }
    try {
        const result = await createShortLinkInDb(url, shortCode, userId, expirationDate);
        if (!result) {
            return {
                status: 500,
                message: 'Unable to create short link.'
            }
        }
        
        notifyClients({ count: await getShortLinksCountFromDb() });

        return { ...result[0], status: 201 };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getShortLinksCount = async () => {
	try {
		const shortLinksCount = await getShortLinksCountFromDb()

        return  shortLinksCount
	} catch (error) {
		console.error(error)
        throw error
	}
}