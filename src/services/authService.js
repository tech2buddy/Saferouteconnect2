export const authService = {
  signIn: async (email) => {
    console.log('Signing in:', email);
    return { user: { email } };
  },
  signUp: async (email, password, metadata) => {
    console.log('Signing up:', email, metadata);
    return { user: { email, ...metadata } };
  },
  signOut: async () => {
    console.log('Signing out');
    return { success: true };
  },
  resetPassword: async (email) => {
    console.log('Resetting password for:', email);
    return { success: true };
  },
};