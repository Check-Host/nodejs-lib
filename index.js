const Client = require('./lib/Client');

// Import all method wrappers
const infoMethod = require('./lib/methods/info');
const whoisMethod = require('./lib/methods/whois');
const pingMethod = require('./lib/methods/ping');
const dnsMethod = require('./lib/methods/dns');
const tcpMethod = require('./lib/methods/tcp');
const udpMethod = require('./lib/methods/udp');
const httpMethod = require('./lib/methods/http');
const mtrMethod = require('./lib/methods/mtr');
const locationsMethod = require('./lib/methods/locations');
const reportMethod = require('./lib/methods/report');
const myipMethod = require('./lib/methods/myip');

class CheckHost {
    /**
     * Initializes the Check-Host API client.
     * @param {Object} [options]
     * @param {string} [options.apikey] - Your API key for higher limits.
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

module.exports = CheckHost;
