# Check-Host API Node.js Library

A lightweight, lightning-fast, and feature-complete Node.js wrapper for the [Check-Host.cc](https://check-host.cc) API. Full documentation is available at [docs.check-host.cc](https://docs.check-host.cc).

Seamlessly integrate global network diagnostics into your backend. Perform remote Ping, TCP, UDP, DNS, and HTTP checks from multiple worldwide locations—straight from your JavaScript or TypeScript application. Checks from 60+ locations worldwide.

## Features

- **Zero Dependencies:** Built purely on the native Node.js 18+ fetch API. No axios, no node-fetch, zero package bloat.

- **Bulletproof Payloads:** Strictly utilizes POST requests for all active monitoring endpoints. This completely eliminates nasty URL-encoding issues with complex hostnames or custom UDP payloads.

- **Modern & Modular:** Native ES Modules (import / export) support. Every endpoint strategy lives in an isolated file, ensuring a clean architecture and easy debugging.

- **Smart Authentication:** API Key auto-injection. Configure your key once during initialization, and the core SDK seamlessly handles all authentication payloads under the hood.

## Requirements

- **Node.js**: v18.0.0 or higher.
- `package.json` with `"type": "module"` or using `.mjs` extension.

## Installation

Ensure you have Node.js 18+ installed. You can install the package directly from npm:
```bash
npm i @check-hostcc/check-host-api
```

## Quickstart

```javascript
import CheckHost from '@check-hostcc/check-host-api';

// Initialize the client. The API Key is optional.
// Without an API key, standard public rate limits apply.
//const checkHost = new CheckHost({ apikey: 'YOUR_API_KEY_HERE' });
// Or leave empty: new CheckHost()
const checkHost = new CheckHost();
```

---

## Complete API Reference & Examples

This library supports both minimal invocations and detailed, options-rich requests for every endpoint.

### Common Options Used in Examples
- `region`: Array of Nodes or ISO Country Codes (e.g. `['DE', 'NL']`) or Continents (e.g. `['EU']`).
- `repeatchecks`: Number of repeated probes to perform per node for higher accuracy (Live Check).
- `timeout`: Connection timeout threshold in seconds (Currently disabled on Check-host backend, but supported).

---

### Information & Utilities

#### Get My IP
Returns the requesting client's public IPv4 or IPv6 address.
```javascript
const ip = await checkHost.myip();
```

#### Get Locations
Fetches a dynamic list of all currently active monitoring nodes across the globe.
```javascript
const nodes = await checkHost.locations();
```

#### Host Info (GeoIP/ASN)
Retrieves detailed geolocation data, ISP information, and ASN details.
```javascript
// Minimal Example
const info = await checkHost.info('check-host.cc');
```

#### WHOIS Lookup
Performs a WHOIS registry lookup.
```javascript
// Minimal Example
const whois = await checkHost.whois('check-host.cc');
```

---

### Active Monitoring (POST Tasks)

Monitoring endpoints initiate tasks asynchronously and return a `Task Object` containing a `uuid`. Use the `report()` method (documented below) to fetch the actual results.

#### Ping
Dispatches ICMP echo requests to the target from global nodes.
```javascript
// Minimal Example
const pingMin = await checkHost.ping('8.8.8.8');

// Max Example (With options)
const pingMax = await checkHost.ping('8.8.8.8', {
    region: ['DE', 'NL'],
    repeatchecks: 5,
    timeout: 5
});
```

#### DNS
Queries global nameservers for specific DNS records.
```javascript
// Minimal Example
const dnsMin = await checkHost.dns('check-host.cc');

// Max Example (With options - TXT Record)
const dnsMax = await checkHost.dns('check-host.cc', {
    querymethod: 'TXT', // A, AAAA, MX, TXT, SRV, etc.
    region: ['US', 'DE']
});
```

#### TCP
Attempts to establish a 3-way TCP handshake on a specific destination port.
```javascript
// Minimal Example (Target, Port)
const tcpMin = await checkHost.tcp('1.1.1.1', 443);

// Max Example (With options)
const tcpMax = await checkHost.tcp('1.1.1.1', 80, {
    region: ['DE', 'NL'],
    repeatchecks: 3,
    timeout: 10
});
```

#### UDP
Sends UDP packets to a specified target and port. We have for most used ports the right payload. If you are unsure about the payload, leave it empty and we will use the default payload.
```javascript
// Minimal Example (Target, Port)
const udpMin = await checkHost.udp('1.1.1.1', 53);

// Max Example (With custom hex payload and options)
const udpMax = await checkHost.udp('1.1.1.1', 123, {
    payload: '0b', // NTP Request Hex
    region: ['EU'],
    repeatchecks: 2,
    timeout: 5
});
```

#### HTTP
Executes an HTTP/HTTPS request to the target to measure TTFB and latency.
```javascript
// Minimal Example
const httpMin = await checkHost.http('https://check-host.cc');

// Max Example (With options)
const httpMax = await checkHost.http('https://check-host.cc', {
    region: ['US', 'DE'],
    repeatchecks: 3,
    timeout: 10
});
```

#### MTR
Initiates an MTR (My Traceroute) diagnostic.
```javascript
// Minimal Example
const mtrMin = await checkHost.mtr('1.1.1.1');

// Max Example (With protocols, IP forced, and options)
const mtrMax = await checkHost.mtr('1.1.1.1', {
    repeatchecks: 15,
    forceIPversion: 4,     // 4 or 6
    forceProtocol: 'TCP',  // default is ICMP
    region: ['DE', 'US']
});
```

---

### Fetching Results

#### Report
Fetches the compiled report and real-time statuses from a previously initiated monitoring check (Ping, TCP, HTTP, etc.) using its unique `uuid`. Wait 1-2 seconds after starting a check before polling. Longer checks with multiple repeats take one check per second and can be requested multiple times.
```javascript
// The check UUID is returned by any monitoring method above
const taskUuid = 'c0b4b0e3-aed7-4ae2-9f53-7bac879697cb';

// Fetch the result payload
const report = await checkHost.report(taskUuid);
```

## License

ISC License
