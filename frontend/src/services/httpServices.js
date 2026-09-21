import axios from "axios";
import http from "http";

const isServer = typeof window === "undefined";

const getFrontendApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("manchandafabric.in") || (hostname !== "localhost" && hostname !== "127.0.0.1")) {
      return "https://api.manchandafabric.in/api";
    }
  }
  let rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8092/api";
  if (rawApiBaseUrl.includes("https://manchandafabric.in/api")) {
    rawApiBaseUrl = rawApiBaseUrl.replace("https://manchandafabric.in/api", "https://api.manchandafabric.in/api");
  }
  return rawApiBaseUrl.replace("://localhost", "://127.0.0.1");
};

const instance = axios.create({
  baseURL: getFrontendApiBaseUrl(),
  timeout: isServer ? 12000 : 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  ...(isServer && {
    httpAgent: new http.Agent({ family: 4 }),
  }),
});

instance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("manchandafabric.in") || (hostname !== "localhost" && hostname !== "127.0.0.1")) {
      config.baseURL = "https://api.manchandafabric.in/api";
    }
  }
  return config;
});

export const setToken = (token) => {
  // console.log("token", token);
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
};

const responseBody = (response) => response.data;

const requests = {
  get: (url, body) => instance.get(url, body).then(responseBody),
  post: (url, body, headers) =>
    instance.post(url, body, headers).then(responseBody),
  put: (url, body) => instance.put(url, body).then(responseBody),
  delete: (url) => instance.delete(url).then(responseBody),
};

export default requests;
