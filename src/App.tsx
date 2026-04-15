import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { UserProfile, UserRole } from './types';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  GraduationCap, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  School,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                <School size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight">SMK Prima Unggul</span>
            </div>
            <Link to="/login" className="btn-primary">
              Login Aplikasi
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight"
          >
            Membangun Masa Depan <br />
            <span className="text-brand-600">Unggul & Berkarakter</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto mb-10"
          >
            SMK Prima Unggul adalah lembaga pendidikan kejuruan yang berdedikasi untuk mencetak tenaga kerja profesional dan kompeten di bidangnya.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/login" className="btn-primary px-8 py-4 text-lg shadow-lg shadow-brand-200">
              Mulai Absensi
            </Link>
            <a href="#jurusan" className="px-8 py-4 text-lg font-medium text-gray-700 hover:text-brand-600 transition-colors">
              Lihat Jurusan
            </a>
          </motion.div>
        </div>
      </section>

      {/* Jurusan Section */}
      <section id="jurusan" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Program Keahlian</h2>
            <p className="text-gray-600">Kami memiliki 6 jurusan unggulan yang siap mencetak tenaga kerja handal.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 'TKJ', name: 'Teknik Komputer & Jaringan', desc: 'Mempelajari instalasi jaringan, server, dan keamanan siber.' },
              { id: 'DKV', name: 'Desain Komunikasi Visual', desc: 'Fokus pada desain grafis, multimedia, dan ilustrasi kreatif.' },
              { id: 'AK', name: 'Akuntansi', desc: 'Manajemen keuangan, perpajakan, dan audit profesional.' },
              { id: 'BC', name: 'Broadcasting', desc: 'Produksi konten televisi, film, dan media digital.' },
              { id: 'MPLB', name: 'Manajemen Perkantoran & Layanan Bisnis', desc: 'Administrasi bisnis modern dan manajemen perkantoran.' },
              { id: 'BD', name: 'Bisnis Digital', desc: 'Pemasaran online, e-commerce, dan analisis bisnis digital.' },
            ].map((j, i) => (
              <motion.div 
                key={j.id}
                whileHover={{ y: -5 }}
                className="bento-card hover:border-brand-300 transition-all"
              >
                <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6">
                  {j.id}
                </div>
                <h3 className="text-xl font-bold mb-3">{j.name}</h3>
                <p className="text-gray-600 leading-relaxed">{j.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>© 2024 SMK Prima Unggul. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// --- Auth Context & Hooks ---

const AuthContext = React.createContext<{
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
} | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser(profile);
        } else {
          // If profile doesn't exist, maybe create it or handle error
          // For now, just set user with basic info
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata.full_name || 'User',
            role: session.user.user_metadata.role || 'guru',
            created_at: new Date().toISOString()
          });
        }
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser(profile);
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata.full_name || 'User',
            role: session.user.user_metadata.role || 'guru',
            created_at: new Date().toISOString()
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- App Components ---

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/app');
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bento-card p-10">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-200">
              <School size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-text-main tracking-tight">Selamat Datang</h2>
            <p className="text-gray-500 mt-2">Masuk ke sistem absensi SMK Prima Unggul</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
              <input 
                type="email" 
                className="input" 
                placeholder="nama@sekolah.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                className="input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-4 text-sm uppercase tracking-widest"
            >
              {loading ? 'Memproses...' : 'MASUK SEKARANG'}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-brand-600 transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const Sidebar = ({ role }: { role: UserRole }) => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard, roles: ['admin', 'guru', 'tenaga_kependidikan'] },
    { name: 'Absensi Karyawan', path: '/app/absensi-karyawan', icon: UserCheck, roles: ['admin', 'guru', 'tenaga_kependidikan'] },
    { name: 'Absensi Siswa', path: '/app/absensi-siswa', icon: GraduationCap, roles: ['admin', 'guru'] },
    { name: 'Rekap Karyawan', path: '/app/rekap-karyawan', icon: FileText, roles: ['admin'] },
    { name: 'Rekap Siswa', path: '/app/rekap-siswa', icon: FileText, roles: ['admin', 'guru'] },
    { name: 'Data Siswa', path: '/app/data-siswa', icon: Users, roles: ['admin'] },
    { name: 'User Management', path: '/app/users', icon: Settings, roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="w-60 bg-brand-600 text-white flex flex-col h-full shadow-xl z-50">
      <div className="p-6 pb-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">
            <School size={18} />
          </div>
          <span className="font-extrabold text-lg tracking-tighter uppercase">SMK Prima Unggul</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-all group relative",
                isActive 
                  ? "bg-white/15 opacity-100 font-bold border-l-4 border-white" 
                  : "opacity-80 hover:bg-white/10 hover:opacity-100"
              )}
            >
              <item.icon size={18} className={cn(isActive ? "text-white" : "text-white/70 group-hover:text-white")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1">Role Anda</p>
          <p className="text-sm font-bold capitalize text-white">
            {role.replace('_', ' ')}
          </p>
        </div>
      </div>
    </div>
  );
};

const Topbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-[70px] bg-white border-b border-card-border px-8 flex items-center justify-between sticky top-0 z-40">
      <h1 className="text-xl font-bold text-text-main tracking-tight">
        Overview Dashboard
      </h1>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-text-main leading-tight">{user?.full_name}</p>
            <div className="flex justify-end mt-0.5">
              <span className="tag bg-black text-white px-1.5 py-0.5 rounded-sm text-[9px]">
                {user?.role.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold border border-brand-100">
            {user?.full_name.charAt(0)}
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-brand-600 text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-brand-700 transition-all active:scale-95"
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full"
      />
    </div>
  );

  if (!user) return null;

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar role={user.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// --- Page Components ---

import Dashboard from './pages/Dashboard';
import EmployeeAttendance from './pages/EmployeeAttendance';
import StudentAttendance from './pages/StudentAttendance';
import RekapEmployee from './pages/RekapEmployee';
import RekapStudent from './pages/RekapStudent';
import StudentData from './pages/StudentData';
import UserManagement from './pages/UserManagement';

// --- Main App ---

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/app" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/app/absensi-karyawan" element={<AppLayout><EmployeeAttendance /></AppLayout>} />
          <Route path="/app/absensi-siswa" element={<AppLayout><StudentAttendance /></AppLayout>} />
          <Route path="/app/rekap-karyawan" element={<AppLayout><RekapEmployee /></AppLayout>} />
          <Route path="/app/rekap-siswa" element={<AppLayout><RekapStudent /></AppLayout>} />
          <Route path="/app/data-siswa" element={<AppLayout><StudentData /></AppLayout>} />
          <Route path="/app/users" element={<AppLayout><UserManagement /></AppLayout>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
