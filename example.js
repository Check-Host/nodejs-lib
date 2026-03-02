import CheckHost from '@check-hostcc/check-host-api';

// Initialize the API wrapper. 
// You can optionally pass your API key here to bump your rate limits.
// Example: const api = new CheckHost({ apikey: 'YOUR_API_KEY' });
const api = new CheckHost();

async function runExamples() {
    try {
        console.log('--- Check-Host API Demonstration ---');

        // 1. Fetch available nodes globally (GET)
        console.log('\n1. Fetching available global locations...');
        const locations = await api.locations();
        // The API returns a large Object for locations, we just print the keys representing nodes
        console.log(`Successfully retrieved ${Object.keys(locations).length} locations!`);

        // 2. Perform a Ping check on a host (POST) with optional parameters
        console.log('\n2. Initiating Ping task to 8.8.8.8 in DE and NL...');
        const pingTask = await api.ping('8.8.8.8', {
            region: ['DE', 'NL'], // Filter nodes by ISO Country Code
            repeatchecks: 2       // Send 2 packets from each node
        });

        console.log(`Task Created! UUID: ${pingTask.uuid}`);
        console.log('Waiting 2 seconds for nodes to execute the ping request...');

        // Wait for nodes to execute checks (2-3 seconds is optimal)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 3. Retrieve the results of the Ping check (GET)
        console.log('\n3. Fetching Ping Report results...');
        const reportResult = await api.report(pingTask.uuid);

        console.log('--- Results Snippet ---');
        // We print just a snippet of the potentially massive JSON response
        console.log(JSON.stringify(reportResult, null, 2).substring(0, 300) + '\n... (truncated)');

        console.log('\nDemonstration complete!');

    } catch (error) {
        console.error('\nAn active error occurred during the demonstration:');
        console.error(error.message);
    }
}

// Run the demo
runExamples();
