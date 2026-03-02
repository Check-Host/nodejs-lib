/**
 * Returns the requesting client's public IPv4 or IPv6 address.
 * @param {import('../Client.js').default} client
 * @returns {Promise<Object>}
 * 
 * @example
 * await api.myip();
 */
export default async function myip(client) {
    return client.get('/myip');
}
