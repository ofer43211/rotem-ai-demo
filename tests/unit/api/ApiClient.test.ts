import { ApiClient } from '../../../src/api/ApiClient';

describe('ApiClient', () => {
  describe('constructor', () => {
    it('should create client with base URL', () => {
      const client = new ApiClient('https://api.example.com');

      expect(client.getBaseUrl()).toBe('https://api.example.com');
    });

    it('should remove trailing slash from base URL', () => {
      const client = new ApiClient('https://api.example.com/');

      expect(client.getBaseUrl()).toBe('https://api.example.com');
    });

    it('should set default headers', () => {
      const client = new ApiClient('https://api.example.com');
      const headers = client.getDefaultHeaders();

      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should merge custom default headers', () => {
      const client = new ApiClient('https://api.example.com', {
        Authorization: 'Bearer token123',
        'X-Custom-Header': 'value',
      });

      const headers = client.getDefaultHeaders();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers.Authorization).toBe('Bearer token123');
      expect(headers['X-Custom-Header']).toBe('value');
    });

    it('should throw error for empty base URL', () => {
      expect(() => new ApiClient('')).toThrow('Base URL is required');
    });
  });

  describe('get', () => {
    let client: ApiClient;

    beforeEach(() => {
      client = new ApiClient('https://api.example.com');
    });

    it('should make GET request', async () => {
      const response = await client.get('/users');

      expect(response.status).toBe(200);
      expect(response.message).toBe('Success');
      expect(response.data).toBeDefined();
    });

    it('should handle leading slash in endpoint', async () => {
      const response = await client.get('/users');

      expect(response).toBeDefined();
    });

    it('should handle endpoint without leading slash', async () => {
      const response = await client.get('users');

      expect(response).toBeDefined();
    });

    it('should include custom headers', async () => {
      const response = await client.get('/users', {
        headers: { 'X-Custom': 'test' },
      });

      expect(response).toBeDefined();
    });

    it('should handle error endpoints', async () => {
      await expect(client.get('/error')).rejects.toThrow('Server error');
    });

    it('should handle not found endpoints', async () => {
      const response = await client.get('/not-found');

      expect(response.status).toBe(404);
      expect(response.message).toBe('Not found');
    });

    it('should handle timeout', async () => {
      await expect(client.get('/users', { timeout: 50 })).rejects.toThrow('Request timeout');
    });
  });

  describe('post', () => {
    let client: ApiClient;

    beforeEach(() => {
      client = new ApiClient('https://api.example.com');
    });

    it('should make POST request with data', async () => {
      const data = { name: 'John Doe', email: 'john@example.com' };
      const response = await client.post('/users', data);

      expect(response.status).toBe(200);
      expect(response.message).toBe('Success');
      expect(response.data).toEqual(data);
    });

    it('should handle empty data object', async () => {
      const response = await client.post('/users', {});

      expect(response).toBeDefined();
    });

    it('should include custom headers', async () => {
      const data = { name: 'John Doe' };
      const response = await client.post('/users', data, {
        headers: { 'X-Request-ID': '123' },
      });

      expect(response).toBeDefined();
    });

    it('should handle error endpoints', async () => {
      await expect(client.post('/error', {})).rejects.toThrow('Server error');
    });
  });

  describe('put', () => {
    let client: ApiClient;

    beforeEach(() => {
      client = new ApiClient('https://api.example.com');
    });

    it('should make PUT request with data', async () => {
      const data = { name: 'Jane Doe', email: 'jane@example.com' };
      const response = await client.put('/users/1', data);

      expect(response.status).toBe(200);
      expect(response.message).toBe('Success');
      expect(response.data).toEqual(data);
    });

    it('should handle error endpoints', async () => {
      await expect(client.put('/error', {})).rejects.toThrow('Server error');
    });
  });

  describe('delete', () => {
    let client: ApiClient;

    beforeEach(() => {
      client = new ApiClient('https://api.example.com');
    });

    it('should make DELETE request', async () => {
      const response = await client.delete('/users/1');

      expect(response.status).toBe(200);
      expect(response.message).toBe('Success');
    });

    it('should handle error endpoints', async () => {
      await expect(client.delete('/error')).rejects.toThrow('Server error');
    });

    it('should handle not found', async () => {
      const response = await client.delete('/not-found');

      expect(response.status).toBe(404);
    });
  });

  describe('header management', () => {
    let client: ApiClient;

    beforeEach(() => {
      client = new ApiClient('https://api.example.com');
    });

    it('should set default header', () => {
      client.setDefaultHeader('Authorization', 'Bearer token');

      const headers = client.getDefaultHeaders();
      expect(headers.Authorization).toBe('Bearer token');
    });

    it('should update existing default header', () => {
      client.setDefaultHeader('Content-Type', 'text/plain');

      const headers = client.getDefaultHeaders();
      expect(headers['Content-Type']).toBe('text/plain');
    });

    it('should remove default header', () => {
      client.setDefaultHeader('X-Custom', 'value');
      client.removeDefaultHeader('X-Custom');

      const headers = client.getDefaultHeaders();
      expect(headers['X-Custom']).toBeUndefined();
    });

    it('should not affect other headers when removing', () => {
      client.setDefaultHeader('X-Custom', 'value');
      client.removeDefaultHeader('X-Custom');

      const headers = client.getDefaultHeaders();
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should return copy of default headers', () => {
      const headers1 = client.getDefaultHeaders();
      headers1.Modified = 'should-not-affect';

      const headers2 = client.getDefaultHeaders();
      expect(headers2.Modified).toBeUndefined();
    });
  });

  describe('URL building', () => {
    it('should build correct URL with various base URLs', () => {
      const client1 = new ApiClient('https://api.example.com');
      expect(client1.getBaseUrl()).toBe('https://api.example.com');

      const client2 = new ApiClient('https://api.example.com/v1');
      expect(client2.getBaseUrl()).toBe('https://api.example.com/v1');

      const client3 = new ApiClient('https://api.example.com/v1/');
      expect(client3.getBaseUrl()).toBe('https://api.example.com/v1');
    });
  });

  describe('request delays', () => {
    let client: ApiClient;

    beforeEach(() => {
      client = new ApiClient('https://api.example.com');
    });

    it('should simulate network delay', async () => {
      const startTime = Date.now();
      await client.get('/users');
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take at least 100ms due to simulated delay
      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });
});
