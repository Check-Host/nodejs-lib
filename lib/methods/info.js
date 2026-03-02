/**
 * Retrieves detailed geolocation data, ISP information, and ASN details.
 * @param {import('../Client')} client
 * @param {string} target - The hostname or IP address to check.
 * @returns {Promise<Object>}
 */
module.exports = async function info(client, target) {
    if (!target) {
        throw new Error('Target is required for info check.');
    }

    return client.post('/info', { target });
};
