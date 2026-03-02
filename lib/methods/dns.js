/**
 * Queries global nameservers for specific DNS records.
 * @param {import('../Client')} client
 * @param {string} target - The hostname to resolve.
 * @param {Object} [options]
 * @param {string} [options.querymethod='A'] - Default is 'A'. Record type (A, AAAA, MX, TXT, etc.).
 * @param {string[]} [options.region] - Specific nodes, Country Codes, or Continents.
 * @returns {Promise<Object>} Returns a standard CheckCreated object with UUID.
 */
module.exports = async function dns(client, target, options = {}) {
    if (!target) {
        throw new Error('Target is required for dns check.');
    }

    const payload = { target, ...options };
    return client.post('/dns', payload);
};
