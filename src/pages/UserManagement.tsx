import React, { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';
import { Plus, Search, Edit2, Trash2, X, Save, Shield, Mail, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', role: 'guru' as UserRole });
  const [error, setError] = useState<string | null>(null);
  const [isAdminClientReady, setIsAdminClientReady] = useState(!!supabaseAdmin);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (editingUser) {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role
        })
        .eq('id', editingUser.id);

      if (profileError) {
        setError(profileError.message);
        return;
      }
      
      setIsModalOpen(false);
      fetchUsers();
    } else {
      // Create new user in Auth and Profile
      if (!supabaseAdmin) {
        setError('Supabase Admin Client tidak tersedia. Pastikan VITE_SUPABASE_SERVICE_ROLE_KEY sudah diatur.');
        return;
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          full_name: formData.full_name,
          role: formData.role
        }
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role
        });

      if (profileError) {
        setError(profileError.message);
        return;
      }

      setIsModalOpen(false);
      fetchUsers();
    }
  };

  const handleDelete = async (user: UserProfile) => {
    if (confirm(`Apakah Anda yakin ingin menghapus user ${user.full_name}? Ini akan menghapus akun secara permanen dari sistem.`)) {
      if (!supabaseAdmin) {
        alert('Supabase Admin Client tidak tersedia.');
        return;
      }

      // Delete from Auth (this will cascade to profiles if configured, or we do it manually)
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      
      if (authError) {
        alert(`Gagal menghapus user dari Auth: ${authError.message}`);
        return;
      }

      // Profile should be deleted by cascade if foreign key is set to ON DELETE CASCADE
      // But let's be sure
      await supabase.from('profiles').delete().eq('id', user.id);
      
      fetchUsers();
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ email: '', password: '', full_name: '', role: 'guru' });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({ email: user.email, password: '', full_name: user.full_name, role: user.role });
    setIsModalOpen(true);
    setError(null);
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500">Kelola akun guru, staf, dan admin aplikasi.</p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Tambah User
        </button>
      </div>

      {!isAdminClientReady && (
        <div className="p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl flex items-start gap-3">
          <Shield size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Peringatan: Admin API Belum Aktif</p>
            <p className="text-xs mt-1">VITE_SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi. Anda tidak dapat menambah atau menghapus user secara permanen dari Supabase Auth melalui aplikasi ini.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <Search size={20} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Cari berdasarkan nama atau email..."
          className="flex-1 outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dibuat Pada</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Memuat data user...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">User tidak ditemukan.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 text-xs font-bold rounded-full capitalize",
                        user.role === 'admin' ? "bg-purple-100 text-purple-700" : 
                        user.role === 'guru' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                      )}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">{editingUser ? 'Edit User' : 'Tambah User Baru'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      required 
                      className="input pl-10"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                </div>

                {!editingUser && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="email" 
                          required 
                          className="input pl-10"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input 
                        type="password" 
                        required 
                        className="input"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="relative">
                    <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select 
                      required 
                      className="input pl-10"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                    >
                      <option value="guru">Guru</option>
                      <option value="tenaga_kependidikan">Tenaga Kependidikan</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {editingUser ? 'Simpan Perubahan' : 'Buat User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for error icon
const AlertCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
