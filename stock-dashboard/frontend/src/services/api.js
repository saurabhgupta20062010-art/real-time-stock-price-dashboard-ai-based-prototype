import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({ baseURL: BASE_URL })

export const api = {
  health: () => client.get('/api/health').then((r) => r.data),
  search: (q) => client.get('/api/stocks/search', { params: { q } }).then((r) => r.data),
  quote: (symbol) => client.get(`/api/stocks/${symbol}/quote`).then((r) => r.data),
  profile: (symbol) => client.get(`/api/stocks/${symbol}/profile`).then((r) => r.data),
  candle: (symbol, resolution = 'D', days = 30) =>
    client
      .get(`/api/stocks/${symbol}/candle`, { params: { resolution, days } })
      .then((r) => r.data),
}

export const WS_URL = BASE_URL.replace(/^http/, 'ws') + '/ws/quotes'
