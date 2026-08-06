/**
 * Client class to handle interaction with the check-host.cc API.
 */
export default class Client {
  /**
   * @param {Object} [options]
   * @param {string} [options.token] - API token (UUID) for higher rate limits.
   *   Sent as an `Authorization: Bearer <token>` header on every request.
   *   Falls back to the `CHECK_HOST_API_TOKEN` environment variable.
   * @param {string} [options.apikey] - Deprecated alias for `token`.
   * @param {string} [options.baseUrl] - Override the API base URL.
   */
  constructor({ token = null, apikey = null, baseUrl = null } = {}) {
    if (apikey && !token) {
      process.emitWarning(
        "The 'apikey' option is deprecated and will be removed in 2.0; use 'token' instead. " +
          'The credential is now sent as an Authorization: Bearer header rather than in the request body.',
        'DeprecationWarning'
      );
    }
    this.token =
      token ||
      apikey ||
      (typeof process !== 'undefined' &&
        (process.env?.CHECK_HOST_API_TOKEN || process.env?.CHECK_HOST_API_KEY)) ||
      null;
    this.baseUrl = (baseUrl || 'https://api.check-host.cc').replace(/\/+$/, '');
  }

  /**
   * Builds the outgoing header set, adding Bearer auth when a token is set.
   * The token never goes into the URL or the request body.
   * @param {Object} [extra] - Headers to merge in.
   * @returns {Object}
   */
  buildHeaders(extra = {}) {
    const headers = { Accept: 'application/json', ...extra };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Internal method to execute API requests.
   * @param {string} endpoint - The API endpoint (e.g., '/ping')
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} The API response
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = this.buildHeaders(options.headers || {});

    if (options.method === 'POST') {
      headers['Content-Type'] = 'application/json';
      options.body = options.body ?? JSON.stringify({});
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error = new Error(`API Error: ${response.status} ${response.statusText}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.name === 'FetchError' || error.name === 'TypeError') {
        throw new Error(`Network Error: Failed to fetch from ${url}. ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Performs a GET request.
   * @param {string} endpoint
   * @returns {Promise<Object>}
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * Performs a POST request.
   * @param {string} endpoint
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async post(endpoint, payload = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * GET request that returns the raw response body as a Uint8Array.
   * Used for binary endpoints (og-image PNG, country-map PNG/SVG).
   * @param {string} endpoint
   * @param {Object} [opts]
   * @param {string} [opts.accept] - Override the Accept header.
   * @returns {Promise<Uint8Array>}
   */
  async getBinary(endpoint, { accept = 'image/png, image/svg+xml, */*' } = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.buildHeaders({ Accept: accept }),
      });
      if (!response.ok) {
        const error = new Error(
          `API Error: ${response.status} ${response.statusText}`
        );
        error.status = response.status;
        try { error.data = await response.json(); } catch { /* ignore */ }
        throw error;
      }
      const buf = await response.arrayBuffer();
      return new Uint8Array(buf);
    } catch (error) {
      if (error.name === 'FetchError' || error.name === 'TypeError') {
        throw new Error(
          `Network Error: Failed to fetch from ${url}. ${error.message}`
        );
      }
      throw error;
    }
  }
}
