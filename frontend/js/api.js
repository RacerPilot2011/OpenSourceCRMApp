import { CONFIG } from './config.js';

class API {
  constructor() {
    this.baseURL = CONFIG.API_URL;
    this.token = localStorage.getItem('token');
    console.log('API initialized with baseURL:', this.baseURL);
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    }
    console.log('Token set:', token ? 'Yes (length: ' + token.length + ')' : 'No');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('API Request:', options.method || 'GET', url);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log('Token included in request');
    } else {
      console.log('No token in request');
    }

    console.log('Request body:', options.body);

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login.html';
          throw new Error('Session expired. Please login again.');
        }

        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

export const api = new API();