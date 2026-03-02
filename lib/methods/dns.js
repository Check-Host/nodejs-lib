/**
 * Queries global nameservers for specific DNS records.
 * @param {import('../Client.js').default} client
 * @param {string} target - The hostname to resolve.
 * @param {Object} [options]
 * @param {string} [options.querymethod='A'] - Default is 'A'. Record type (A, AAAA, MX, TXT, etc.).
 * @param {string[]} [options.region] - Specific nodes, Country Codes, or Continents.
 * @returns {Promise<Object>} Returns a standard CheckCreated object with UUID.
 * 
 * @example
 * // Minimal payload example
 * await api.dns('check-host.cc');
 * 
 * @example
 * // Example with optional parameters
 * await api.dns('check-host.cc', {
 *   querymethod: 'TXT',
 *   region: ['US', 'PL']
 * });
 */
export default async function dns(client, target, options = {}) {
    if (!target) {
        throw new Error('Target is required for dns check.');
    }

    const payload = { target, ...options };
    return client.post('/dns', payload);
}
