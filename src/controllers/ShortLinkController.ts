import { createShortLinkInDb, getShortLinkByShortUrl, getShortLinksCountFromDb, updateClickCount } from "../db/ShortLinkModel";
import { notifyClients } from '../utils/notifications';

export const getShortLink = async (shortUrl: string, securityToken: string) => {
    try {
        const result = await getShortLinkByShortUrl(shortUrl);
        if (!result) {
            return {
                status: 404,
                message: 'Short link not found.'
            }
        }

        if (result.click_count !== null && securityToken === 'secret') {
            updateClickCount(Number(result.id), Number(result.click_count) + 1, new Date())
        }

        const { id, ...shortLinkData } = result;

        return {...shortLinkData};
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const createShortLink = async (url: string, shortUrl: string, userId?: number, expirationDate?: Date) => {
    if (!url || !shortUrl) {
        return {
            status: 400,
            message: 'URL and short URL are required.'
        }
    }
    try {
        const result = await createShortLinkInDb(url, shortUrl, userId, expirationDate);
        if (!result) {
            return {
                status: 500,
                message: 'Unable to create short link.'
            }
        }
        
        const { id, ...shortLinkData } = result;

        notifyClients({ count: await getShortLinksCountFromDb() });

        return shortLinkData;
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