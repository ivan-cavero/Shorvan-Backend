import { deleteExpiredLinks } from "../db/ShortLinkModel";
const deleteExpireLinks = {
    name: 'deleteExpireLinks',
    pattern: '*/10 * * * *',
    async run() {
        const result = await deleteExpiredLinks()
        console.info(result)
    }
}

export { deleteExpireLinks };

