/**
 * Network Intelligence lookups - the JSON twin of the /ip, /as, /domain,
 * /cert ... entity pages.
 *
 * These are passive reads against our aggregated dataset (CT-log mirror,
 * world scans, BGP/RIR/PeeringDB/RPKI mirrors, honeypot sensors). No check
 * is dispatched to the monitoring nodes, so results come back immediately.
 *
 * Every response carries a `data` section whose keys vary by endpoint;
 * sections we hold no data for come back as empty arrays or null.
 */

/**
 * Normalises an AS number to its bare decimal form.
 * Accepts 13335, '13335' and 'AS13335'.
 * @param {number|string} asn
 * @returns {string}
 */
function normaliseAsn(asn) {
    if (typeof asn === 'number' && Number.isInteger(asn) && asn >= 0) {
        return String(asn);
    }
    if (typeof asn === 'string') {
        const match = /^(?:AS)?(\d+)$/i.exec(asn.trim());
        if (match) return match[1];
    }
    throw new Error(`asn must look like 13335 or 'AS13335', got '${asn}'.`);
}

/**
 * Full intelligence profile for a single IPv4/IPv6 address.
 *
 * Sections: ptr, open_ports, banners, tls_certs, co_hosted_domains,
 * external_refs, leak_candidates, titles, techs, bgp, geo, probe_findings,
 * threat_matches, threat_count, honeypot, honeypot_recent, honeypot_actor,
 * honeypot_ja, honeypot_classes.
 *
 * Honeypot passwords are never returned in cleartext - each entry exposes
 * only `password_captured` (bool) and `password_len`.
 *
 * @param {import('../Client.js').default} client
 * @param {string} ip
 * @returns {Promise<Object>}
 *
 * @example
 * const intel = await api.ipIntel('1.1.1.1');
 * console.log(intel.data.bgp.as_name);
 */
export async function ipIntel(client, ip) {
    if (!ip) throw new Error('IP is required for an IP intelligence lookup.');
    return client.get(`/ip/${encodeURIComponent(ip)}`);
}

/**
 * Autonomous-system intelligence: prefix counts, announced IPs, peers /
 * providers / customers, IXP memberships, RPKI coverage, GeoIP footprint,
 * top ports and hosted-domain summaries.
 *
 * @param {import('../Client.js').default} client
 * @param {number|string} asn - `13335` or `'AS13335'`.
 * @returns {Promise<Object>}
 *
 * @example
 * const intel = await api.asnIntel('AS13335');
 * console.log(intel.data.prefix_count, intel.data.rpki_coverage_pct);
 */
export async function asnIntel(client, asn) {
    if (asn === undefined || asn === null || asn === '') {
        throw new Error('ASN is required for an ASN intelligence lookup.');
    }
    return client.get(`/as/${normaliseAsn(asn)}`);
}

/**
 * CIDR prefix intelligence: BGP origin, RPKI validity, GeoIP distribution,
 * open-IP count, top ports and sample scanned hosts.
 *
 * @param {import('../Client.js').default} client
 * @param {string} net - Network address, e.g. '1.1.1.0'.
 * @param {number} mask - Prefix length, 0-128.
 * @returns {Promise<Object>}
 *
 * @example
 * const intel = await api.prefixIntel('1.1.1.0', 24);
 */
export async function prefixIntel(client, net, mask) {
    if (!net) throw new Error('Network address is required for a prefix lookup.');
    if (!Number.isInteger(mask) || mask < 0 || mask > 128) {
        throw new Error(`mask must be an integer between 0 and 128, got '${mask}'.`);
    }
    return client.get(`/prefix/${encodeURIComponent(net)}/${mask}`);
}

/**
 * Domain intelligence: current DNS records plus passive-DNS history, TLS
 * certificates, CT-log evidence, discovered subdomains, tech-stack and
 * origin-leak (Cloudflare-bypass) candidates.
 *
 * @param {import('../Client.js').default} client
 * @param {string} domain
 * @returns {Promise<Object>}
 *
 * @example
 * const intel = await api.domainIntel('check-host.cc');
 * console.log(intel.data.subdomains);
 */
export async function domainIntel(client, domain) {
    if (!domain) throw new Error('Domain is required for a domain intelligence lookup.');
    return client.get(`/domain/${encodeURIComponent(domain)}`);
}

/**
 * TLS certificate intelligence: subject, issuer, SANs, validity window,
 * every (ip, port) observed serving it, and matching CT-log entries.
 *
 * @param {import('../Client.js').default} client
 * @param {string} sha256 - 64-character hex fingerprint.
 * @returns {Promise<Object>}
 *
 * @example
 * const intel = await api.certIntel('3a1b8f0c...9f90');
 */
export async function certIntel(client, sha256) {
    if (typeof sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(sha256.trim())) {
        throw new Error('sha256 must be 64 hexadecimal characters.');
    }
    return client.get(`/cert/${sha256.trim().toLowerCase()}`);
}

/**
 * Port exposure across the scanned Internet: open-IP count, most common
 * banners, top countries and ASNs, tech-stack and a sample of recent hosts.
 *
 * @param {import('../Client.js').default} client
 * @param {number} port - 1-65535.
 * @returns {Promise<Object>}
 *
 * @example
 * const intel = await api.portIntel(443);
 * console.log(intel.well_known, intel.data.open_ips);
 */
export async function portIntel(client, port) {
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`port must be an integer between 1 and 65535, got '${port}'.`);
    }
    return client.get(`/port/${port}`);
}

/**
 * Software / tech-stack intelligence: host counts for a detected
 * technology, version breakdown, categories and a sample of hosts.
 *
 * @param {import('../Client.js').default} client
 * @param {string} name - Technology name, e.g. 'nginx'.
 * @param {string} [version] - Pin the stats to a single version.
 * @returns {Promise<Object>}
 *
 * @example
 * await api.softwareIntel('nginx');
 * await api.softwareIntel('nginx', '1.24.0');
 */
export async function softwareIntel(client, name, version) {
    if (!name) throw new Error('Software name is required for a software lookup.');
    let path = `/software/${encodeURIComponent(name)}`;
    if (version !== undefined && version !== null && version !== '') {
        path += `/${encodeURIComponent(version)}`;
    }
    return client.get(path);
}

/**
 * Most-recent fullscan jobs submitted for a target, so you can deep-link
 * to a fresh report instead of triggering a redundant scan.
 *
 * @param {import('../Client.js').default} client
 * @param {string} target - IP, CIDR, domain or ASN.
 * @returns {Promise<Object>}
 *
 * @example
 * const { recent_scans } = await api.recentScans('check-host.cc');
 */
export async function recentScans(client, target) {
    if (!target) throw new Error('Target is required to list recent scans.');
    return client.get(`/scan/${encodeURIComponent(target)}`);
}
