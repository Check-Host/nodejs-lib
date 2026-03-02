/**
 * Dispatches ICMP echo requests to the target from global nodes.
 * @param {import('../Client.js').default} client
 * @param {string} target - The target hostname or IP address.
 * @param {Object} [options]
 * @param {string[]} [options.region] - Specific nodes, Country Codes, or Continents.
 * @param {number} [options.repeatchecks=0] - Number of repeated probes (0-120).
 * @param {number} [options.timeout] - (Currently disabled) Connection timeout threshold in seconds.
 * @returns {Promise<Object>} Returns a standard CheckCreated object with UUID.
 * 
 * @example
 * // Minimal payload example
 * await api.ping('1.1.1.1');
 * 
 * @example
 * // Example with optional parameters
 * await api.ping('1.1.1.1', {
 *   region: ['DE', 'NL'],
 *   repeatchecks: 5,
 *   timeout: 5
 * });
 */
export default async function ping(client, target, options = {}) {
    if (!target) {
        throw new Error('Target is required for ping check.');
    }

    const payload = { target, ...options };
    return client.post('/ping', payload);
}
