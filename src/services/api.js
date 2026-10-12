export const api = {
  get: async (url) => fetch(url).then(r => r.json()),
  post: async (url, data) => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),
  put: async (url, data) => fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),
  delete: async (url) => fetch(url, { method: 'DELETE' }).then(r => r.json()),
};