# Check-Host API Node.js Library

A modern, fast, and feature-complete Node.js wrapper for the [Check-Host.cc API](https://docs.check-host.cc/).

## Features

- Built purely with the native Node.js 18+ `fetch` API. No external dependencies (`axios`, `node-fetch`, etc.) are needed!
- Uses `POST` for all active monitoring endpoints (Ping, DNS, TCP, UDP, HTTP, MTR) ensuring URL encoding issues do not occur.
- Modular design: every endpoint strategy lives in an isolated file for cleaner code tracking.
- API Key auto-injection: Configure your API key once and let the core handle the payloads.

## Requirements

- **Node.js**: v18.0.0 or higher.

## Installation

Since this library doesn't depend on external modules, simply include it in your project.

## Usage

```javascript
const CheckHost = require('./nodejs-lib/index');

// Initialize the client. The API Key is optional.
// Without an API key, standard public rate limits apply.
const checkHost = new CheckHost({ apikey: 'YOUR_API_KEY_HERE' }); // Or leave empty: new CheckHost()

async function runCheck() {
  try {
    // 1. Fetch available nodes globally (GET)
    const locations = await checkHost.locations();
    console.log('Available Locations:', locations);

    // 2. Perform a Ping check on a host (POST)
    const pingTask = await checkHost.ping('8.8.8.8', {
      region: ['US', 'EU'], // Filter nodes
      repeatchecks: 5       // Send 5 packets
    });
    console.log('Ping check initiated with UUID:', pingTask.uuid);

    // 3. Retrieve the results incrementally (GET)
    // Note: It's recommended to query this after a short delay
    const results = await checkHost.report(pingTask.uuid);
    console.log('Report Results:', results);

  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

runCheck();
```

## Available Methods

Most monitoring endpoints accept standard Check-Host options such as `region` and `repeatchecks`.

### active Monitoring (POST)
- `api.info(target)`
- `api.whois(target)`
- `api.ping(target, options)`
- `api.dns(target, options)`
- `api.tcp(target, port, options)`
- `api.udp(target, port, options)`
- `api.http(target, options)`
- `api.mtr(target, options)`

### Data Retrieval (GET)
- `api.locations()`
- `api.report(uuid)`
- `api.myip()`

## License

ISC License
