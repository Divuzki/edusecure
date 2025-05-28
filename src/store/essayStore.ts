import { create } from 'zustand';
import { essays } from '../utils/api';
import { Essay, EssayScore } from '../types';

interface EssayState {
  studentEssays: Essay[];
  teacherEssays: Essay[];
  isLoading: boolean;
  error: string | null;
}

interface EssayStore extends EssayState {
  submitEssay: (essay: any) => Promise<void>;
  getStudentEssays: (studentId: string) => Promise<void>;
  getTeacherEssays: () => Promise<void>;
  gradeEssay: (essayId: string, score: EssayScore) => Promise<void>;
}

export const useEssayStore = create<EssayStore>((set) => ({
  studentEssays: [],
  teacherEssays: [],
  isLoading: false,
  error: null,
  
  submitEssay: async (essay) => {
    set({ isLoading: true, error: null });
    try {
      const submittedEssay = await essays.submit(essay);
      set((state) => ({
        studentEssays: [...state.studentEssays, submittedEssay],
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Submission failed',
        isLoading: false,
      });
    }
  },
  
  getStudentEssays: async (studentId) => {
    set({ isLoading: true, error: null });
    try {
      const essays = await essays.getByStudent(studentId);
      set({ studentEssays: essays, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch essays',
        isLoading: false,
      });
    }
  },
  
  getTeacherEssays: async () => {
    set({ isLoading: true, error: null });
    try {
      const essays = await essays.getByTeacher();
      set({ teacherEssays: essays, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch essays',
        isLoading: false,
      });
    }
  },
  
  gradeEssay: async (essayId, score) => {
    set({ isLoading: true, error: null });
    try {
      const gradedEssay = await essays.grade(essayId, score);
      set((state) => ({
        teacherEssays: state.teacherEssays.map(essay =>
          essay.id === essayId ? gradedEssay : essay
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Grading failed',
        isLoading: false,
      });
    }
  },
}));