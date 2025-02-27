import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1/node';

export const startTorrents = async (data) => {
  await axios.post(`${API_URL}/start-torrents`, data);
};

export const stopTorrents = async () => {
  await axios.delete(`${API_URL}/stop-torrents`);
};

export const closeWebsocket = async (nodeName) => {
  await axios.delete(`${API_URL}/close-node/${nodeName}`);
};

export const sendFile = async (formData) => {
  await axios.post(`${API_URL}/send-pdf`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
