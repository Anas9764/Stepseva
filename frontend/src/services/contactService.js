import api from './api';

export const contactService = {
  sendMessage: async (contactData) => {
    const response = await api.post('/contact', contactData);
    return response.data;
  },
};

