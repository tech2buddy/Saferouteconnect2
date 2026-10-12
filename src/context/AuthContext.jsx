import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  addAuditEntry as addAuditEntryService,
  getAuditLog as getAuditLogService,
  getAuditLogForIncident as getAuditLogForIncidentService,
} from '../services/auditService';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

// ============================================================
// Audit Log re-exports (now Supabase-backed)
// ============================================================
export const getAuditLog = getAuditLogService;
export const getAuditLogForIncident = getAuditLogForIncidentService;
export const addAuditEntry = addAuditEntryService;

// ============================================================
// Helper: is this user staff?
// ============================================================
const isStaffUser = (userMetadata) => {
  if (!userMetadata) return false;
  const flag = userMetadata.is_staff;
  const role = userMetadata.role;
  return (
    flag === true ||
    flag === 'true' ||
    flag === 'True' ||
    flag === 1 ||
    role === 'admin' ||
    role === 'coordinator'
  );
};

// ============================================================
// AuthProvider
// ============================================================
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user.user_metadata,
          });
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user.user_metadata,
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ---------- Sign In (Resident) ----------
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your email first. Check your inbox.');
      }
      if (error.message.includes('Invalid login') || error.message.includes('Invalid credentials')) {
        throw new Error('Invalid email or password');
      }
      throw new Error(error.message);
    }

    if (isStaffUser(data.user?.user_metadata)) {
      await supabase.auth.signOut();
      throw new Error('Please use the Staff Portal to sign in');
    }

    if (data.user?.user_metadata?.status === 'suspended') {
      await supabase.auth.signOut();
      throw new Error('Your account has been suspended');
    }

    return { user: data.user };
  };

  // ---------- Staff Sign In ----------
  const signInStaff = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your email first');
      }
      if (error.message.includes('Invalid login') || error.message.includes('Invalid credentials')) {
        throw new Error('Invalid email or password');
      }
      throw new Error(error.message);
    }

    if (!isStaffUser(data.user?.user_metadata)) {
      await supabase.auth.signOut();
      throw new Error('This account is not a staff account');
    }

    if (data.user?.user_metadata?.status === 'suspended') {
      await supabase.auth.signOut();
      throw new Error('Your staff account has been suspended');
    }

    // Log login to audit
    addAuditEntryService({
      type: 'login',
      actorId: data.user.id,
      actorName: data.user.user_metadata.full_name || 'Staff',
      actorRole: data.user.user_metadata.role || 'admin',
      action: 'Logged in',
      details: `${data.user.user_metadata.full_name || 'Staff'} signed in`,
    });

    return { user: data.user };
  };

  // ---------- Sign Up ----------
  const signUp = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.full_name || 'New User',
          phone: metadata.phone || '',
          area: metadata.area || '',
          role: 'resident',
          is_staff: false,
          status: 'active',
        },
      },
    });

    if (error) throw new Error(error.message);
    return { user: data.user };
  };

  // ---------- Sign Out ----------
  const signOut = async () => {
    if (isStaffUser(user?.user_metadata)) {
      await addAuditEntryService({
        type: 'logout',
        actorId: user.id,
        actorName: user.user_metadata?.full_name || 'Staff',
        actorRole: user.user_metadata?.role || 'admin',
        action: 'Logged out',
        details: `${user.user_metadata?.full_name || 'Staff'} signed out`,
      });
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  // ---------- Get All Users ----------
  const getAllUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get users:', error);
      return [];
    }

    const residents = (data || []).filter((u) => {
      const isStaff =
        u.is_staff === true ||
        u.is_staff === 'true' ||
        u.is_staff === 'True' ||
        u.is_staff === 1;

      const isStaffRole = u.role === 'admin' || u.role === 'coordinator';
      return !isStaff && !isStaffRole;
    });

    return residents.map((u) => ({
      id: u.id,
      name: u.full_name || 'Unknown',
      email: u.email,
      phone: u.phone || '—',
      role: u.role || 'resident',
      area: u.area || '—',
      status: u.status || 'active',
      joinedDate: u.created_at,
      isStaff: u.is_staff,
    }));
  };

  // ---------- Update User Role ----------
  const updateUserRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Failed to update role:', error);
      return false;
    }

    await addAuditEntryService({
      type: 'user_role_change',
      actorId: user?.id,
      actorName: user?.user_metadata?.full_name || 'Admin',
      actorRole: user?.user_metadata?.role || 'admin',
      action: 'Changed user role',
      targetUserId: userId,
      details: `Changed to ${newRole}`,
    });

    return true;
  };

  // ---------- Update User Status ----------
  const updateUserStatus = async (userId, newStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId);

    if (error) {
      console.error('Failed to update status:', error);
      return false;
    }

    await addAuditEntryService({
      type: 'user_status_change',
      actorId: user?.id,
      actorName: user?.user_metadata?.full_name || 'Admin',
      actorRole: user?.user_metadata?.role || 'admin',
      action: newStatus === 'active' ? 'Activated user' : 'Suspended user',
      targetUserId: userId,
      details: `User is now ${newStatus}`,
    });

    return true;
  };

  // ---------- Delete User ----------
  const deleteUser = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Failed to delete user:', error);
      return false;
    }

    await addAuditEntryService({
      type: 'user_deleted',
      actorId: user?.id,
      actorName: user?.user_metadata?.full_name || 'Admin',
      actorRole: user?.user_metadata?.role || 'admin',
      action: 'Deleted user account',
      targetUserId: userId,
      details: 'User profile removed',
    });

    return true;
  };

  // ---------- Create User ----------
  const createUser = async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName,
          phone: userData.phone || '',
          area: userData.area || '',
          role: userData.role || 'resident',
          is_staff: userData.role === 'admin' || userData.role === 'coordinator',
          status: 'active',
        },
      },
    });

    if (error) throw error;

    await addAuditEntryService({
      type: 'user_created',
      actorId: user?.id,
      actorName: user?.user_metadata?.full_name || 'Admin',
      actorRole: user?.user_metadata?.role || 'admin',
      action: 'Created new user',
      targetName: userData.fullName,
      details: `Created ${userData.fullName} (${userData.email})`,
    });

    return { user: data.user };
  };

  const value = {
    user,
    loading,
    signIn,
    signInStaff,
    signUp,
    signOut,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    createUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};