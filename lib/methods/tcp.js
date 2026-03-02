/**
 * Attempts to establish a 3-way TCP handshake on a specific destination port.
 * @param {import('../Client.js').default} client
 * @param {string} target - The IP or hostname to check.
 * @param {number} port - The destination TCP port (1-65535).
 * @param {Object} [options]
 * @param {string[]} [options.region] - Specific nodes, Country Codes, or Continents.
 * @param {number} [options.repeatchecks=0] - Number of repeated probes.
 * @param {number} [options.timeout] - (Currently disabled) Connection timeout threshold in seconds.
 * @returns {Promise<Object>}
 * 
 * @example
 * // Minimal payload example
 * await api.tcp('1.1.1.1', 443);
 * 
 * @example
 * // Example with optional parameters
 * await api.tcp('1.1.1.1', 80, {
 *   region: ['DE', 'JP'],
 *   repeatchecks: 3,
 *   timeout: 5
 * });
 */
export default async function tcp(client, target, port, options = {}) {
    if (!target) {
        throw new Error('Target is required for tcp check.');
    }
    if (!port) {
        throw new Error('Port is required for tcp check.');
    }

    const payload = { target, port, ...options };
    return client.post('/tcp', payload);
}
