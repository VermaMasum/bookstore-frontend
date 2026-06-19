import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register:      (d) => api.post('/auth/register', d),
  login:         (d) => api.post('/auth/login', d),
  forgotPassword:(d) => api.post('/auth/forgot-password', d),
  resetPassword: (d) => api.post('/auth/reset-password', d),
  me:            ()  => api.get('/auth/me'),
}

export const publishers = {
  getAll: () => api.get('/publishers'),
  create: (d) => api.post('/publishers', d),
  update: (id, d) => api.put(`/publishers/${id}`, d),
  delete: (id) => api.delete(`/publishers/${id}`),
}

export const companies = {
  getAll: () => api.get('/companies'),
  create: (d) => api.post('/companies', d),
  update: (id, d) => api.put(`/companies/${id}`, d),
  delete: (id) => api.delete(`/companies/${id}`),
}

export const suppliers = {
  getAll: () => api.get('/suppliers'),
  create: (d) => api.post('/suppliers', d),
  update: (id, d) => api.put(`/suppliers/${id}`, d),
  delete: (id) => api.delete(`/suppliers/${id}`),
}

export const vendors = {
  getAll: () => api.get('/vendors'),
  create: (d) => api.post('/vendors', d),
  update: (id, d) => api.put(`/vendors/${id}`, d),
  delete: (id) => api.delete(`/vendors/${id}`),
}

export const books = {
  getAll: () => api.get('/books'),
  create: (d) => api.post('/books', d),
  update: (id, d) => api.put(`/books/${id}`, d),
  delete: (id) => api.delete(`/books/${id}`),
  bulkImport: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/books/bulk-import', form)
  },
}

export const inventory = {
  getAll: () => api.get('/inventory'),
  getLowStock: (t) => api.get(`/inventory/low-stock?threshold=${t || 10}`),
  adjust: (bookId, d) => api.put(`/inventory/${bookId}`, d),
  bulkUpdate: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/inventory/bulk-update', form)
  },
  bulkUpdateJson: (items) => api.post('/inventory/bulk-update-json', { items }),
}


export const schools = {
  getAll: () => api.get('/schools'),
  create: (d) => api.post('/schools', d),
  update: (id, d) => api.put(`/schools/${id}`, d),
  delete: (id) => api.delete(`/schools/${id}`),
}

export const purchaseOrders = {
  getAll: () => api.get('/purchase-orders'),
  create: (d) => api.post('/purchase-orders', d),
  receive: (id) => api.put(`/purchase-orders/${id}/receive`),
  cancel: (id) => api.put(`/purchase-orders/${id}/cancel`),
}

export const vendorOrders = {
  getAll: () => api.get('/vendor-orders'),
  create: (d) => api.post('/vendor-orders', d),
  dispatch: (id) => api.put(`/vendor-orders/${id}/dispatch`),
  deliver: (id) => api.put(`/vendor-orders/${id}/deliver`),
  cancel: (id) => api.put(`/vendor-orders/${id}/cancel`),
}

export const bookSets = {
  getAll: () => api.get('/book-sets'),
  create: (d) => api.post('/book-sets', d),
  update: (id, d) => api.put(`/book-sets/${id}`, d),
  delete: (id) => api.delete(`/book-sets/${id}`),
}

export const schoolOrders = {
  getAll: () => api.get('/school-orders'),
  create: (d) => api.post('/school-orders', d),
  deliver: (id, d) => api.put(`/school-orders/${id}/deliver`, d),
  cancel: (id) => api.put(`/school-orders/${id}/cancel`),
}

export const payments = {
  getAll: () => api.get('/payments'),
  create: (d) => api.post('/payments', d),
}

export const reconciliation = {
  getAll: () => api.get('/reconciliation'),
  getSummary: (date) => api.get(`/reconciliation/summary${date ? `?date=${date}` : ''}`),
  create: (d) => api.post('/reconciliation', d),
}

export const invoices = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  generate: (d) => api.post('/invoices/generate', d),
  delete: (id) => api.delete(`/invoices/${id}`),
}

export const shopSettings = {
  get: () => api.get('/shop-settings'),
  update: (d) => api.put('/shop-settings', d),
}

export const eodUpload = {
  upload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/eod-upload', form)
  },
  templateUrl: '/api/eod-upload/template',
}

// ── Portal (End User) ──────────────────────────────────────────
const portalToken = () => localStorage.getItem('portalToken')

const portalApi = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })
portalApi.interceptors.request.use(config => {
  const t = portalToken()
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
})

export const portal = {
  register:    (d) => portalApi.post('/portal/register', d),
  login:       (d) => portalApi.post('/portal/login', d),
  getBookSets: (params) => portalApi.get('/portal/book-sets', { params }),
  getBookSet:  (id) => portalApi.get(`/portal/book-sets/${id}`),
  placeOrder:  (d) => portalApi.post('/portal/orders', d),
  getMyOrders: () => portalApi.get('/portal/orders'),
}

export default api
