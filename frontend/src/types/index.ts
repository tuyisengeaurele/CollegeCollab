export type UserRole = 'STUDENT' | 'LECTURER' | 'ADMIN';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEWED' | 'COMPLETED' | 'OVERDUE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type SubmissionType = 'FILE' | 'TEXT' | 'LINK';
export type NotificationType = 'TASK_ASSIGNED' | 'SUBMISSION_RECEIVED' | 'GRADE_RELEASED' | 'ANNOUNCEMENT' | 'DEADLINE_REMINDER' | 'MESSAGE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentId: string;
  enrollmentYear: number;
  gpa?: number;
  user: User;
}

export interface LecturerProfile {
  id: string;
  userId: string;
  employeeId: string;
  title: string;
  specialization?: string;
  user: User;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  departmentId: string;
  department: Department;
  lecturerId: string;
  lecturer: User;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  course: Course;
  student: User;
  enrolledAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  courseId: string;
  course: Course;
  createdById: string;
  createdBy: User;
  submissions?: Submission[];
  createdAt: string;
  updatedAt: string;
  maxScore?: number;
  attachmentUrl?: string;
}

export interface Submission {
  id: string;
  taskId: string;
  task: Task;
  studentId: string;
  student: User;
  type: SubmissionType;
  content?: string;
  fileUrl?: string;
  linkUrl?: string;
  submittedAt: string;
  updatedAt: string;
  grade?: Grade;
}

export interface Grade {
  id: string;
  submissionId: string;
  score: number;
  maxScore: number;
  feedback?: string;
  gradedById: string;
  gradedBy: User;
  gradedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  sender: User;
  receiverId?: string;
  receiver?: User;
  courseId?: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  courseId?: string;
  course?: Course;
  authorId: string;
  author: User;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
