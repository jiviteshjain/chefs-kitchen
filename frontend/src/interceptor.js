import axios from "axios";
import conf from "./config";

function createInterceptor() {
    axios.interceptors.response.use((response) => {
        return response
    }, function (error) {
        const originalRequest = error.config;
        console.log(originalRequest.url);
        if (error.response.status !== 200 && originalRequest.url ===
            "/api/auth/refresh") {
            return Promise.reject(error);
        }

        if (error.response.status !== 200 && !originalRequest._retry) {

            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken != null) {
                return axios.post('/api/auth/refresh', {
                    "token": refreshToken
                }).then((response) => {
                    console.log(response);
                    localStorage.setItem("refreshToken", response.data.result.data.refresh_token);
                    localStorage.setItem("accessToken", "Bearer " + response.data.result.data.access_token);
                    delete axios.defaults.headers.common["Authorization"];
                    axios.defaults.headers.common['Authorization'] = localStorage.getItem("accessToken");

                    originalRequest.headers['Authorization'] = localStorage.getItem("accessToken");
                    return axios.request(originalRequest);
                });
            }
        }
        return Promise.reject(error);
    });
}

export default createInterceptor