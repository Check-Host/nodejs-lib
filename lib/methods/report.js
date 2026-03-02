/**
 * Fetches the compiled report and real-time statuses from a previously initiated monitoring check.
 * @param {import('../Client.js').default} client
 * @param {string} uuid - The UUID returned by the initial check request.
 * @returns {Promise<Object>}
 * 
 * @example
 * await api.report('c0b4b0e3-aed7-4ae2-9f53-7bac879697cb');
 */
export default async function report(client, uuid) {
    if (!uuid) {
        throw new Error('UUID is required to fetch a report.');
    }

    // Ensure UUID doesn't start with a slash just in case
    const cleanUuid = uuid.startsWith('/') ? uuid.substring(1) : uuid;
    return client.get(`/report/${cleanUuid}`);
}
