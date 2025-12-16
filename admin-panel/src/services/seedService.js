import api from './api';

const seedService = {
  seedCatalog: async () => {
    const response = await api.post('/seed/catalog');
    return response.data;
  },
};

export default seedService;

