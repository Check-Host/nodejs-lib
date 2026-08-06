/**
 * Geolocation + ASN for the caller's own IP.
 *
 * Same response shape as `info(target)`, resolved against the requesting
 * client's IP. Subject to bot detection - repeated cache misses can return
 * a 429 carrying a captcha verification URL.
 *
 * @param {import('../Client.js').default} client
 * @returns {Promise<Object>}
 *
 * @example
 * const me = await api.myinfo();
 * console.log(me.countryCode, me.city, me.asn?.name);
 */
export default async function myinfo(client) {
    return client.get('/myinfo');
}
