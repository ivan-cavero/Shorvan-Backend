import { getClient } from ".";

const client = getClient("shortLinks");

export const getShortLinkByShortCodeFromDb = async (shortUrls: string) => {
    const shortUrlArray = shortUrls.split(',')
    const placeholders = shortUrlArray.map(() => '?').join(',');

    const sql = `
        SELECT
            id,
            original_url,
            short_code,
            expiration_date,
            click_count,
            created_at
        FROM 
            links
        WHERE short_code IN (${placeholders}) AND deleted IS NOT NULL
    `;

    const result = await client.execute({
        sql: sql,
        args: shortUrlArray
    });

    return result.rows.length ? result.rows : null;
}

export const createShortLinkInDb = async (url: string, shortUrl: string, userId?: number, expirationDate?: Date) => {
    const expirationValue = expirationDate ? expirationDate.toISOString().slice(0, 19).replace('T', ' ') : userId ? null : new Date(new Date().getTime() + 60 * 60 * 24 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    
    const userIdValue = userId !== undefined ? userId : null;

    await client.execute({
        sql: "INSERT INTO links (original_url, short_code, user_id, expiration_date, click_count, created_at) VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)",
        args: [url, shortUrl, userIdValue, expirationValue]
    });
    return getShortLinkByShortCodeFromDb(shortUrl);
};

export const updateShortLink = async (shortUrl: string, expirationDate: Date) => {
    await client.execute({
        sql: "UPDATE links SET expiration_date = ? WHERE short_code = ?",
        args: [expirationDate, shortUrl]
    })
}

export const updateClickCount = async (linkId: number, clickCount: number, clickedAt: Date) => {
    const clickedAtValue = clickedAt ? clickedAt.toISOString().slice(0, 19).replace('T', ' ') : null;

    await client.execute({
        sql: "UPDATE links SET click_count = ? WHERE id = ?",
        args: [clickCount, linkId]
    })

    await client.execute({
        sql: "INSERT INTO clicks (link_id, clicked_at, device_type, operating_system, browser_name, browser_language, country, city, referrer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [linkId, clickedAtValue, null, null, null, null, null, null, null]
    })
}

export const updateBrandLink = async (shortUrl: string, brandLink: string) => {
    await client.execute({
        sql: "UPDATE branded_links SET brand_name = ?, custom_short_code = ? WHERE link_id = ?",
        args: [brandLink, shortUrl]
    })
}

export const deleteExpiredLinks = async () => {
    const result = await client.execute({
        sql: `
            UPDATE links 
            SET deleted = 1, deleted_at = CURRENT_TIMESTAMP 
            WHERE expiration_date IS NOT NULL AND expiration_date < CURRENT_TIMESTAMP
        `,
        args: []
    });

    if (result.rowsAffected === 0) {
        return "No expired links found";
    } 

    await client.execute({
        sql: `
            UPDATE clicks 
            SET deleted = 1, deleted_at = CURRENT_TIMESTAMP 
            WHERE link_id IN (SELECT id FROM links WHERE deleted = 1)
        `,
        args: []
    });

    await client.execute({
        sql: `
            UPDATE qr_codes 
            SET deleted = 1, deleted_at = CURRENT_TIMESTAMP 
            WHERE link_id IN (SELECT id FROM links WHERE deleted = 1)
        `,
        args: []
    });

    await client.execute({
        sql: `
            UPDATE brand_links 
            SET deleted = 1, deleted_at = CURRENT_TIMESTAMP 
            WHERE link_id IN (SELECT id FROM links WHERE deleted = 1)
        `,
        args: []
    });
    
    return `Soft deleted ${result.rowsAffected} expired links`;
}

export const getShortLinksCountFromDb = async () => {
    const client = getClient("shortLinks");
    const result = await client.execute({
        sql: "SELECT COUNT(*) AS count FROM links",
		args: []
    });
    return result.rows[0].count;
};

export const getClicksCountFromDb = async () => {
    const client = getClient("shortLinks");
    const result = await client.execute({
        sql: "SELECT COUNT(*) AS count FROM clicks",
        args: []
    });
    return result.rows[0].count;
}

export const getBrandedLinksCountFromDb = async () => {
    const client = getClient("shortLinks");
    const result = await client.execute({
        sql: "SELECT COUNT(*) AS count FROM brand_links",
        args: []
    });
    return result.rows[0].count;
}