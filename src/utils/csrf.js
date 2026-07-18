export function getCsrfToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function authFetch(url, options = {}) {
  const token = getCsrfToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { 'X-XSRF-TOKEN': token } : {}),
    },
  });
}
