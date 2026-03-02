/**
 * Sends UDP packets to a specified target and port to verify service responsiveness.
 * @param {import('../Client')} client
 * @param {string} target - The IP or hostname.
 * @param {number} port - The UDP port (1-65535).
 * @param {Object} [options]
 * @param {string} [options.payload] - Custom hex or string payload.
 * @param {string[]} [options.region]
 * @param {number} [options.repeatchecks=0]
 * @returns {Promise<Object>}
 */
module.exports = async function udp(client, target, port, options = {}) {
    if (!target) {
        throw new Error('Target is required for udp check.');
    }
    if (!port) {
        throw new Error('Port is required for udp check.');
    }

    const payload = { target, port, ...options };
    return client.post('/udp', payload);
};
