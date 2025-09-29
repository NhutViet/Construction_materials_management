import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const AxiosInstance = (token = "", contentType = "application/json") => {
  const axiosInstance = axios.create({
    baseURL: "http://10.12.10.209:3000/",
  });

  // Request interceptor
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Try to get token from localStorage if not provided
      let authToken = token;
      if (!authToken) {
        try {
          const savedToken = localStorage.getItem('accessToken');
          if (savedToken) {
            authToken = JSON.parse(savedToken);
          }
        } catch (error) {
          console.error('Error parsing token from localStorage:', error);
        }
      }

      // Set headers
      if (authToken && authToken.trim() !== "") {
        config.headers.set('Authorization', `Bearer ${authToken}`);
        config.headers.set('Accept', 'application/json');
        config.headers.set('Content-Type', contentType);
      } else {
        config.headers.set('Accept', 'application/json');
        config.headers.set('Content-Type', contentType);
      }
      return config;
    },
    (err) => {
      console.error("Request error:", err);
      return Promise.reject(err);
    }
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (err: AxiosError) => {
      // Handle specific error cases
      if (err.response) {
        // Server responded with error status
        switch (err.response.status) {
          case 401:
            console.error("Unauthorized - Token may be expired");
            // Clear localStorage and redirect to login
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            // You can dispatch logout action here if you have access to store
            window.location.href = '/login';
            break;
          case 403:
            console.error("Forbidden - Insufficient permissions");
            break;
          case 404:
            console.error("Resource not found");
            break;
          case 500:
            console.error("Internal server error");
            break;
          default:
            console.error(`HTTP Error: ${err.response.status}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        console.error("Network error - No response received");
      } else {
        // Something else happened
        console.error("Request setup error:", err.message);
      }
      
      return Promise.reject(err);
    }
  );

  return axiosInstance;
};

export default AxiosInstance;