/**
 * Dispatches ICMP echo requests to the target from global nodes.
 * @param {import('../Client')} client
 * @param {string} target - The target hostname or IP address.
 * @param {Object} [options]
 * @param {string[]} [options.region] - Specific nodes, Country Codes, or Continents.
 * @param {number} [options.repeatchecks=0] - Number of repeated probes (0-120).
 * @returns {Promise<Object>} Returns a standard CheckCreated object with UUID.
 */
module.exports = async function ping(client, target, options = {}) {
    if (!target) {
        throw new Error('Target is required for ping check.');
    }

    const payload = { target, ...options };
    return client.post('/ping', payload);
};
