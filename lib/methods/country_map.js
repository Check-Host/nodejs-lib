/**
 * Fetches the per-country world map for a previously dispatched check.
 * Default format is SVG; pass `{ format: 'png', resolution: 'low' | 'med' | 'high' }`
 * for a rasterised PNG.
 *
 * @param {import('../Client.js').default} client
 * @param {string} uuid - The UUID returned by the initial check request.
 * @param {Object} [options]
 * @param {'svg'|'png'} [options.format='svg']
 * @param {'low'|'med'|'high'} [options.resolution='med']
 *        PNG resolution. Ignored for SVG.
 * @returns {Promise<Uint8Array>} The raw image bytes (UTF-8 text for SVG,
 *        binary for PNG).
 *
 * @example
 * const svg = await api.countryMap(taskUuid);
 * const png = await api.countryMap(taskUuid, { format: 'png', resolution: 'high' });
 */
export default async function countryMap(
    client,
    uuid,
    { format = 'svg', resolution = 'med' } = {},
) {
    if (!uuid) {
        throw new Error('UUID is required to fetch the country map.');
    }
    if (!['svg', 'png'].includes(format)) {
        throw new Error(`format must be 'svg' or 'png', got '${format}'.`);
    }
    if (!['low', 'med', 'high'].includes(resolution)) {
        throw new Error(
            `resolution must be 'low', 'med', or 'high', got '${resolution}'.`,
        );
    }
    const cleanUuid = uuid.startsWith('/') ? uuid.substring(1) : uuid;
    const query = new URLSearchParams({ format, res: resolution }).toString();
    return client.getBinary(
        `/report/${encodeURIComponent(cleanUuid)}/country-map?${query}`,
        { accept: format === 'png' ? 'image/png' : 'image/svg+xml' },
    );
}
