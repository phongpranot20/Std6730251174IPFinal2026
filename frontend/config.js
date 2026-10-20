// 🌐 Assigned Cloud Server Port 3089 for Student 6730251174
export const CLOUD_API_URL = "http://119.59.102.161:3089";
export const LOCAL_API_URL = "http://localhost:3089";

// Primary API URL:
export const API_URL = CLOUD_API_URL;

/**
 * Resilient fetch helper:
 * Tries the assigned Cloud Server (119.59.102.161:3089) first.
 * If unreachable or times out, seamlessly falls back to Localhost (localhost:3089).
 */
export async function resilientFetch(endpoint, options = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (cloudErr) {
    // Fallback to local server if cloud is unreachable
    try {
      return await fetch(`${LOCAL_API_URL}${endpoint}`, options);
    } catch (localErr) {
      throw cloudErr;
    }
  }
}

