/**
 * Fetches a dynamic list of all currently active monitoring nodes across the globe.
 * @param {import('../Client.js').default} client
 * @returns {Promise<Object>}
 * 
 * @example
 * await api.locations();
 */
export default async function locations(client) {
    return client.get('/locations');
}
