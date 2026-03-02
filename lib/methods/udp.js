/**
 * Sends UDP packets to a specified target and port to verify service responsiveness.
 * @param {import('../Client.js').default} client
 * @param {string} target - The IP or hostname.
 * @param {number} port - The UDP port (1-65535).
 * @param {Object} [options]
 * @param {string} [options.payload] - Custom hex or string payload.
 * @param {string[]} [options.region] - Specific nodes, Country Codes, or Continents.
 * @param {number} [options.repeatchecks=0] - Number of repeated probes.
 * @param {number} [options.timeout] - (Currently disabled) Connection timeout threshold in seconds.
 * @returns {Promise<Object>}
 * 
 * @example
 * // Minimal payload example
 * await api.udp('1.1.1.1', 53);
 * 
 * @example
 * // Example with optional parameters
 * await api.udp('1.1.1.1', 53, {
 *   payload: 'custom_hex_string',
 *   region: ['EU'],
 *   repeatchecks: 2,
 *   timeout: 5
 * });
 */
export default async function udp(client, target, port, options = {}) {
    if (!target) {
        throw new Error('Target is required for udp check.');
    }
    if (!port) {
        throw new Error('Port is required for udp check.');
    }

    const payload = { target, port, ...options };
    return client.post('/udp', payload);
}
