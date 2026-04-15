import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student } from '../types';
import { Plus, Search, Edit2, Trash2, X, Save, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentData() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ nis: '', name: '', class_name: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('class_name')
      .order('name');
    
    if (data) setStudents(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      const { error } = await supabase
        .from('students')
        .update(formData)
        .eq('id', editingStudent.id);
      if (!error) {
        setIsModalOpen(false);
        fetchStudents();
      }
    } else {
      const { error } = await supabase
        .from('students')
        .insert(formData);
      if (!error) {
        setIsModalOpen(false);
        fetchStudents();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      if (!error) fetchStudents();
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ nis: '', name: '', class_name: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({ nis: student.nis, name: student.name, class_name: student.class_name });
    setIsModalOpen(true);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search) ||
    s.class_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Siswa</h2>
          <p className="text-gray-500">Kelola informasi seluruh siswa SMK Prima Unggul.</p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Tambah Siswa
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <Search size={20} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Cari berdasarkan nama, NIS, atau kelas..."
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
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">NIS</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Memuat data...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Data tidak ditemukan.</td></tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{student.nis}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{student.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full">
                        {student.class_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(student)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
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
                <h3 className="text-xl font-bold">{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                  <input 
                    type="text" 
                    required 
                    className="input"
                    value={formData.nis}
                    onChange={(e) => setFormData({...formData, nis: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required 
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                  <select 
                    required 
                    className="input"
                    value={formData.class_name}
                    onChange={(e) => setFormData({...formData, class_name: e.target.value})}
                  >
                    <option value="">Pilih Kelas</option>
                    {['X TKJ 1', 'X TKJ 2', 'XI TKJ 1', 'XI TKJ 2', 'XII TKJ 1', 'XII TKJ 2', 'X DKV 1', 'XI DKV 1', 'XII DKV 1'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Simpan
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
