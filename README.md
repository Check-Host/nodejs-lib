# Check-Host API Node.js Library

A lightweight, lightning-fast, and feature-complete Node.js wrapper for the [Check-Host.cc](https://check-host.cc) API. Full API reference: [check-host.cc/docs](https://check-host.cc/docs). A bundled OpenAPI 3.0.3 / Swagger spec ships at [`swagger.yaml`](./swagger.yaml) for codegen / offline browsing.

Seamlessly integrate global network diagnostics into your backend. Perform remote Ping, MTR, DNS, HTTP, TCP and UDP checks from multiple worldwide locations—straight from your JavaScript or TypeScript application. Checks from 60+ locations worldwide.

## Features

- **Zero Dependencies:** Built purely on the native Node.js 18+ fetch API. No axios, no node-fetch, zero package bloat.

- **Bulletproof Payloads:** Strictly utilizes POST requests for all active monitoring endpoints. This completely eliminates nasty URL-encoding issues with complex hostnames or custom UDP payloads.

- **Modern & Modular:** Native ES Modules (import / export) support. Every endpoint strategy lives in an isolated file, ensuring a clean architecture and easy debugging.

- **Header-Based Authentication:** Configure your token once during initialization; the SDK attaches it as an `Authorization: Bearer` header to every request. The token never lands in a URL or a request body.

- **Network Intelligence & Fullscan:** Passive IP / ASN / prefix / domain / certificate / port / software lookups, plus deep on-demand scans with a built-in polling helper.

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

// Initialize the client. The API token is optional.
// Without a token, standard public rate limits apply.
const checkHost = new CheckHost({ token: 'YOUR_API_TOKEN_UUID' });
// Or leave empty for anonymous access: new CheckHost()
```

## Authentication

The token is sent as an `Authorization: Bearer <token>` header on every
request — GET, POST and binary alike. It is never placed in the query string
or the request body, so it does not leak into access logs, referrer headers
or browser history.

```javascript
// Explicit
const checkHost = new CheckHost({ token: 'YOUR_API_TOKEN_UUID' });

// Or from the environment (CHECK_HOST_API_TOKEN)
const checkHost = new CheckHost();
```

> **Migrating from 1.0.x:** the token used to travel in the JSON body as an
> `apikey` field. That field is deprecated server-side. The
> `new CheckHost({ apikey })` option still works but emits a
> `DeprecationWarning` and will be removed in 2.0 — rename it to `token`.
> The legacy `CHECK_HOST_API_KEY` environment variable is still read as a
> fallback.

---

## Complete API Reference & Examples

This library supports both minimal invocations and detailed, options-rich requests for every endpoint.

### Common Options Used in Examples
- `region`: Array of Nodes or ISO Country Codes (e.g. `['DE', 'NL']`) or Continents (e.g. `['EU']`).
- `repeatchecks`: Number of repeated probes to perform per node for higher accuracy (Live Check).
- `timeout`: Per-check timeout in **milliseconds** (100–30000). Optional; each check type has its own default (ping/tcp 1000, udp 2000, dns 5000, http 15000, mtr 1000). A value below 100 is read as seconds and converted, so older code that passed `timeout: 15` still works — but new code should pass milliseconds.

---

### Information & Utilities

#### Get My IP
Returns the requesting client's public IPv4 or IPv6 address.
```javascript
const ip = await checkHost.myip();
```

#### Get My Info
Geolocation + ASN + privacy / abuse data for the caller's own IP. Subject to bot detection — repeated calls may return a 429 carrying a captcha URL.
```javascript
const me = await checkHost.myinfo();
console.log(me.countryCode, me.city, me.asn?.name);
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
    timeout: 5000
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
    timeout: 10000
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
    timeout: 5000
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
    timeout: 10000
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

---

### Network Intelligence

Passive lookups against the dataset behind the entity pages — no check is dispatched to the monitoring nodes, so results come back immediately. Every response carries a `data` section; keys we hold no data for come back as empty arrays or `null`.

#### IP Profile
Reverse DNS, open ports and banners, TLS certificates, BGP/ASN attribution, GeoIP, tech-stack, co-hosted domains, origin-leak candidates, threat-intel matches and honeypot activity.
```javascript
const intel = await checkHost.ipIntel('1.1.1.1');
console.log(intel.data.bgp.as_name);                       // Cloudflare, Inc.
console.log(intel.data.open_ports.map(p => p.port));       // [443, ...]
```

Honeypot passwords are never returned in cleartext — entries expose only `password_captured` (bool) and `password_len`.

#### ASN Profile
Prefix counts, announced IP totals, peers / providers / customers, IXP memberships, RPKI coverage, GeoIP footprint and hosted-domain summaries. Accepts `13335` or `'AS13335'`.
```javascript
const intel = await checkHost.asnIntel('AS13335');
console.log(intel.data.prefix_count, intel.data.rpki_coverage_pct);
```

#### Prefix, Domain and Certificate
```javascript
const prefix = await checkHost.prefixIntel('1.1.1.0', 24);
const domain = await checkHost.domainIntel('check-host.cc');
const cert   = await checkHost.certIntel('3a1b8f0c…9f90');   // 64-char hex

console.log(domain.data.subdomains);
console.log(cert.data.served_by);
```

#### Port and Software Exposure
```javascript
const port = await checkHost.portIntel(443);
console.log(port.well_known, port.data.open_ips);

const nginx  = await checkHost.softwareIntel('nginx');            // all versions
const pinned = await checkHost.softwareIntel('nginx', '1.24.0');  // one version
```

---

### Fullscan

A deep, on-demand multi-stage scan (ports + banners + TLS + DNS + threat-intel) of an IP, CIDR, domain or ASN. Asynchronous: submit, poll, then read the results. Budget minutes, not seconds.

```javascript
const job = await checkHost.fullscan('check-host.cc', { scope: 'deep' });
console.log(job.uuid, job.status);          // ... pending

// Block until the job reaches a terminal status (complete/partial/failed)
const finished = await checkHost.waitForFullscan(job.uuid, { maxWait: 300000 });
console.log(finished.status, `${finished.subjobs_done}/${finished.subjobs_total}`);

const { data } = await checkHost.fullscanResults(job.uuid);
for (const entry of data.open_ports) {
  console.log(entry.port, entry.service);
}
```

Scopes: `basic` (top-100 ports + banner), `deep` (default — full port range, TLS, body and threat-intel), `full` (deep plus subdomain enumeration; domains only).

Anonymous CIDR submissions are capped at `/24` (v4) and `/120` (v6); an API token raises that to `/20` and `/112`.

Before dispatching a scan, check whether a recent one already exists:
```javascript
const { recent_scans } = await checkHost.recentScans('check-host.cc');
const reusable = recent_scans.find(s => s.status === 'complete');
if (reusable) {
  const { data } = await checkHost.fullscanResults(reusable.uuid);
}
```

For manual polling loops, `fullscanStatus(uuid)` returns `{ success, job }`.

---

## API surface

| Method | Endpoint |
|---|---|
| `myip()` | `GET /myip` |
| `myinfo()` | `GET /myinfo` |
| `locations()` | `GET /locations` |
| `info(target)` | `POST /info` |
| `whois(target)` | `POST /whois` |
| `ping(target, options)` | `POST /ping` |
| `dns(target, options)` | `POST /dns` |
| `tcp(target, port, options)` | `POST /tcp` |
| `udp(target, port, options)` | `POST /udp` |
| `http(target, options)` | `POST /http` |
| `mtr(target, options)` | `POST /mtr` |
| `report(uuid)` | `GET /report/{uuid}` |
| `ogImage(uuid)` | `GET /report/{uuid}/og-image` |
| `countryMap(uuid, options)` | `GET /report/{uuid}/country-map` |
| `ipIntel(ip)` | `GET /ip/{ip}` |
| `asnIntel(asn)` | `GET /as/{asn}` |
| `prefixIntel(net, mask)` | `GET /prefix/{net}/{mask}` |
| `domainIntel(domain)` | `GET /domain/{domain}` |
| `certIntel(sha256)` | `GET /cert/{sha256}` |
| `portIntel(port)` | `GET /port/{port}` |
| `softwareIntel(name, version?)` | `GET /software/{name}[/{version}]` |
| `recentScans(target)` | `GET /scan/{target}` |
| `fullscan(target, options)` | `POST /fullscan` |
| `fullscanStatus(uuid)` | `GET /fullscan/{uuid}` |
| `fullscanResults(uuid)` | `GET /fullscan/{uuid}/results` |
| `waitForFullscan(uuid, options)` | polls `GET /fullscan/{uuid}` |

## Development

```bash
npm test           # offline unit tests (fetch stubbed, no network)
npm run test:live  # live smoke test against the production API
```

### Releasing

Bump `version` in `package.json`, then push a matching `v*` tag. The tag
mirrors to GitHub and triggers `.github/workflows/publish.yml`, which
publishes through [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers)
— an OIDC exchange, so no npm token is stored in GitHub or GitLab. The
workflow refuses to publish if the tag and `package.json` disagree.

## License

ISC License
