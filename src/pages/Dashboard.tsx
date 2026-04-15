import React from 'react';
import { useAuth } from '../App';
import { UserCheck, GraduationCap, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-3 gap-5 h-full min-h-[600px]">
      {/* Hadir Karyawan */}
      <div className="bento-card">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Hadir Karyawan</span>
        <div className="text-4xl font-extrabold text-brand-600">42/45</div>
        <p className="text-[10px] mt-2 text-green-600 font-bold flex items-center gap-1">
          <CheckCircle2 size={10} /> +3 dari kemarin
        </p>
      </div>

      {/* Hadir Siswa */}
      <div className="bento-card">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Hadir Siswa</span>
        <div className="text-4xl font-extrabold text-brand-600">892</div>
        <p className="text-[10px] mt-2 text-red-600 font-bold flex items-center gap-1">
          <AlertCircle size={10} /> -12 dari kemarin
        </p>
      </div>

      {/* Distribusi Jurusan (Wide) */}
      <div className="bento-card md:col-span-2">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Distribusi Jurusan</span>
        <div className="flex-1 flex items-end gap-3 pt-4">
          {[80, 60, 95, 40, 70, 55].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-brand-600/70 rounded-t-md transition-all hover:bg-brand-600" 
                style={{ height: `${h}%` }}
              ></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[8px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">
          <span>TKJ</span><span>DKV</span><span>AK</span><span>BC</span><span>MPLB</span><span>BD</span>
        </div>
      </div>

      {/* Aktivitas Terbaru (Large) */}
      <div className="bento-card md:col-span-2 md:row-span-2">
        <h3 className="text-base font-bold mb-6 flex items-center gap-2">
          Aktifitas Absensi Terbaru
        </h3>
        <div className="space-y-0 flex-1 overflow-y-auto">
          {[
            { name: 'Andi Wijaya', class: 'XI TKJ 1', time: '07:12', tag: 'tag-tkj' },
            { name: 'Siti Aminah', class: 'XII DKV 2', time: '07:15', tag: 'tag-dkv' },
            { name: 'Bambang Heru', class: 'GURU', time: '06:45', tag: '' },
            { name: 'Rina Permata', class: 'STAFF', time: '06:58', tag: '' },
            { name: 'Doni Setiawan', class: 'X TKJ 2', time: 'ALFA', tag: 'tag-tkj', error: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">{item.name}</p>
                  <span className="tag bg-blue-50 text-blue-600">{item.class}</span>
                </div>
              </div>
              <span className={cn(
                "tag font-bold",
                item.error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
              )}>
                {item.error ? item.time : `HADIR - ${item.time}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions (Tall) */}
      <div className="bento-card md:row-span-2">
        <h3 className="text-base font-bold mb-6">Quick Actions</h3>
        <div className="space-y-3">
          {[
            { label: '+ Tambah User', icon: UserCheck },
            { label: '+ Input Siswa', icon: GraduationCap },
            { label: 'Cetak Rekap', icon: Clock },
          ].map((action, i) => (
            <button 
              key={i} 
              className="w-full text-left p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-600 transition-all"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Server Status */}
      <div className="bento-card">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Server Status</span>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-extrabold text-green-600 uppercase tracking-tight">Supabase Live</span>
        </div>
      </div>
    </div>
  );
}
