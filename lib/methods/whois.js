/**
 * Performs a WHOIS registry lookup.
 * @param {import('../Client.js').default} client
 * @param {string} target - The hostname or IP address to check.
 * @returns {Promise<Object>}
 * 
 * @example
 * // Minimal payload example
 * await api.whois('check-host.cc');
 * 
 * @example
 * // Optional parameters are not typically used for /whois endpoint
 * await api.whois('1.1.1.1');
 */
export default async function whois(client, target) {
    if (!target) {
        throw new Error('Target is required for whois lookup.');
    }

    return client.post('/whois', { target });
}
