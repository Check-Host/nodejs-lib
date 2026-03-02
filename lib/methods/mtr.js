/**
 * Initiates an MTR diagnostic.
 * @param {import('../Client')} client
 * @param {string} target - Destination hostname or IP.
 * @param {Object} [options]
 * @param {number} [options.repeatchecks=10] - Number of packets sent per hop (3-30).
 * @param {number} [options.forceIPversion] - Force IPv4 (4) or IPv6 (6).
 * @param {string} [options.forceProtocol] - Switch protocol from ICMP (default) to UDP or TCP.
 * @param {string[]} [options.region]
 * @returns {Promise<Object>}
 */
module.exports = async function mtr(client, target, options = {}) {
    if (!target) {
        throw new Error('Target is required for mtr check.');
    }

    const payload = { target, ...options };
    return client.post('/mtr', payload);
};
