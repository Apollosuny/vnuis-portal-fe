import { Student } from '@/types/user.types';
import { nexusAxios } from '@/configs/axios.config';

const BASE_URL = '/students';

export const studentApi = {
  getStudents: async (): Promise<Student[]> => {
    const response = await nexusAxios.get<Student[]>(BASE_URL);
    return response.data;
  },

  getStudentById: async (id: string): Promise<Student> => {
    const response = await nexusAxios.get<Student>(`${BASE_URL}/${id}`);
    return response.data;
  },

  createStudent: async (student: Omit<Student, 'id'>): Promise<Student> => {
    const response = await nexusAxios.post<Student>(BASE_URL, student);
    return response.data;
  },

  updateStudent: async (
    id: string,
    student: Partial<Student>
  ): Promise<Student> => {
    const response = await nexusAxios.patch<Student>(
      `${BASE_URL}/${id}`,
      student
    );
    return response.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    await nexusAxios.delete(`${BASE_URL}/${id}`);
  },
};
