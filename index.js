import Client from './lib/Client.js';

// Import all method wrappers
import infoMethod from './lib/methods/info.js';
import whoisMethod from './lib/methods/whois.js';
import pingMethod from './lib/methods/ping.js';
import dnsMethod from './lib/methods/dns.js';
import tcpMethod from './lib/methods/tcp.js';
import udpMethod from './lib/methods/udp.js';
import httpMethod from './lib/methods/http.js';
import mtrMethod from './lib/methods/mtr.js';
import locationsMethod from './lib/methods/locations.js';
import reportMethod from './lib/methods/report.js';
import myipMethod from './lib/methods/myip.js';
import myinfoMethod from './lib/methods/myinfo.js';
import ogImageMethod from './lib/methods/og_image.js';
import countryMapMethod from './lib/methods/country_map.js';
import {
    ipIntel,
    asnIntel,
    prefixIntel,
    domainIntel,
    certIntel,
    portIntel,
    softwareIntel,
    recentScans,
} from './lib/methods/intelligence.js';
import {
    fullscan,
    fullscanStatus,
    fullscanResults,
    waitForFullscan,
    isFinished,
} from './lib/methods/fullscan.js';

/**
 * Main CheckHost API Client Class.
 */
export default class CheckHost {
    /**
     * Initializes the Check-Host API client.
     *
     * The token is sent as an `Authorization: Bearer <token>` header on
     * every request. It is optional - without one you get anonymous access
     * under tighter per-IP rate limits.
     *
     * @param {Object} [options]
     * @param {string} [options.token] - API token (UUID) for higher limits.
     *   Falls back to the `CHECK_HOST_API_TOKEN` environment variable.
     * @param {string} [options.apikey] - Deprecated alias for `token`.
     * @param {string} [options.baseUrl] - Override the API base URL.
     *
     * @example
     * import CheckHost from '@check-hostcc/check-host-api';
     * const api = new CheckHost({ token: 'YOUR_API_TOKEN_UUID' });
     */
    constructor(options) {
        this.client = new Client(options);
    }

    /**
     * Retrieves detailed geolocation data, ISP info, and ASN details.
     */
    async info(target) {
        return infoMethod(this.client, target);
    }

    /**
     * Performs a WHOIS registry lookup.
     */
    async whois(target) {
        return whoisMethod(this.client, target);
    }

    /**
     * Dispatches ICMP echo requests to accurately measure network latency.
     */
    async ping(target, options) {
        return pingMethod(this.client, target, options);
    }

    /**
     * Queries global nameservers for specific DNS records.
     */
    async dns(target, options) {
        return dnsMethod(this.client, target, options);
    }

    /**
     * Attempts to establish a 3-way TCP handshake.
     */
    async tcp(target, port, options) {
        return tcpMethod(this.client, target, port, options);
    }

    /**
     * Sends UDP packets to verify service responsiveness.
     */
    async udp(target, port, options) {
        return udpMethod(this.client, target, port, options);
    }

    /**
     * Executes an HTTP/HTTPS request to measure Time-to-First-Byte and latency.
     */
    async http(target, options) {
        return httpMethod(this.client, target, options);
    }

    /**
     * Initiates an MTR diagnostic (ping + traceroute).
     */
    async mtr(target, options) {
        return mtrMethod(this.client, target, options);
    }

    /**
     * Fetches a list of all currently active monitoring nodes.
     */
    async locations() {
        return locationsMethod(this.client);
    }

    /**
     * Fetches the compiled report and real-time statuses from a check UUID.
     */
    async report(uuid) {
        return reportMethod(this.client, uuid);
    }

    /**
     * Lightweight endpoint to return the requesting client's public IP.
     */
    async myip() {
        return myipMethod(this.client);
    }

    /**
     * Geolocation + ASN for the caller's own IP.
     */
    async myinfo() {
        return myinfoMethod(this.client);
    }

