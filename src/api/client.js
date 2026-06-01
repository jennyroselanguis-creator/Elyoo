import * as dataService from '../services/dataService';

/** Unified API — backed by Supabase (or demo seed data) */

export const productAPI = {
  getAll: async () => ({ data: { success: true, data: await dataService.fetchProducts() } }),
  getById: async (id) => ({ data: { success: true, data: await dataService.fetchProductById(id) } }),
  create: async (data) => {
    const created = await dataService.createProduct(data);
    return { data: { success: true, data: created } };
  },
  update: async (id, data) => {
    await dataService.updateProduct(id, data);
    return { data: { success: true } };
  },
  delete: async (id) => {
    await dataService.deleteProduct(id);
    return { data: { success: true } };
  },
};

export const brandAPI = {
  getAll: async () => ({ data: { success: true, data: await dataService.fetchBrands() } }),
  create: async (data) => ({ data: { success: true, data: await dataService.createBrand(data) } }),
  update: async (id, data) => {
    await dataService.updateBrand(id, data);
    return { data: { success: true } };
  },
  delete: async (id) => {
    await dataService.deleteBrand(id);
    return { data: { success: true } };
  },
};

export const cartAPI = {
  checkout: async (cartItems, customerInfo) => {
    const order = await dataService.createOrder({
      ...customerInfo,
      items: cartItems,
      _hp: customerInfo._hp,
    });
    return { data: { success: true, data: order } };
  },
};

export const authAPI = {
  login: async (email, password) => {
    const { user, session } = await dataService.signIn(email, password);
    const token = session?.access_token;
    if (!token) {
      throw new Error('No Supabase session — products cannot sync to the cloud.');
    }
    return {
      data: {
        token,
        user,
      },
    };
  },
  logout: async () => {
    await dataService.signOut();
    return { data: { success: true } };
  },
};

export const orderAPI = {
  getAll: async () => ({ data: { success: true, data: await dataService.fetchOrders() } }),
  updateStatus: async (id, status) => {
    await dataService.updateOrderStatus(id, status);
    return { data: { success: true } };
  },
  delete: async (id) => {
    await dataService.deleteOrder(id);
    return { data: { success: true } };
  },
  cancel: async (id) => {
    await dataService.cancelCustomerOrder(id);
    return { data: { success: true } };
  },
  track: async (orderNumber, email) => ({
    data: { success: true, data: await dataService.trackOrder(orderNumber, email) },
  }),
  getByEmail: async (email) => ({
    data: { success: true, data: await dataService.fetchOrdersByEmail(email) },
  }),
};

export const newsletterAPI = {
  subscribe: async (email) => ({ data: await dataService.subscribeNewsletter(email) }),
};

export const staffAPI = {
  getAll: async () => ({ data: { success: true, data: await dataService.fetchStaffMembers() } }),
  create: async (payload) => ({
    data: { success: true, data: await dataService.createStaffMember(payload) },
  }),
  remove: async (id) => ({
    data: await dataService.removeStaffMember(id),
  }),
  reset: async (payload) => ({
    data: await dataService.resetStaffPassword(payload),
  }),
};

export const statusAPI = {
  get: () => dataService.getConnectionStatus(),
};

const apiClient = { productAPI, brandAPI, cartAPI, authAPI, orderAPI, newsletterAPI, staffAPI };

export default apiClient;
