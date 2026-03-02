/**
 * Performs a WHOIS registry lookup.
 * @param {import('../Client')} client
 * @param {string} target - The hostname or IP address to check.
 * @returns {Promise<Object>}
 */
module.exports = async function whois(client, target) {
    if (!target) {
        throw new Error('Target is required for whois lookup.');
    }

    return client.post('/whois', { target });
};
