const CheckHost = require('./index');

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

    } catch (err) {
        console.error('\n--- TEST FAILED ---');
        console.error(err);
    }
}

runTests();
