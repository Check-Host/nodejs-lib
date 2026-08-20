/**
 * Executes an HTTP/HTTPS request to the target to measure Time-to-First-Byte and overall response latency.
 * @param {import('../Client.js').default} client
 * @param {string} target - The target URL (e.g., 'https://check-host.cc').
 * @param {Object} [options]
 * @param {string[]} [options.region] - Specific nodes, Country Codes, or Continents.
 * @param {number} [options.repeatchecks=0] - Number of repeated probes.
 * @param {number} [options.timeout] - Per-check timeout in MILLISECONDS (100-30000). Optional. A value below 100 is read as seconds and converted by the API, so older code passing 15 still works.
 * @returns {Promise<Object>}
 * 
 * @example
 * // Minimal payload example
 * await api.http('https://check-host.cc');
 * 
 * @example
 * // Example with optional parameters
 * await api.http('https://check-host.cc', {
 *   region: ['US', 'DE'],
 *   repeatchecks: 3,
 *   timeout: 10000
 * });
 */
export default async function http(client, target, options = {}) {
    if (!target) {
        throw new Error('Target is required for http check (include http:// or https://).');
    }

    const payload = { target, ...options };
    // The API uses /http, but the payload requires standard formatting
    return client.post('/http', payload);
}
