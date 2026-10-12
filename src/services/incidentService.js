export const incidentService = {
  getAll: async () => [],
  getById: async (id) => null,
  create: async (incident) => {
    console.log('Creating incident:', incident);
    return { id: Date.now(), ...incident };
  },
  updateStatus: async (id, status, adminNotes) => {
    console.log('Updating status:', id, status, adminNotes);
    return { id, status, adminNotes };
  },
  delete: async (id) => ({ success: true }),
};