import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../App';
import { CheckCircle2, Clock, Calendar as CalendarIcon, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function EmployeeAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchTodayAttendance();
  }, [user]);

  const fetchTodayAttendance = async () => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .eq('type', 'employee')
      .maybeSingle();

    if (data) setTodayAttendance(data);
  };

  const handleAttendance = async (status: 'present' | 'late' | 'permission' | 'absent') => {
    setLoading(true);
    setMessage(null);

    const today = format(new Date(), 'yyyy-MM-dd');
    
    const { error } = await supabase
      .from('attendance')
      .insert({
        user_id: user?.id,
        date: today,
        status,
        type: 'employee',
        notes: status === 'present' ? 'Absensi Mandiri' : ''
      });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Absensi berhasil dicatat!' });
      fetchTodayAttendance();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Absensi Karyawan</h2>
        <p className="text-gray-500">Silakan lakukan absensi harian Anda di sini.</p>
      </div>

      <div className="bento-card p-8 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon size={40} />
          </div>
          <h3 className="text-xl font-bold">{format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}</h3>
          <p className="text-gray-500">Waktu Server: {format(new Date(), 'HH:mm')}</p>
        </div>

        {todayAttendance ? (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-8">
            <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-green-900">Anda Sudah Absen</h4>
            <p className="text-green-700 mt-2">
              Status: <span className="font-bold capitalize">{todayAttendance.status}</span>
            </p>
            <p className="text-sm text-green-600 mt-1">
              Dicatat pada: {format(new Date(todayAttendance.created_at), 'HH:mm:ss')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-gray-600">Pilih status kehadiran Anda hari ini:</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleAttendance('present')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:bg-brand-50 transition-all group"
              >
                <CheckCircle2 size={32} className="text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Hadir</span>
              </button>
              <button 
                onClick={() => handleAttendance('late')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:bg-brand-50 transition-all group"
              >
                <Clock size={32} className="text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Terlambat</span>
              </button>
              <button 
                onClick={() => handleAttendance('permission')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:bg-brand-50 transition-all group"
              >
                <AlertCircle size={32} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Izin</span>
              </button>
              <button 
                onClick={() => handleAttendance('absent')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:bg-brand-50 transition-all group"
              >
                <X size={32} className="text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Sakit</span>
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className={cn(
            "mt-6 p-4 rounded-xl text-sm font-medium",
            message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          )}>
            {message.text}
          </div>
        )}
      </div>

      <div className="bento-card p-6">
        <h4 className="font-bold mb-4">Riwayat Absensi Minggu Ini</h4>
        <div className="space-y-4">
          {/* Mock history for now */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-medium">Senin, {14-i} April 2024</p>
                <p className="text-xs text-gray-500">07:10 WIB</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">HADIR</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
