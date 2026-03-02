import CheckHost from './index.js';

async function runTests() {
    console.log('--- Instantiating CheckHost Client ---');
    // We use no API key for testing public limits
    const api = new CheckHost({ apikey: null });

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
