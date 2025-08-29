import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const AxiosInstance = (token = "", contentType = "application/json") => {
  const axiosInstance = axios.create({
    baseURL: "http://192.168.1.3:3000/",
  });

  // Request interceptor
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Validate token if provided
      if (token && token.trim() !== "") {
        config.headers.set('Authorization', `Bearer ${token}`);
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
    (res: AxiosResponse) => res.data,
    async (err: AxiosError) => {
      // Handle specific error cases
      if (err.response) {
        // Server responded with error status
        switch (err.response.status) {
          case 401:
            console.error("Unauthorized - Token may be expired");
            // Redirect to login or refresh token
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