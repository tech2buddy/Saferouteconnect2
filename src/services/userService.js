export const userService = {
  getAll: async () => [],
  updateRole: async (userId, role) => {
    console.log('Updating role:', userId, role);
    return { userId, role };
  },
  suspend: async (userId) => {
    console.log('Suspending user:', userId);
    return { userId, status: 'suspended' };
  },
  activate: async (userId) => {
    console.log('Activating user:', userId);
    return { userId, status: 'active' };
  },
  delete: async (userId) => ({ success: true }),
};