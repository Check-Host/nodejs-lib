import CheckHost from './index.js';

async function runTests() {
    console.log('--- Instantiating CheckHost Client ---');
    // CI populates CHECK_HOST_API_KEY from a masked GitLab variable so the
    // pipeline gets the higher per-key rate limit; locally we fall back to
    // anonymous limits.
    const apikey = process.env.CHECK_HOST_API_KEY || null;
    if (apikey) console.log('(using API key from env)');
    const api = new CheckHost({ apikey });

    try {
        console.log('\n--- Testing GET /locations ---');
        const locations = await api.locations();
        console.log(`Success: Retrieved locations (got data: ${!!locations})`);

        console.log('\n--- Testing POST /info ---');
        // Using a safe Check-host target
        const info = await api.info('check-host.cc');
        console.log('Success: Info retrieved:');
        console.log(JSON.stringify(info, null, 2).substring(0, 100) + '...');

        console.log('\n--- Testing POST /ping with optional parameters ---');
        const pingOptions = {
            region: ['DE', 'NL'],
            repeatchecks: 1
        };
        const pingResult = await api.ping('1.1.1.1', pingOptions);
        console.log('Success: Ping check started to 1.1.1.1');
        console.log(JSON.stringify(pingResult, null, 2));

    } catch (err) {
        console.error('\n--- TEST FAILED ---');
        console.error(err);
    }
}

runTests();
