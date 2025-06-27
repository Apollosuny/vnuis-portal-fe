import { Student, CreateStudent } from '@/types/user.types';
import { nexusAxios } from '@/configs/axios.config';

const BASE_URL = '/student';

// Define response type for paginated students
interface StudentListResponse {
  items: Student[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const studentApi = {
  getStudents: async (): Promise<StudentListResponse> => {
    const response = await nexusAxios.get<StudentListResponse>(BASE_URL);
    return response.data;
  },

  getStudentById: async (id: string): Promise<Student> => {
    console.log('id', id);
    const response = await nexusAxios.get<Student>(`${BASE_URL}/${id}`);
    return response.data;
  },

  createStudent: async (student: CreateStudent): Promise<Student> => {
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
