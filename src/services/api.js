import axios from "axios";

// Token refresh state management
let isRefreshing = false;
let refreshSubscribers = [];

// Notify all subscribers when token refresh completes
const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

// Add subscriber to wait for token refresh
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Create base Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach Authorization header
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Log requests in development mode
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error("[API Request Error]", error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development mode
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    // Extract data in standardized format
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors in development mode
    if (import.meta.env.DEV) {
      console.error("[API Response Error]", {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
      });
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newAccessToken) => {
            if (newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              resolve(axios(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Attempt to refresh token
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken: newAccessToken } = response.data;

        // Store new access token
        localStorage.setItem("accessToken", newAccessToken);

        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Notify all queued requests
        onRefreshed(newAccessToken);

        isRefreshing = false;

        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // Token refresh failed - clear tokens and redirect to login
        isRefreshing = false;
        onRefreshed(null);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");

        // Redirect to login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Transform error into consistent format
    const transformedError = {
      message: "An error occurred",
      status: error.response?.status || 0,
      code: "UNKNOWN_ERROR",
    };

    if (!error.response) {
      // Network error
      transformedError.message = "Connection failed. Please check your internet connection.";
      transformedError.code = "NETWORK_ERROR";
    } else {
      // HTTP error responses
      const status = error.response.status;
      const errorData = error.response.data;

      switch (status) {
        case 400:
          transformedError.message = errorData?.error || "Invalid request data";
          transformedError.code = "BAD_REQUEST";
          break;
        case 401:
          transformedError.message = errorData?.error || "Unauthorized";
          transformedError.code = "UNAUTHORIZED";
          break;
        case 403:
          transformedError.message = errorData?.error || "You don't have permission to access this resource";
          transformedError.code = "FORBIDDEN";
          break;
        case 404:
          transformedError.message = errorData?.error || "Resource not found";
          transformedError.code = "NOT_FOUND";
          break;
        case 500:
        case 502:
        case 503:
          transformedError.message = "Something went wrong. Please try again later.";
          transformedError.code = "SERVER_ERROR";
          break;
        default:
          transformedError.message = errorData?.error || "An unexpected error occurred";
      }
    }

    return Promise.reject(transformedError);
  }
);

export default api;