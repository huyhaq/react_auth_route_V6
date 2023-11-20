import  axios from "axios";
const instance = axios.create({
    baseURL: process.env.REACT_APP_API_KEY,
});
console.log(process.env.REACT_APP_API_KEY)
instance.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
instance.defaults.headers.common['Content-Type'] = 'application/json';
instance.defaults.headers.common['Accept'] = 'application/json';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

instance.interceptors.request.use(config => {
        let accessToken = localStorage.getItem('access_token');
        if (accessToken !== '' || accessToken !== null || accessToken !==
            undefined) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    ({response}) => {
        return response;
    },
);

const REFRESH_TOKEN_URL = `${process.env.APP_API_URL}api/refresh-token`;

instance.interceptors.response.use((response) => {
    return response;
}, async function(error) {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refresh_token');
    console.log(error);
    if (error.response?.status === 401 && !originalRequest._retry &&
        originalRequest.url === REFRESH_TOKEN_URL) {
        localStorage.clear()
        window.location.replace('/login');
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
            return new Promise(function(resolve, reject) {
                failedQueue.push({resolve, reject});
            }).then(access_token => {
                originalRequest.headers['Authorization'] = 'Bearer ' +
                    access_token;
                return instance.request(originalRequest);
            }).catch(err => {
                return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;
        return new Promise((resolve, reject) => {
            instance.post(REFRESH_TOKEN_URL,
                {
                    'refresh_token': refreshToken,
                }).then(({data}) => {
                let accessToken = data.data.access_token;
                let userFresh = data.data.user;
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('user', JSON.stringify(userFresh));
                instance.defaults.headers.common['Authorization'] = 'Bearer ' +
                    accessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' +
                    accessToken;
                processQueue(null, accessToken);
                resolve(instance(originalRequest));
            }).catch((err) => {
                processQueue(err, null);
                reject(err);
            }).then(() => {
                isRefreshing = false;
            });
        });
    }
    return Promise.reject(error);

});

export default instance;
