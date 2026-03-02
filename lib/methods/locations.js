/**
 * Fetches a dynamic list of all currently active monitoring nodes across the globe.
 * @param {import('../Client')} client
 * @returns {Promise<Object>}
 */
module.exports = async function locations(client) {
    return client.get('/locations');
};
