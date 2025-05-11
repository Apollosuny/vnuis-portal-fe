export interface IUser {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStudent {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  dob: string;
  enrollYear: string;
  major: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface IOperator {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  email: string;
  phone: string;
  userId: string;
}
