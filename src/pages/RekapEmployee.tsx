import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Attendance } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function RekapEmployee() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth]);

  const fetchAttendance = async () => {
    setLoading(true);
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        profiles (full_name, email)
      `)
      .eq('type', 'employee')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false });
    
    if (data) setAttendance(data);
    setLoading(false);
  };

  const nextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  const prevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rekap Absensi Karyawan</h2>
          <p className="text-gray-500">Laporan kehadiran guru dan staf SMK Prima Unggul.</p>
        </div>
        
        <div className="flex items-center gap-3">
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
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Hadir', value: attendance.filter(a => a.status === 'present').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Terlambat', value: attendance.filter(a => a.status === 'late').length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Izin/Sakit', value: attendance.filter(a => ['permission', 'absent'].includes(a.status)).length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tanpa Keterangan', value: 0, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className={cn("card p-6 border-none", stat.bg)}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{stat.label}</p>
            <h3 className={cn("text-3xl font-black", stat.color)}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Karyawan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu Absen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Memuat data...</td></tr>
              ) : attendance.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Tidak ada data absensi di bulan ini.</td></tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                      {format(new Date(record.date), 'dd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{record.profiles?.full_name}</p>
                      <p className="text-xs text-gray-500">{record.profiles?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 text-xs font-bold rounded-full capitalize",
                        record.status === 'present' ? "bg-green-100 text-green-700" : 
                        record.status === 'late' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(record.created_at), 'HH:mm:ss')}
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
