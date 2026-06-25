import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import api from '../api';

describe('API Client - Unit Tests', () => {
  let mock;

  beforeEach(() => {
    // Mock the api axios instance, not the base axios
    mock = new MockAdapter(api);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Base Configuration', () => {
    test('should have correct baseURL configured', () => {
      const baseURL = api.defaults.baseURL;
      expect(baseURL).toBeDefined();
      expect(typeof baseURL).toBe('string');
      // Should be either environment variable or default localhost
      expect(
        baseURL === 'http://localhost:3000/api' || baseURL.includes('/api')
      ).toBe(true);
    });

    test('should have timeout configured to 30 seconds', () => {
      expect(api.defaults.timeout).toBe(30000);
    });

    test('should have Content-Type header set to application/json', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Request Interceptor - Authorization Header', () => {
    test('should attach Authorization header when access token exists', async () => {
      const mockToken = 'test-access-token-12345';
      localStorage.getItem.mockReturnValue(mockToken);

      mock.onGet('/test-endpoint').reply((config) => {
        expect(config.headers.Authorization).toBe(`Bearer ${mockToken}`);
        return [200, { success: true }];
      });

      await api.get('/test-endpoint');
    });

    test('should not attach Authorization header when no token exists', async () => {
      // getItem returns null by default after jest.clearAllMocks()

      mock.onGet('/test-endpoint').reply((config) => {
        expect(config.headers.Authorization).toBeUndefined();
        return [200, { success: true }];
      });

      await api.get('/test-endpoint');
    });

    test('should attach Authorization header for POST requests', async () => {
      const mockToken = 'test-token-post';
      localStorage.getItem.mockReturnValue(mockToken);

      mock.onPost('/test-post').reply((config) => {
        expect(config.headers.Authorization).toBe(`Bearer ${mockToken}`);
        return [200, { success: true }];
      });

      await api.post('/test-post', { data: 'test' });
    });

    test('should attach Authorization header for PUT requests', async () => {
      const mockToken = 'test-token-put';
      localStorage.getItem.mockReturnValue(mockToken);

      mock.onPut('/test-put').reply((config) => {
        expect(config.headers.Authorization).toBe(`Bearer ${mockToken}`);
        return [200, { success: true }];
      });

      await api.put('/test-put', { data: 'test' });
    });

    test('should attach Authorization header for DELETE requests', async () => {
      const mockToken = 'test-token-delete';
      localStorage.getItem.mockReturnValue(mockToken);

      mock.onDelete('/test-delete').reply((config) => {
        expect(config.headers.Authorization).toBe(`Bearer ${mockToken}`);
        return [200, { success: true }];
      });

      await api.delete('/test-delete');
    });
  });

  describe('Response Interceptor - Data Extraction', () => {
    test('should extract data from successful response', async () => {
      const mockData = { users: [{ id: 1, name: 'Test' }] };
      mock.onGet('/test-data').reply(200, mockData);

      const result = await api.get('/test-data');
      expect(result).toEqual(mockData);
    });

    test('should extract data from 201 Created response', async () => {
      const mockData = { id: 1, created: true };
      mock.onPost('/test-create').reply(201, mockData);

      const result = await api.post('/test-create', { name: 'Test' });
      expect(result).toEqual(mockData);
    });
  });

  describe('Response Interceptor - Error Handling', () => {
    test('should handle network error with proper message', async () => {
      mock.onGet('/test-network-error').networkError();

      await expect(api.get('/test-network-error')).rejects.toMatchObject({
        message: 'Connection failed. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        status: 0,
      });
    });

    test('should handle 400 Bad Request with backend error message', async () => {
      const errorMessage = 'Invalid input data';
      mock.onPost('/test-400').reply(400, { error: errorMessage });

      await expect(api.post('/test-400', {})).rejects.toMatchObject({
        message: errorMessage,
        code: 'BAD_REQUEST',
        status: 400,
      });
    });

    test('should handle 400 with default message when no error provided', async () => {
      mock.onPost('/test-400-no-msg').reply(400, {});

      await expect(api.post('/test-400-no-msg', {})).rejects.toMatchObject({
        message: 'Invalid request data',
        code: 'BAD_REQUEST',
        status: 400,
      });
    });

    test('should handle 403 Forbidden with proper message', async () => {
      mock.onGet('/test-403').reply(403, { error: 'Access denied' });

      await expect(api.get('/test-403')).rejects.toMatchObject({
        message: 'Access denied',
        code: 'FORBIDDEN',
        status: 403,
      });
    });

    test('should handle 404 Not Found with proper message', async () => {
      mock.onGet('/test-404').reply(404, { error: 'User not found' });

      await expect(api.get('/test-404')).rejects.toMatchObject({
        message: 'User not found',
        code: 'NOT_FOUND',
        status: 404,
      });
    });

    test('should handle 500 Server Error with generic message', async () => {
      mock.onGet('/test-500').reply(500, { error: 'Internal server error' });

      await expect(api.get('/test-500')).rejects.toMatchObject({
        message: 'Something went wrong. Please try again later.',
        code: 'SERVER_ERROR',
        status: 500,
      });
    });

    test('should handle 502 Bad Gateway with generic message', async () => {
      mock.onGet('/test-502').reply(502, {});

      await expect(api.get('/test-502')).rejects.toMatchObject({
        message: 'Something went wrong. Please try again later.',
        code: 'SERVER_ERROR',
        status: 502,
      });
    });

    test('should handle 503 Service Unavailable with generic message', async () => {
      mock.onGet('/test-503').reply(503, {});

      await expect(api.get('/test-503')).rejects.toMatchObject({
        message: 'Something went wrong. Please try again later.',
        code: 'SERVER_ERROR',
        status: 503,
      });
    });
  });

  describe('Token Refresh on 401', () => {
    test('should attempt token refresh on 401 response', async () => {
      const oldToken = 'old-access-token';
      const newToken = 'new-access-token';
      const refreshToken = 'valid-refresh-token';

      // Set up localStorage to return specific tokens
      localStorage.getItem
        .mockReturnValueOnce(oldToken) // First call for accessToken in request interceptor
        .mockReturnValueOnce(refreshToken) // Second call for refreshToken in response interceptor
        .mockReturnValueOnce(oldToken); // Third call for retry

      // First request fails with 401
      mock.onGet('/protected-endpoint').replyOnce(401);

      // Refresh token request succeeds
      mock.onPost('/auth/refresh').reply(200, { accessToken: newToken });

      // Retry with new token succeeds
      mock.onGet('/protected-endpoint').reply(200, { data: 'success' });

      const result = await api.get('/protected-endpoint');
      
      // Check that the new token was stored
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', newToken);
      expect(result).toEqual({ data: 'success' });
    });

    test('should clear tokens and set redirect on failed token refresh', async () => {
      const oldToken = 'expired-token';
      const refreshToken = 'invalid-refresh-token';

      // Set up localStorage to return specific tokens
      localStorage.getItem
        .mockReturnValueOnce(oldToken) // First call for accessToken in request interceptor
        .mockReturnValueOnce(refreshToken); // Second call for refreshToken in response interceptor

      // First request fails with 401
      mock.onGet('/protected-endpoint').replyOnce(401);

      // Refresh token request also fails
      mock.onPost('/auth/refresh').reply(401, { error: 'Invalid refresh token' });

      await expect(api.get('/protected-endpoint')).rejects.toBeDefined();

      // Check that tokens were removed
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userData');
    });

    test('should not attempt refresh when no refresh token exists', async () => {
      // Set up localStorage to return access token but no refresh token
      localStorage.getItem
        .mockReturnValueOnce('some-token') // First call for accessToken in request interceptor
        .mockReturnValueOnce(null); // Second call for refreshToken returns null

      mock.onGet('/protected-endpoint').reply(401);

      await expect(api.get('/protected-endpoint')).rejects.toBeDefined();
      
      // Verify setItem was not called with a new accessToken (no refresh happened)
      const setItemCalls = localStorage.setItem.mock.calls;
      const newTokenSet = setItemCalls.some(call => 
        call[0] === 'accessToken'
      );
      expect(newTokenSet).toBe(false);
    });
  });

  describe('Request Parameters', () => {
    test('should properly send query parameters', async () => {
      mock.onGet('/test-query').reply((config) => {
        expect(config.params).toEqual({ page: 1, limit: 10 });
        return [200, { data: [] }];
      });

      await api.get('/test-query', { params: { page: 1, limit: 10 } });
    });

    test('should properly send POST request body', async () => {
      const postData = { username: 'test', email: 'test@test.com' };
      
      mock.onPost('/test-body').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(postData);
        return [200, { success: true }];
      });

      await api.post('/test-body', postData);
    });
  });
});