    /**
     * Fetches the dynamic 1200x630 PNG status map for a check UUID.
     * @param {string} uuid
     * @returns {Promise<Uint8Array>} Raw PNG bytes.
     */
    async ogImage(uuid) {
        return ogImageMethod(this.client, uuid);
    }

    /**
     * Fetches the per-country world map for a check UUID.
     * @param {string} uuid
     * @param {Object} [options]
     * @param {'svg'|'png'} [options.format='svg']
     * @param {'low'|'med'|'high'} [options.resolution='med']
     * @returns {Promise<Uint8Array>}
     */
    async countryMap(uuid, options) {
        return countryMapMethod(this.client, uuid, options);
    }

    // --- Network Intelligence ---

    /**
     * Full intelligence profile for a single IPv4/IPv6 address.
     * @param {string} ip
     * @returns {Promise<Object>}
     */
    async ipIntel(ip) {
        return ipIntel(this.client, ip);
    }

    /**
     * Autonomous-system intelligence profile.
     * @param {number|string} asn - `13335` or `'AS13335'`.
     * @returns {Promise<Object>}
     */
    async asnIntel(asn) {
        return asnIntel(this.client, asn);
    }

    /**
     * CIDR prefix intelligence.
     * @param {string} net - Network address, e.g. '1.1.1.0'.
     * @param {number} mask - Prefix length, 0-128.
     * @returns {Promise<Object>}
     */
    async prefixIntel(net, mask) {
        return prefixIntel(this.client, net, mask);
    }

    /**
     * Domain intelligence: DNS history, certificates, subdomains, leaks.
     * @param {string} domain
     * @returns {Promise<Object>}
     */
    async domainIntel(domain) {
        return domainIntel(this.client, domain);
    }

    /**
     * TLS certificate intelligence by SHA-256 fingerprint.
     * @param {string} sha256 - 64-character hex fingerprint.
     * @returns {Promise<Object>}
     */
    async certIntel(sha256) {
        return certIntel(this.client, sha256);
    }

    /**
     * Port exposure intelligence across the scanned Internet.
     * @param {number} port - 1-65535.
     * @returns {Promise<Object>}
     */
    async portIntel(port) {
        return portIntel(this.client, port);
    }

    /**
     * Software / tech-stack intelligence, optionally version-pinned.
     * @param {string} name
     * @param {string} [version]
     * @returns {Promise<Object>}
     */
    async softwareIntel(name, version) {
        return softwareIntel(this.client, name, version);
    }

    /**
     * Most-recent fullscan jobs submitted for a target.
     * @param {string} target
     * @returns {Promise<Object>}
     */
    async recentScans(target) {
        return recentScans(this.client, target);
    }

    // --- Fullscan ---

    /**
     * Dispatches a deep, multi-stage scan of an IP, CIDR, domain or ASN.
     * @param {string} target
     * @param {Object} [options]
     * @param {'basic'|'deep'|'full'} [options.scope='deep']
     * @returns {Promise<Object>}
     */
    async fullscan(target, options) {
        return fullscan(this.client, target, options);
    }

    /**
     * Polls a fullscan's progress counters.
     * @param {string} uuid
     * @returns {Promise<Object>} `{ success, job }`.
     */
    async fullscanStatus(uuid) {
        return fullscanStatus(this.client, uuid);
    }

    /**
     * Fetches the aggregated findings a fullscan produced.
     * @param {string} uuid
     * @returns {Promise<Object>}
     */
    async fullscanResults(uuid) {
        return fullscanResults(this.client, uuid);
    }

    /**
     * Polls until the fullscan reaches a terminal status.
     * @param {string} uuid
     * @param {Object} [options]
     * @param {number} [options.interval=3000]
     * @param {number} [options.maxWait=300000]
     * @param {boolean} [options.requireComplete=true]
     * @returns {Promise<Object>} The job row.
     */
    async waitForFullscan(uuid, options) {
        return waitForFullscan(this.client, uuid, options);
    }
}

export { isFinished as isFullscanFinished };
