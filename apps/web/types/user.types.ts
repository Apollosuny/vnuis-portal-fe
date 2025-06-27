// User type definitions

export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export type User = {
  id: string;
  username: string;
  role: Role;
  jwtValidFrom: string;
  lastLoginAt?: string;
  blocked: boolean;
  student?: Student;
  operator?: Operator;
};

export type Student = {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  dob: string;
  enrollYear: number;
  major: string;
  email: string;
  phone?: string;
  address?: string;
};

export type CreateStudent = {
  username: string;
  password: string;
  studentId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  dob: string;
  enrollYear: number;
  major: string;
  email: string;
  phone?: string;
  address?: string;
};

export type Operator = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  email: string;
  phone?: string;
};

export type LoginCredentials = {
  username: string;
  password: string;
};
