/**
 * Offline unit tests. `fetch` is stubbed, so nothing here touches the
 * network - these run deterministically in CI.
 *
 *   node --test test/
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import CheckHost from '../index.js';
import Client from '../lib/Client.js';

/**
 * Replaces global fetch with a recorder that always answers `body`.
 * Returns the recorded calls plus a restore function.
 */
function stubFetch(body = { ok: true }, { status = 200, binary = false } = {}) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    return {
      ok: status < 400,
      status,
      statusText: `HTTP ${status}`,
      json: async () => body,
      arrayBuffer: async () => new TextEncoder().encode('binary-body').buffer,
    };
  };
  return {
    calls,
    restore() {
      globalThis.fetch = original;
    },
  };
}

/** Runs `fn` with fetch stubbed, always restoring afterwards. */
async function withStub(body, opts, fn) {
  const stub = stubFetch(body, opts);
  try {
    await fn(stub);
  } finally {
    stub.restore();
  }
}

// Keep an ambient CI token from leaking into the anonymous-path assertions.
delete process.env.CHECK_HOST_API_TOKEN;
delete process.env.CHECK_HOST_API_KEY;

test('token is sent as an Authorization: Bearer header', async () => {
  await withStub({ ok: true }, {}, async ({ calls }) => {
    const api = new CheckHost({ token: 'tok-123' });
    await api.ping('1.1.1.1');
    assert.equal(calls[0].options.headers.Authorization, 'Bearer tok-123');
  });
});

test('token never reaches the request body', async () => {
  await withStub({ ok: true }, {}, async ({ calls }) => {
    const api = new CheckHost({ token: 'tok-123' });
    await api.ping('1.1.1.1', { region: ['DE'] });
    const body = JSON.parse(calls[0].options.body);
    assert.deepEqual(body, { target: '1.1.1.1', region: ['DE'] });
    assert.equal(body.apikey, undefined);
  });
});

test('token never reaches the URL', async () => {
  await withStub({ ok: true }, {}, async ({ calls }) => {
    const api = new CheckHost({ token: 'tok-123' });
    await api.locations();
    assert.ok(!calls[0].url.includes('tok-123'));
  });
});

test('GET requests are authenticated too', async () => {
  await withStub({ ok: true }, {}, async ({ calls }) => {
    const api = new CheckHost({ token: 'tok-123' });
    await api.ipIntel('1.1.1.1');
    assert.equal(calls[0].options.headers.Authorization, 'Bearer tok-123');
  });
});

test('binary requests are authenticated too', async () => {
  await withStub({ ok: true }, {}, async ({ calls }) => {
    const api = new CheckHost({ token: 'tok-123' });
    await api.ogImage('uuid-1');
    assert.equal(calls[0].options.headers.Authorization, 'Bearer tok-123');
    assert.equal(calls[0].options.headers.Accept, 'image/png');
  });
});

test('anonymous clients send no Authorization header', async () => {
  await withStub({ ok: true }, {}, async ({ calls }) => {
    const api = new CheckHost();
    await api.ping('1.1.1.1');
    assert.equal(calls[0].options.headers.Authorization, undefined);
  });
});

test('deprecated apikey option still authenticates', async () => {
  await withStub({ ok: true }, {}, async ({ calls }) => {
    const api = new CheckHost({ apikey: 'old-style' });
    await api.ping('1.1.1.1');
    assert.equal(calls[0].options.headers.Authorization, 'Bearer old-style');
  });
});

test('CHECK_HOST_API_TOKEN is picked up from the environment', async () => {
  process.env.CHECK_HOST_API_TOKEN = 'env-token';
  try {
    await withStub({ ok: true }, {}, async ({ calls }) => {
      const api = new CheckHost();
      await api.myip();
      assert.equal(calls[0].options.headers.Authorization, 'Bearer env-token');
    });
  } finally {
    delete process.env.CHECK_HOST_API_TOKEN;
  }
});

test('legacy CHECK_HOST_API_KEY is still honoured', async () => {
  process.env.CHECK_HOST_API_KEY = 'legacy-token';
  try {
    await withStub({ ok: true }, {}, async ({ calls }) => {
      const api = new CheckHost();
      await api.myip();
      assert.equal(calls[0].options.headers.Authorization, 'Bearer legacy-token');
    });
  } finally {
    delete process.env.CHECK_HOST_API_KEY;
  }
});

test('baseUrl override is honoured and trailing slashes trimmed', () => {
  const client = new Client({ baseUrl: 'https://example.com/api/' });
  assert.equal(client.baseUrl, 'https://example.com/api');
});

