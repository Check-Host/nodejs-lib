/**
 * Fetches the dynamic 1200x630 PNG status map for a previously
 * dispatched check.
 *
 * @param {import('../Client.js').default} client
 * @param {string} uuid - The UUID returned by the initial check request.
 * @returns {Promise<Uint8Array>} The raw PNG bytes.
 *
 * @example
 * const png = await api.ogImage('c0b4b0e3-aed7-4ae2-9f53-7bac879697cb');
 * await fs.writeFile('status.png', png);
 */
export default async function ogImage(client, uuid) {
    if (!uuid) {
        throw new Error('UUID is required to fetch the OG image.');
    }
    const cleanUuid = uuid.startsWith('/') ? uuid.substring(1) : uuid;
    return client.getBinary(`/report/${encodeURIComponent(cleanUuid)}/og-image`, {
        accept: 'image/png',
    });
}
