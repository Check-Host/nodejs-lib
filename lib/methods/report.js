/**
 * Fetches the compiled report and real-time statuses from a previously initiated monitoring check.
 * @param {import('../Client')} client
 * @param {string} uuid - The UUID returned by the initial check request.
 * @returns {Promise<Object>}
 */
module.exports = async function report(client, uuid) {
    if (!uuid) {
        throw new Error('UUID is required to fetch a report.');
    }

    // Ensure UUID doesn't start with a slash just in case
    const cleanUuid = uuid.startsWith('/') ? uuid.substring(1) : uuid;
    return client.get(`/report/${cleanUuid}`);
};
