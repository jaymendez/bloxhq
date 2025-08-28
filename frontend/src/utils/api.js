const API_BASE_URL = "http://localhost:4001/api";

/**
 * Custom fetch wrapper for API requests
 * @param {string} endpoint - API endpoint (without /api prefix)
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} - Response promise
 */
export const api = {
  /**
   * Make a fetch request to the API
   * @param {string} endpoint - API endpoint (without /api prefix)
   * @param {Object} options - Fetch options (method, headers, body, etc.)
   * @returns {Promise} - Response promise
   */
  fetch: async (endpoint, options = {}) => {
    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;

    // Construct the full URL
    const url = `${API_BASE_URL}${normalizedEndpoint}`;

    // Default headers
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `API error: ${response.status} ${response.statusText}`
        );
      }

      // Parse JSON response
      return await response.json();
    } catch (error) {
      // Add custom error handling here if needed
      console.error("API request failed:", error);
      throw error;
    }
  },

  /**
   * Shorthand for GET requests
   * @param {string} endpoint - API endpoint (without /api prefix)
   * @param {Object} options - Additional fetch options
   * @returns {Promise} - Response promise
   */
  get: (endpoint, options = {}) => {
    return api.fetch(endpoint, {
      ...options,
      method: "GET",
    });
  },
};

export default api;
