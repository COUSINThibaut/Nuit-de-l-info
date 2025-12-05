import { StudentProfile } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://178.33.42.50:3023/api');

const transformStudent = (student: any): StudentProfile => ({
  ...student,
  createdAt: new Date(student.createdAt),
  updatedAt: new Date(student.updatedAt),
});

export const api = {
  getAllStudents: async (): Promise<StudentProfile[]> => {
    try {
      const response = await fetch(`${API_URL}/students`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data.data.map(transformStudent);
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  getStudentById: async (id: string): Promise<StudentProfile | null> => {
    try {
      const response = await fetch(`${API_URL}/students/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return transformStudent(data.data);
    } catch (error) {
      console.error('Error fetching student:', error);
      return null;
    }
  },

  createStudent: async (student: StudentProfile): Promise<StudentProfile | null> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(student),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return transformStudent(data.data);
    } catch (error) {
      console.error('Error creating student:', error);
      return null;
    }
  }
};
