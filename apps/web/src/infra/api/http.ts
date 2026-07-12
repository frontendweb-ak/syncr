import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // for cookies if used
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((context) => {
  return context;
});

// instance.interceptors.request.use(attachAuthHeaders);
// instance.interceptors.response.use(
// 	(response) => response,
// 	async (error) => {
// 		const originalRequest = error.config;

// 		if (error.response?.status === 401 && !originalRequest._retry) {
// 			originalRequest._retry = true;

// 			try {
// 				// const newTokens = await authService.refreshToken();
// 				// useAuthStore.getState().setTokens(newTokens);
// 				// originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
// 				return instance(originalRequest);
// 			} catch {
// 				useAuthStore.getState().clearAuth();
// 				// Optionally trigger logout
// 			}
// 		}

// 		return Promise.reject(error);
// 	},
// );

export { instance as api };
