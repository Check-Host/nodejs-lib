/**
 * Attempts to establish a 3-way TCP handshake on a specific destination port.
 * @param {import('../Client')} client
 * @param {string} target - The IP or hostname to check.
 * @param {number} port - The destination TCP port (1-65535).
 * @param {Object} [options]
 * @param {string[]} [options.region]
 * @param {number} [options.repeatchecks=0]
 * @returns {Promise<Object>}
 */
module.exports = async function tcp(client, target, port, options = {}) {
    if (!target) {
        throw new Error('Target is required for tcp check.');
    }
    if (!port) {
        throw new Error('Port is required for tcp check.');
    }

    const payload = { target, port, ...options };
    return client.post('/tcp', payload);
};
