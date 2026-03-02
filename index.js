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

/**
 * Main CheckHost API Client Class.
 */
export default class CheckHost {
    /**
     * Initializes the Check-Host API client.
     * @param {Object} [options]
     * @param {string} [options.apikey] - Your API key for higher limits.
     * 
     * @example
     * import CheckHost from 'check-host-api';
     * const api = new CheckHost({ apikey: 'YOUR_API_KEY_HERE' });
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
}
