import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student, Attendance } from '../types';
import { Check, X, Clock, AlertCircle, Search, Filter, Save } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function StudentAttendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent' | 'late' | 'permission'>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('class_name');
    
    if (data) {
      const uniqueClasses = Array.from(new Set(data.map(s => s.class_name)));
      setClasses(uniqueClasses);
      if (uniqueClasses.length > 0) setSelectedClass(uniqueClasses[0]);
    }
  };

  const fetchStudents = async (className: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_name', className)
      .order('name');
    
    if (data) {
      setStudents(data);
      // Initialize attendance data with 'present'
      const initial: Record<string, 'present' | 'absent' | 'late' | 'permission'> = {};
      data.forEach(s => initial[s.id] = 'present');
      setAttendanceData(initial);
    }
    setLoading(false);
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'permission') => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    setMessage(null);
    const today = format(new Date(), 'yyyy-MM-dd');

    const records = Object.entries(attendanceData).map(([studentId, status]) => ({
      student_id: studentId,
      date: today,
      status,
      type: 'student'
    }));

    const { error } = await supabase
      .from('attendance')
      .insert(records);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: `Absensi kelas ${selectedClass} berhasil disimpan!` });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Absensi Siswa</h2>
          <p className="text-gray-500">Pilih kelas dan lakukan absensi siswa hari ini.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              className="input pl-10 pr-8 py-2 appearance-none bg-white"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={saveAttendance}
            disabled={saving || students.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Menyimpan...' : 'Simpan Absensi'}
          </button>
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-xl text-sm font-medium",
          message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        )}>
          {message.text}
        </div>
      )}

      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">NIS</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">Memuat data siswa...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">Tidak ada data siswa untuk kelas ini.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{student.nis}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{student.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {[
                          { id: 'present', label: 'Hadir', icon: Check, color: 'bg-green-100 text-green-600 border-green-200', active: 'bg-green-600 text-white border-green-600' },
                          { id: 'absent', label: 'Sakit', icon: X, color: 'bg-red-100 text-red-600 border-red-200', active: 'bg-red-600 text-white border-red-600' },
                          { id: 'late', label: 'Terlambat', icon: Clock, color: 'bg-amber-100 text-amber-600 border-amber-200', active: 'bg-amber-600 text-white border-amber-600' },
                          { id: 'permission', label: 'Izin', icon: AlertCircle, color: 'bg-blue-100 text-blue-600 border-blue-200', active: 'bg-blue-600 text-white border-blue-600' },
                        ].map((status) => (
                          <button
                            key={status.id}
                            onClick={() => handleStatusChange(student.id, status.id as any)}
                            className={cn(
                              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                              attendanceData[student.id] === status.id ? status.active : status.color
                            )}
                            title={status.label}
                          >
                            <status.icon size={14} />
                            <span className="hidden sm:inline">{status.label}</span>
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
