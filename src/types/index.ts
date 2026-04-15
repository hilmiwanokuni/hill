export type UserRole = 'admin' | 'guru' | 'tenaga_kependidikan';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  class_name: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id?: string; // For employees
  student_id?: string; // For students
  date: string;
  status: 'present' | 'absent' | 'late' | 'permission';
  notes?: string;
  created_at: string;
  type: 'employee' | 'student';
}

export interface AttendanceRekap {
  date: string;
  present: number;
  absent: number;
  late: number;
  permission: number;
}
