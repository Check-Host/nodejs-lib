/**
 * Fullscan - a deep, on-demand multi-stage scan of an IP, CIDR, domain or
 * ASN (ports + banners + TLS + DNS + threat-intel).
 *
 * Asynchronous: submit a job, poll its status, then read the aggregated
 * findings. Scans routinely take minutes, not seconds.
 */

const SCOPES = ['basic', 'deep', 'full'];
const TERMINAL_STATUSES = ['complete', 'partial', 'failed'];

/**
 * True once a job row has reached a terminal status.
 * @param {Object} job
 * @returns {boolean}
 */
export function isFinished(job) {
    return TERMINAL_STATUSES.includes(String(job?.status || '').toLowerCase());
}

/**
 * Dispatches a fullscan job.
 *
 * Anonymous CIDR submissions are capped at /24 (v4) and /120 (v6); an API
 * token raises that to /20 and /112.
 *
 * @param {import('../Client.js').default} client
 * @param {string} target - IPv4/IPv6 address, CIDR block, domain or AS number.
 * @param {Object} [options]
 * @param {'basic'|'deep'|'full'} [options.scope='deep'] - `basic` = top-100
 *   ports + banner; `deep` = full port range + TLS + body + threat-intel;
 *   `full` = deep plus subdomain enumeration (domains only).
 * @returns {Promise<Object>} The job row, with `status: 'pending'`.
 *
 * @example
 * const job = await api.fullscan('check-host.cc', { scope: 'deep' });
 * console.log(job.uuid);
 */
export async function fullscan(client, target, options = {}) {
    if (!target) throw new Error('Target is required to submit a fullscan.');
    const scope = options.scope ?? 'deep';
    if (!SCOPES.includes(scope)) {
        throw new Error(`scope must be one of ${SCOPES.join(', ')}, got '${scope}'.`);
    }
    return client.post('/fullscan', { target, scope });
}

/**
 * Polls a fullscan's progress counters.
 *
 * @param {import('../Client.js').default} client
 * @param {string} uuid
 * @returns {Promise<Object>} `{ success, job }`.
 *
 * @example
 * const { job } = await api.fullscanStatus(uuid);
 * console.log(job.subjobs_done, '/', job.subjobs_total);
 */
export async function fullscanStatus(client, uuid) {
    if (!uuid) throw new Error('UUID is required to poll a fullscan.');
    return client.get(`/fullscan/${encodeURIComponent(uuid)}`);
}

/**
 * Fetches the aggregated findings a fullscan produced - open ports,
 * banners, DNS records, BGP context and TLS certificates. Partial results
 * are available while the job is still running.
 *
 * @param {import('../Client.js').default} client
 * @param {string} uuid
 * @returns {Promise<Object>}
 *
 * @example
 * const { data } = await api.fullscanResults(uuid);
 * console.log(data.open_ports);
 */
export async function fullscanResults(client, uuid) {
    if (!uuid) throw new Error('UUID is required to fetch fullscan results.');
    return client.get(`/fullscan/${encodeURIComponent(uuid)}/results`);
}

/**
 * Polls `/fullscan/{uuid}` until the job reaches a terminal status.
 *
 * @param {import('../Client.js').default} client
 * @param {string} uuid
 * @param {Object} [options]
 * @param {number} [options.interval=3000] - Milliseconds between polls (min 1000).
 * @param {number} [options.maxWait=300000] - Total milliseconds to wait.
 * @param {boolean} [options.requireComplete=true] - Throw when the deadline
 *   passes while the job is still pending/running. Set false to return the
 *   latest job row instead.
 * @returns {Promise<Object>} The job row.
 *
 * @example
 * const job = await api.waitForFullscan(uuid, { maxWait: 120000 });
 */
export async function waitForFullscan(client, uuid, options = {}) {
    if (!uuid) throw new Error('UUID is required to poll a fullscan.');
    const interval = Math.max(options.interval ?? 3000, 1000);
    const maxWait = options.maxWait ?? 300000;
    const requireComplete = options.requireComplete ?? true;

    const deadline = Date.now() + maxWait;
    let job = (await fullscanStatus(client, uuid))?.job;
    if (isFinished(job)) return job;

    for (;;) {
        const remaining = deadline - Date.now();
        if (remaining <= 0) break;
        await new Promise((resolve) => setTimeout(resolve, Math.min(interval, remaining)));
        job = (await fullscanStatus(client, uuid))?.job;
        if (isFinished(job)) return job;
    }

    if (requireComplete) {
        const error = new Error(
            `Fullscan ${uuid} not finished after ${maxWait}ms ` +
            `(status=${job?.status}, ${job?.subjobs_done}/${job?.subjobs_total} sub-jobs).`
        );
        error.job = job;
        throw error;
    }
    return job;
}
