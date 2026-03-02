/**
 * Returns the requesting client's public IPv4 or IPv6 address.
 * @param {import('../Client')} client
 * @returns {Promise<Object>}
 */
module.exports = async function myip(client) {
    return client.get('/myip');
};
