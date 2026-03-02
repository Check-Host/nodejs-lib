/**
 * Client class to handle interaction with the check-host.cc API.
 */
export default class Client {
  /**
   * @param {Object} options
   * @param {string} [options.apikey] - Optional API key for check-host.cc
   */
  constructor({ apikey = null } = {}) {
    this.apikey = apikey;
    this.baseUrl = 'https://api.check-host.cc';
  }

  /**
   * Internal method to execute API requests.
   * @param {string} endpoint - The API endpoint (e.g., '/ping')
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} The API response
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Set default headers
    const headers = {
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    // If it's a POST request and we have an apikey, inject it into the body
    if (options.method === 'POST') {
      headers['Content-Type'] = 'application/json';

      let bodyObj = {};
      if (options.body) {
        bodyObj = JSON.parse(options.body);
      }

      // Inject API key if available and not already set
      if (this.apikey && bodyObj.apikey === undefined) {
        bodyObj.apikey = this.apikey;
      }

      options.body = JSON.stringify(bodyObj);
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
}
