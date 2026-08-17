import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Advisor, CouncilSession } from '@/types';

interface AdvisorStore {
  advisors: Advisor[];
  sessions: CouncilSession[];
  addAdvisor: (advisor: Omit<Advisor, 'id' | 'createdAt'>) => Advisor;
  updateAdvisor: (id: string, updates: Partial<Advisor>) => void;
  deleteAdvisor: (id: string) => void;
  reorderAdvisors: (ids: string[]) => void;
  addSession: (session: Omit<CouncilSession, 'id' | 'date'>) => CouncilSession;
  updateSession: (id: string, updates: Partial<CouncilSession>) => void;
  deleteSession: (id: string) => void;
  addResponse: (sessionId: string, advisorId: string, responseText: string) => void;
  getAdvisor: (id: string) => Advisor | undefined;
  getSession: (id: string) => CouncilSession | undefined;
}

export const useAdvisorStore = create<AdvisorStore>()(
  persist(
    (set, get) => ({
      advisors: [],
      sessions: [],

      addAdvisor: (data) => {
        const advisor: Advisor = {
          ...data,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ advisors: [...s.advisors, advisor] }));
        return advisor;
      },

      updateAdvisor: (id, updates) =>
        set((s) => ({
          advisors: s.advisors.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      deleteAdvisor: (id) =>
        set((s) => ({ advisors: s.advisors.filter((a) => a.id !== id) })),

      reorderAdvisors: (ids) =>
        set((s) => {
          const map = new Map(s.advisors.map((a) => [a.id, a]));
          const reordered = ids.map((id) => map.get(id)!).filter(Boolean);
          const rest = s.advisors.filter((a) => !ids.includes(a.id));
          return { advisors: [...reordered, ...rest] };
        }),

      addSession: (data) => {
        const session: CouncilSession = {
          ...data,
          id: uuidv4(),
          date: new Date().toISOString(),
        };
        set((s) => ({ sessions: [...s.sessions, session] }));
        return session;
      },

      updateSession: (id, updates) =>
        set((s) => ({
          sessions: s.sessions.map((ses) => (ses.id === id ? { ...ses, ...updates } : ses)),
        })),

      deleteSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((ses) => ses.id !== id) })),

      addResponse: (sessionId, advisorId, responseText) =>
        set((s) => ({
          sessions: s.sessions.map((ses) =>
            ses.id === sessionId
              ? {
                  ...ses,
                  responses: [
                    ...ses.responses,
                    { advisorId, responseText, timestamp: new Date().toISOString() },
                  ],
                }
              : ses
          ),
        })),

      getAdvisor: (id) => get().advisors.find((a) => a.id === id),
      getSession: (id) => get().sessions.find((s) => s.id === id),
    }),
    { name: 'inner-council-storage' }
  )
);
