/**
 * Retrieves detailed geolocation data, ISP information, and ASN details.
 * @param {import('../Client.js').default} client
 * @param {string} target - The hostname or IP address to check.
 * @returns {Promise<Object>}
 * 
 * @example
 * // Minimal payload example
 * await api.info('check-host.cc');
 * 
 * @example
 * // Optional parameters are not typically used for /info endpoint
 * await api.info('8.8.8.8');
 */
export default async function info(client, target) {
    if (!target) {
        throw new Error('Target is required for info check.');
    }

    return client.post('/info', { target });
}
