/**
 * Live smoke test against the production API.
 *
 *   npm run test:live
 *
 * Exits non-zero on the first failure so CI actually gates on it. The
 * deterministic, offline suite is `npm test` (test/unit.test.js).
 */

import CheckHost from './index.js';

let failures = 0;

async function step(label, fn) {
    process.stdout.write(`\n--- ${label} ---\n`);
    try {
        const result = await fn();
        console.log(`OK: ${result}`);
    } catch (err) {
        failures += 1;
        console.error(`FAILED: ${err.message}`);
        if (err.status) console.error(`  status: ${err.status}`);
        if (err.data) console.error(`  body:   ${JSON.stringify(err.data).slice(0, 200)}`);
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

async function runTests() {
    console.log('--- Instantiating CheckHost Client ---');
    // CI populates CHECK_HOST_API_TOKEN from a masked GitLab variable so the
    // pipeline gets the higher per-token rate limit; locally we fall back to
    // anonymous limits. The Client reads the env var itself.
    const token = process.env.CHECK_HOST_API_TOKEN || process.env.CHECK_HOST_API_KEY || null;
    console.log(token ? '(using API token from env)' : '(anonymous)');
    const api = new CheckHost({ token });

    await step('GET /locations', async () => {
        const locations = await api.locations();
        assert(Array.isArray(locations?.locationlist), 'expected a locationlist array');
        return `${locations.locationlist.length} nodes`;
    });

    await step('GET /myip', async () => {
        const res = await api.myip();
        assert(res?.ip, 'expected an ip field');
        return res.ip;
    });

    await step('POST /info', async () => {
        const info = await api.info('check-host.cc');
        assert(info?.ip, 'expected an ip field');
        return `${info.ip} -> ${info.city}, ${info.country}`;
    });

    await step('POST /ping', async () => {
        const result = await api.ping('1.1.1.1', { region: ['DE', 'NL'], repeatchecks: 1 });
        assert(result?.uuid, 'expected a uuid');
        return `uuid ${result.uuid}`;
    });

    await step('GET /ip/{ip}', async () => {
        const intel = await api.ipIntel('1.1.1.1');
        assert(intel?.success === true, 'expected success: true');
        assert(intel.ip === '1.1.1.1', 'expected the ip to echo back');
        return `family ${intel.family}`;
    });

    await step('GET /as/{asn}', async () => {
        const intel = await api.asnIntel('AS13335');
        assert(intel?.success === true, 'expected success: true');
        assert(intel.asn === 13335, `expected asn 13335, got ${intel.asn}`);
        return `${intel.as_name}`;
    });

    await step('GET /prefix/{net}/{mask}', async () => {
        const intel = await api.prefixIntel('1.1.1.0', 24);
        assert(intel?.success === true, 'expected success: true');
        return `${intel.cidr}`;
    });

    await step('GET /domain/{domain}', async () => {
        const intel = await api.domainIntel('check-host.cc');
        assert(intel?.success === true, 'expected success: true');
        return `${intel.domain}`;
    });

    await step('GET /port/{port}', async () => {
        const intel = await api.portIntel(443);
        assert(intel?.success === true, 'expected success: true');
        return `${intel.port} (${intel.well_known})`;
    });

    await step('GET /software/{name}', async () => {
        const intel = await api.softwareIntel('nginx');
        assert(intel?.success === true, 'expected success: true');
        return `${intel.name}`;
    });

    await step('GET /scan/{target}', async () => {
        const scans = await api.recentScans('check-host.cc');
        assert(scans?.success === true, 'expected success: true');
        assert(Array.isArray(scans.recent_scans), 'expected a recent_scans array');
        return `${scans.recent_scans.length} recent scan(s)`;
    });

    console.log(
        failures === 0
            ? '\n--- ALL LIVE CHECKS PASSED ---'
            : `\n--- ${failures} LIVE CHECK(S) FAILED ---`
    );
    process.exit(failures === 0 ? 0 : 1);
}

runTests();
