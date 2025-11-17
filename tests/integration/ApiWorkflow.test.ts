import { ApiClient } from '../../src/api/ApiClient';
import { Validator } from '../../src/utils/Validator';

describe('API Client Integration Tests', () => {
  let apiClient: ApiClient;
  let validator: Validator;

  beforeEach(() => {
    apiClient = new ApiClient('https://api.example.com');
    validator = new Validator();
  });

  describe('API request workflow', () => {
    it('should handle complete CRUD workflow', async () => {
      // Create (POST)
      const createData = {
        email: 'test@example.com',
        name: 'Test User',
        age: 25,
      };

      // Validate data before sending
      expect(validator.isEmail(createData.email)).toBe(true);
      expect(validator.validateAge(createData.age).valid).toBe(true);

      const createResponse = await apiClient.post('/users', createData);
      expect(createResponse.status).toBe(200);
      expect(createResponse.data).toEqual(createData);

      // Read (GET)
      const getResponse = await apiClient.get('/users/1');
      expect(getResponse.status).toBe(200);

      // Update (PUT)
      const updateData = {
        email: 'updated@example.com',
        name: 'Updated User',
        age: 30,
      };

      expect(validator.isEmail(updateData.email)).toBe(true);

      const updateResponse = await apiClient.put('/users/1', updateData);
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data).toEqual(updateData);

      // Delete (DELETE)
      const deleteResponse = await apiClient.delete('/users/1');
      expect(deleteResponse.status).toBe(200);
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = [
        apiClient.get('/users/1'),
        apiClient.get('/users/2'),
        apiClient.get('/users/3'),
        apiClient.post('/users', { name: 'New User' }),
      ];

      const responses = await Promise.all(requests);

      expect(responses).toHaveLength(4);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle request with custom headers', async () => {
      apiClient.setDefaultHeader('Authorization', 'Bearer token123');
      apiClient.setDefaultHeader('X-API-Key', 'api-key-456');

      const headers = apiClient.getDefaultHeaders();
      expect(headers.Authorization).toBe('Bearer token123');
      expect(headers['X-API-Key']).toBe('api-key-456');

      const response = await apiClient.get('/users');
      expect(response.status).toBe(200);
    });
  });

  describe('Error handling workflow', () => {
    it('should handle server errors gracefully', async () => {
      await expect(apiClient.get('/error')).rejects.toThrow('Server error');
      await expect(apiClient.post('/error', {})).rejects.toThrow('Server error');
      await expect(apiClient.put('/error', {})).rejects.toThrow('Server error');
      await expect(apiClient.delete('/error')).rejects.toThrow('Server error');
    });

    it('should handle not found responses', async () => {
      const response = await apiClient.get('/not-found');

      expect(response.status).toBe(404);
      expect(response.message).toBe('Not found');
    });

    it('should handle timeout errors', async () => {
      await expect(
        apiClient.get('/users', { timeout: 50 }),
      ).rejects.toThrow('Request timeout');
    });

    it('should continue working after errors', async () => {
      // First request fails
      await expect(apiClient.get('/error')).rejects.toThrow();

      // Subsequent requests should still work
      const response = await apiClient.get('/users');
      expect(response.status).toBe(200);
    });
  });

  describe('Header management workflow', () => {
    it('should manage headers throughout request lifecycle', () => {
      // Set initial headers
      apiClient.setDefaultHeader('X-Initial', 'value1');
      expect(apiClient.getDefaultHeaders()['X-Initial']).toBe('value1');

      // Update headers
      apiClient.setDefaultHeader('X-Initial', 'value2');
      expect(apiClient.getDefaultHeaders()['X-Initial']).toBe('value2');

      // Add more headers
      apiClient.setDefaultHeader('X-Another', 'value3');
      expect(apiClient.getDefaultHeaders()['X-Another']).toBe('value3');

      // Remove headers
      apiClient.removeDefaultHeader('X-Initial');
      expect(apiClient.getDefaultHeaders()['X-Initial']).toBeUndefined();
      expect(apiClient.getDefaultHeaders()['X-Another']).toBe('value3');
    });

    it('should merge headers correctly for requests', async () => {
      apiClient.setDefaultHeader('X-Default', 'default-value');

      const response = await apiClient.get('/users', {
        headers: { 'X-Request': 'request-value' },
      });

      expect(response).toBeDefined();
    });
  });

  describe('Data validation before API requests', () => {
    it('should validate user data before creating', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        age: 25,
        password: 'SecurePass123!',
      };

      // Validate all fields
      expect(validator.isEmail(userData.email)).toBe(true);
      expect(validator.isEmpty(userData.name)).toBe(false);
      expect(validator.validateAge(userData.age).valid).toBe(true);
      expect(validator.isStrongPassword(userData.password)).toBe(true);

      // Only send if validation passes
      const response = await apiClient.post('/users', userData);
      expect(response.status).toBe(200);
    });

    it('should prevent invalid data from being sent', async () => {
      const invalidData = {
        email: 'invalid-email',
        name: '',
        age: -5,
      };

      // Validate and catch issues
      const emailValid = validator.isEmail(invalidData.email);
      const nameValid = !validator.isEmpty(invalidData.name);
      const ageValid = validator.validateAge(invalidData.age).valid;

      expect(emailValid).toBe(false);
      expect(nameValid).toBe(false);
      expect(ageValid).toBe(false);

      // Don't send request if validation fails
      // In real app, you would throw or return error here
    });
  });

  describe('API client with different configurations', () => {
    it('should work with different base URLs', async () => {
      const client1 = new ApiClient('https://api1.example.com');
      const client2 = new ApiClient('https://api2.example.com');

      expect(client1.getBaseUrl()).toBe('https://api1.example.com');
      expect(client2.getBaseUrl()).toBe('https://api2.example.com');

      const response1 = await client1.get('/data');
      const response2 = await client2.get('/data');

      expect(response1).toBeDefined();
      expect(response2).toBeDefined();
    });

    it('should maintain separate header configurations', () => {
      const client1 = new ApiClient('https://api1.example.com');
      const client2 = new ApiClient('https://api2.example.com');

      client1.setDefaultHeader('X-Client', 'client1');
      client2.setDefaultHeader('X-Client', 'client2');

      expect(client1.getDefaultHeaders()['X-Client']).toBe('client1');
      expect(client2.getDefaultHeaders()['X-Client']).toBe('client2');
    });
  });

  describe('Complex API workflows', () => {
    it('should handle user registration and authentication flow', async () => {
      // Step 1: Validate email
      const email = 'user@example.com';
      expect(validator.isEmail(email)).toBe(true);

      // Step 2: Validate password
      const password = 'SecurePass123!';
      expect(validator.isStrongPassword(password)).toBe(true);

      // Step 3: Register user
      const registerData = {
        email,
        password,
        name: 'Test User',
      };

      const registerResponse = await apiClient.post('/auth/register', registerData);
      expect(registerResponse.status).toBe(200);

      // Step 4: Login
      const loginData = { email, password };
      const loginResponse = await apiClient.post('/auth/login', loginData);
      expect(loginResponse.status).toBe(200);

      // Step 5: Set auth token
      apiClient.setDefaultHeader('Authorization', 'Bearer mock-token');

      // Step 6: Get user profile
      const profileResponse = await apiClient.get('/user/profile');
      expect(profileResponse.status).toBe(200);
    });

    it('should handle data pagination workflow', async () => {
      const pages = [1, 2, 3];
      const responses = await Promise.all(
        pages.map((page) => apiClient.get(`/users?page=${page}&limit=10`)),
      );

      expect(responses).toHaveLength(3);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });
});
