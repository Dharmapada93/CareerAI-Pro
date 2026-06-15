import { useAuthStore } from "../store/useAuthStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
  body?: any;
}

function mapIdField(data: any): any {
  if (Array.isArray(data)) {
    return data.map(mapIdField);
  } else if (data !== null && typeof data === "object") {
    if ("id" in data && !("_id" in data)) {
      data._id = data.id;
    }
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        data[key] = mapIdField(data[key]);
      }
    }
  }
  return data;
}

export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, logout } = useAuthStore.getState();
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.body) {
    config.body = options.body instanceof FormData ? options.body : JSON.stringify(options.body);
  }

  // Prepend API_URL if it's a relative path starting with /
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  const response = await fetch(url, config);

  if (response.status === 401) {
    logout();
    throw new Error("Session expired. Please log in again.");
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage = typeof data === "object" && data?.error ? data.error : (data || "Request failed");
    throw new Error(errorMessage);
  }

  return mapIdField(data) as T;
}
