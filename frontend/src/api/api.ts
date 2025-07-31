import axios from 'axios';

const API = axios.create({
  baseURL: 'https://your-api-url.com',
});

export default API;
