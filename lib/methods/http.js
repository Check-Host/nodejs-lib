/**
 * Executes an HTTP/HTTPS request to the target to measure Time-to-First-Byte and overall response latency.
 * @param {import('../Client')} client
 * @param {string} target - The target URL (e.g., 'https://check-host.cc').
 * @param {Object} [options]
 * @param {string[]} [options.region]
 * @param {number} [options.repeatchecks=0]
 * @returns {Promise<Object>}
 */
module.exports = async function http(client, target, options = {}) {
    if (!target) {
        throw new Error('Target is required for http check (include http:// or https://).');
    }

    const payload = { target, ...options };
    // The API uses /http, but the payload requires standard formatting
    return client.post('/http', payload);
};
