import axios from 'axios';

export const mavrykApi = axios.create({
  baseURL: new URL('/api', process.env.MAVRYK_WALLET_API_URL).href,
});