test('intelligence endpoints build the documented paths', async () => {
  const cases = [
    [(api) => api.ipIntel('1.1.1.1'), '/ip/1.1.1.1'],
    [(api) => api.asnIntel('AS13335'), '/as/13335'],
    [(api) => api.asnIntel(13335), '/as/13335'],
    [(api) => api.asnIntel('13335'), '/as/13335'],
    [(api) => api.prefixIntel('1.1.1.0', 24), '/prefix/1.1.1.0/24'],
    [(api) => api.domainIntel('check-host.cc'), '/domain/check-host.cc'],
    [(api) => api.certIntel('A'.repeat(64)), `/cert/${'a'.repeat(64)}`],
    [(api) => api.portIntel(443), '/port/443'],
    [(api) => api.softwareIntel('nginx'), '/software/nginx'],
    [(api) => api.softwareIntel('nginx', '1.24.0'), '/software/nginx/1.24.0'],
    [(api) => api.recentScans('check-host.cc'), '/scan/check-host.cc'],
  ];

  for (const [invoke, expected] of cases) {
    await withStub({ success: true }, {}, async ({ calls }) => {
      const api = new CheckHost();
      await invoke(api);
      assert.equal(
        calls[0].url,
        `https://api.check-host.cc${expected}`,
        `expected path ${expected}`
      );
      assert.equal(calls[0].options.method, 'GET');
    });
  }
});

test('domain intelligence percent-encodes the path segment', async () => {
  await withStub({ success: true }, {}, async ({ calls }) => {
    const api = new CheckHost();
    await api.domainIntel('a b.example');
    assert.equal(calls[0].url, 'https://api.check-host.cc/domain/a%20b.example');
  });
});

test('intelligence endpoints reject malformed input', async () => {
  const api = new CheckHost();
  await assert.rejects(() => api.ipIntel(''), /IP is required/);
  await assert.rejects(() => api.asnIntel('not-an-asn'), /asn must look like/);
  await assert.rejects(() => api.prefixIntel('1.1.1.0', 129), /mask must be/);
  await assert.rejects(() => api.prefixIntel('1.1.1.0', 'x'), /mask must be/);
  await assert.rejects(() => api.certIntel('deadbeef'), /64 hexadecimal/);
  await assert.rejects(() => api.portIntel(70000), /between 1 and 65535/);
  await assert.rejects(() => api.softwareIntel(''), /Software name is required/);
  await assert.rejects(() => api.recentScans(''), /Target is required/);
});

test('fullscan submit posts target and scope', async () => {
  await withStub({ success: true, uuid: 'scan-1' }, {}, async ({ calls }) => {
    const api = new CheckHost();
    await api.fullscan('check-host.cc', { scope: 'full' });
    assert.equal(calls[0].url, 'https://api.check-host.cc/fullscan');
    assert.equal(calls[0].options.method, 'POST');
    assert.deepEqual(JSON.parse(calls[0].options.body), {
      target: 'check-host.cc',
      scope: 'full',
    });
  });
});

test('fullscan submit defaults to the deep scope', async () => {
  await withStub({ success: true }, {}, async ({ calls }) => {
    const api = new CheckHost();
    await api.fullscan('check-host.cc');
    assert.equal(JSON.parse(calls[0].options.body).scope, 'deep');
  });
});

test('fullscan rejects an unknown scope and a missing target', async () => {
  const api = new CheckHost();
  await assert.rejects(() => api.fullscan('x', { scope: 'turbo' }), /scope must be one of/);
  await assert.rejects(() => api.fullscan(''), /Target is required/);
});

test('fullscan status and results build the documented paths', async () => {
  await withStub({ success: true, job: {} }, {}, async ({ calls }) => {
    const api = new CheckHost();
    await api.fullscanStatus('scan-1');
    assert.equal(calls[0].url, 'https://api.check-host.cc/fullscan/scan-1');
  });
  await withStub({ success: true, data: {} }, {}, async ({ calls }) => {
    const api = new CheckHost();
    await api.fullscanResults('scan-1');
    assert.equal(calls[0].url, 'https://api.check-host.cc/fullscan/scan-1/results');
  });
});

test('waitForFullscan returns immediately for a terminal job', async () => {
  await withStub(
    { success: true, job: { uuid: 'scan-1', status: 'complete' } },
    {},
    async ({ calls }) => {
      const api = new CheckHost();
      const job = await api.waitForFullscan('scan-1');
      assert.equal(job.status, 'complete');
      assert.equal(calls.length, 1);
    }
  );
});

test('waitForFullscan throws when the deadline passes', async () => {
  await withStub({ success: true, job: { status: 'running' } }, {}, async () => {
    const api = new CheckHost();
    await assert.rejects(
      () => api.waitForFullscan('scan-1', { maxWait: 0 }),
      /not finished after 0ms/
    );
  });
});

test('waitForFullscan can return a non-terminal job instead of throwing', async () => {
  await withStub({ success: true, job: { status: 'running' } }, {}, async () => {
    const api = new CheckHost();
    const job = await api.waitForFullscan('scan-1', {
      maxWait: 0,
      requireComplete: false,
    });
    assert.equal(job.status, 'running');
  });
});

test('myinfo hits the documented path', async () => {
  await withStub({ ip: '1.2.3.4' }, {}, async ({ calls }) => {
    const api = new CheckHost();
    await api.myinfo();
    assert.equal(calls[0].url, 'https://api.check-host.cc/myinfo');
  });
});

test('non-2xx responses raise an error carrying status and body', async () => {
  await withStub({ success: false, error: 'nope' }, { status: 429 }, async () => {
    const api = new CheckHost();
    await assert.rejects(
      () => api.ping('1.1.1.1'),
      (err) => {
        assert.equal(err.status, 429);
        assert.equal(err.data.error, 'nope');
        return true;
      }
    );
  });
});
