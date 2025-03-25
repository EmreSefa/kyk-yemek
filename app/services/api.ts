import axios from "axios";

// Base API URL can be configured here
const BASE_URL = "https://api.kykyemek.com";

/**
 * Simple API client for making network requests
 */
const api = {
  /**
   * Make a GET request
   * @param endpoint The API endpoint path
   * @param params Optional query parameters
   * @returns Promise with response data
   */
  async get(endpoint: string, params?: object) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, { params });
      return response;
    } catch (error) {
      console.error(`API GET error for ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Make a POST request
   * @param endpoint The API endpoint path
   * @param data Request body data
   * @param config Optional axios config
   * @returns Promise with response data
   */
  async post(endpoint: string, data: any, config?: object) {
    try {
      const response = await axios.post(`${BASE_URL}${endpoint}`, data, config);
      return response;
    } catch (error) {
      console.error(`API POST error for ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Make a PUT request
   * @param endpoint The API endpoint path
   * @param data Request body data
   * @returns Promise with response data
   */
  async put(endpoint: string, data: any) {
    try {
      const response = await axios.put(`${BASE_URL}${endpoint}`, data);
      return response;
    } catch (error) {
      console.error(`API PUT error for ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Make a DELETE request
   * @param endpoint The API endpoint path
   * @returns Promise with response data
   */
  async delete(endpoint: string) {
    try {
      const response = await axios.delete(`${BASE_URL}${endpoint}`);
      return response;
    } catch (error) {
      console.error(`API DELETE error for ${endpoint}:`, error);
      throw error;
    }
  },
};

export default api;
