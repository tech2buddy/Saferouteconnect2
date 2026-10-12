import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import {
  Search, Plus, Edit, Ban, CheckCircle, Trash2, AlertTriangle, Shield, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';

const roleConfig = {
  resident: { variant: 'primary', label: 'Resident' },
  coordinator: { variant: 'warning', label: 'Coordinator' },
  admin: { variant: 'danger', label: 'Administrator' },
};

const statusConfig = {
  active: { variant: 'success', label: 'Active' },
  suspended: { variant: 'danger', label: 'Suspended' },
};

const ROLE_OPTIONS = ['resident', 'coordinator', 'admin'];

const shortId = (id, index) => {
  if (!id) return `#R-${String(index + 1).padStart(3, '0')}`;
  const short = String(id).replace(/-/g, '').slice(-4).toUpperCase();
  return `#${short}`;
};

const UserManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const [addUserModal, setAddUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    fullName: '', email: '', phone: '', area: '', password: '', role: 'resident',
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState('');

  const { user, updateUserRole, updateUserStatus, deleteUser, createUser } = useAuth();

  const role = user?.user_metadata?.role;
  const isAdmin = role === 'admin';

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load users:', error);
        setUsers([]);
        return;
      }

      const allProfiles = data || [];
      const residents = allProfiles.filter((u) => {
        const isStaff = u.is_staff === true || u.is_staff === 'true';
        const isStaffRole = u.role === 'admin' || u.role === 'coordinator';
        return !isStaff && !isStaffRole;
      });

      setUsers(residents.map((u) => ({
        id: u.id,
        name: u.full_name || 'Unknown',
        email: u.email,
        phone: u.phone || '—',
        role: u.role || 'resident',
        area: u.area || '—',
        status: u.status || 'active',
        joinedDate: u.created_at,
        isStaff: u.is_staff,
      })));
    } catch (err) {
      console.error('Exception loading users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen bg-secondary-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setSidebarOpen(true)} title="Access Denied" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="max-w-md text-center">
              <Shield className="w-16 h-16 text-danger-600 mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold mb-2">Admin Access Required</h1>
              <p className="text-secondary-500 mb-6">Only administrators can manage user accounts.</p>
              <Button variant="primary" onClick={() => (window.location.href = '/admin')}>
                Back to Admin Dashboard
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleRoleChange = async (userId, newRole) => {
    const success = await updateUserRole(userId, newRole);
    if (success) {
      await loadUsers();
      setEditingRoleId(null);
      toast.success(`Role updated to "${newRole}"`);
    } else {
      toast.error('Failed to update role');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const success = await updateUserStatus(userId, newStatus);
    if (success) {
      await loadUsers();
      toast.success(newStatus === 'active' ? 'User activated' : 'User suspended');
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const success = await deleteUser(confirmDelete.id);
    if (success) {
      await loadUsers();
      toast.success(`${confirmDelete.name} deleted`);
    } else {
      toast.error('Failed to delete user');
    }
    setConfirmDelete(null);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAddUserError('');

    if (!addUserForm.fullName.trim()) { setAddUserError('Full name required'); return; }
    if (!addUserForm.email.trim()) { setAddUserError('Email required'); return; }
    if (!addUserForm.password || addUserForm.password.length < 6) {
      setAddUserError('Password must be at least 6 characters'); return;
    }

    setAddUserLoading(true);
    try {
      await createUser(addUserForm);
      toast.success(`User "${addUserForm.fullName}" created!`);
      setAddUserForm({ fullName: '', email: '', phone: '', area: '', password: '', role: 'resident' });
      setAddUserModal(false);
      setTimeout(() => { loadUsers(); }, 1500);
    } catch (error) {
      setAddUserError(error.message || 'Failed to create user');
      toast.error(error.message || 'Failed to create user');
    } finally {
      setAddUserLoading(false);
    }
  };

  const counts = {
    total: users.length,
    residents: users.filter((u) => u.role === 'resident').length,
    coordinators: users.filter((u) => u.role === 'coordinator').length,
    admins: users.filter((u) => u.role === 'admin').length,
    suspended: users.filter((u) => u.status === 'suspended').length,
  };

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="User Management" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-secondary-900">
                Users Management
              </h1>
              <p className="text-secondary-500">View, add, edit and manage all user accounts.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={RefreshCw} onClick={loadUsers}>
                Refresh
              </Button>
              <Button variant="primary" icon={Plus} onClick={() => setAddUserModal(true)}>
                Add New User
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Total Users', value: counts.total },
              { label: 'Residents', value: counts.residents },
              { label: 'Coordinators', value: counts.coordinators },
              { label: 'Administrators', value: counts.admins },
              { label: 'Suspended', value: counts.suspended },
            ].map((s, i) => (
              <div key={i} className="card text-center p-4">
                <p className="text-2xl font-bold text-secondary-900">{s.value}</p>
                <p className="text-xs text-secondary-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input type="text" placeholder="Search users by name or email..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field sm:w-48">
              <option value="all">All Roles</option>
              <option value="resident">Resident</option>
              <option value="coordinator">Coordinator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto" />
                <p className="text-secondary-500 mt-3">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary-200 bg-secondary-50">
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">Area</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u, index) => {
                      const r = roleConfig[u.role] || roleConfig.resident;
                      const s = statusConfig[u.status] || statusConfig.active;
                      const isEditingRole = editingRoleId === u.id;
                      return (
                        <tr key={u.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                          <td className="py-3 px-4 text-secondary-500 font-mono text-xs">
                            {shortId(u.id, index)}
                          </td>
                          <td className="py-3 px-4 font-medium text-secondary-900">{u.name}</td>
                          <td className="py-3 px-4 text-secondary-600">{u.email}</td>
                          <td className="py-3 px-4 text-secondary-600">{u.phone}</td>
                          <td className="py-3 px-4">
                            {isEditingRole ? (
                              <select autoFocus defaultValue={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                onBlur={() => setEditingRoleId(null)}
                                className="text-xs border border-primary-300 rounded-lg px-2 py-1">
                                {ROLE_OPTIONS.map((ro) => (
                                  <option key={ro} value={ro}>{roleConfig[ro].label}</option>
                                ))}
                              </select>
                            ) : (
                              <Badge variant={r.variant}>{r.label}</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-secondary-600">{u.area}</td>
                          <td className="py-3 px-4"><Badge variant={s.variant}>{s.label}</Badge></td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <button onClick={() => setEditingRoleId(u.id)} className="p-1.5 hover:bg-primary-50 rounded-lg">
                                <Edit className="w-4 h-4 text-primary-600" />
                              </button>
                              <button onClick={() => handleToggleStatus(u.id, u.status)}
                                className="p-1.5 hover:bg-warning-50 rounded-lg">
                                {u.status === 'active' ? (
                                  <Ban className="w-4 h-4 text-warning-500" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </button>
                              <button onClick={() => setConfirmDelete(u)} className="p-1.5 hover:bg-danger-50 rounded-lg">
                                <Trash2 className="w-4 h-4 text-danger-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-12">
                          <Search className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                          <p className="text-secondary-500">
                            {searchQuery || roleFilter !== 'all'
                              ? 'No users match your filters'
                              : 'No registered users yet'}
                          </p>
                          <p className="text-xs text-secondary-400 mt-1">
                            Click "Add New User" to create one.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Delete Modal */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        title="Delete User Account" size="sm">
        {confirmDelete && (
          <div>
            <div className="flex items-start gap-3 p-4 bg-danger-50 border border-danger-200 rounded-xl mb-4">
              <AlertTriangle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-danger-700 mb-1">This action cannot be undone</p>
                <p className="text-xs text-danger-600">The user's profile will be permanently removed.</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-secondary-700 mb-1">You are about to delete:</p>
              <div className="p-3 bg-secondary-50 rounded-lg">
                <p className="font-medium text-secondary-900">{confirmDelete.name}</p>
                <p className="text-xs text-secondary-500">{confirmDelete.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="danger" onClick={handleConfirmDelete} icon={Trash2} className="flex-1">
                Delete User
              </Button>
              <Button variant="secondary" onClick={() => setConfirmDelete(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal isOpen={addUserModal}
        onClose={() => { setAddUserModal(false); setAddUserError(''); }}
        title="Add New User" size="md">
        <form onSubmit={handleCreateUser}>
          <div className="space-y-4">
            {addUserError && (
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700">
                {addUserError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Full Name <span className="text-danger-500">*</span>
              </label>
              <input type="text" value={addUserForm.fullName}
                onChange={(e) => setAddUserForm({ ...addUserForm, fullName: e.target.value })}
                placeholder="Enter full name" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Email <span className="text-danger-500">*</span>
              </label>
              <input type="email" value={addUserForm.email}
                onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                placeholder="user@example.com" className="input-field" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Phone</label>
                <input type="tel" value={addUserForm.phone}
                  onChange={(e) => setAddUserForm({ ...addUserForm, phone: e.target.value })}
                  placeholder="071 234 5678" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Area</label>
                <input type="text" value={addUserForm.area}
                  onChange={(e) => setAddUserForm({ ...addUserForm, area: e.target.value })}
                  placeholder="Residential area" className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                  Password <span className="text-danger-500">*</span>
                </label>
                <input type="text" value={addUserForm.password}
                  onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                  placeholder="Min 6 characters" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Role</label>
                <select value={addUserForm.role}
                  onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value })}
                  className="input-field">
                  <option value="resident">Resident</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button type="submit" variant="primary" loading={addUserLoading} icon={Plus} className="flex-1">
              Create User
            </Button>
            <Button type="button" variant="secondary"
              onClick={() => { setAddUserModal(false); setAddUserError(''); }} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;