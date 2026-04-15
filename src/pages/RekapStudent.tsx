import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { Download, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function RekapStudent() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth, selectedClass]);

  const fetchClasses = async () => {
    const { data } = await supabase.from('students').select('class_name');
    if (data) {
      const unique = Array.from(new Set(data.map(s => s.class_name)));
      setClasses(['Semua', ...unique]);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    let query = supabase
      .from('attendance')
      .select(`
        *,
        students (name, nis, class_name)
      `)
      .eq('type', 'student')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false });
    
    if (selectedClass !== 'Semua') {
      // This is a bit tricky with Supabase joined filtering, 
      // but for simplicity we'll filter client-side or use a better query if needed.
      // Actually, we can use dot notation in some Supabase versions or filter after.
    }

    const { data, error } = await query;
    
    if (data) {
      let filtered = data;
      if (selectedClass !== 'Semua') {
        filtered = data.filter(a => a.students?.class_name === selectedClass);
      }
      setAttendance(filtered);
    }
    setLoading(false);
  };

  const nextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  const prevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rekap Absensi Siswa</h2>
          <p className="text-gray-500">Laporan kehadiran siswa per kelas dan periode.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            className="input py-2 bg-white min-w-[150px]"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-50 border-r border-gray-200">
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 py-2 font-bold text-sm min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-50 border-l border-gray-200">
              <ChevronRight size={20} />
            </button>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Siswa</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Memuat data...</td></tr>
              ) : attendance.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Tidak ada data absensi.</td></tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                      {format(new Date(record.date), 'dd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{record.students?.name}</p>
                      <p className="text-xs text-gray-500">NIS: {record.students?.nis}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                        {record.students?.class_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 text-xs font-bold rounded-full capitalize",
                        record.status === 'present' ? "bg-green-100 text-green-700" : 
                        record.status === 'absent' ? "bg-red-100 text-red-700" : 
                        record.status === 'late' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {record.status}
                      </span>
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
