import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Visit } from '../types/index.js';

interface VisitContextType {
  visit: Visit | null;
  setVisit: (visit: Visit | null) => void;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

export function VisitProvider({ children }: { children: ReactNode }) {
  const [visit, setVisit] = useState<Visit | null>(null);

  return (
    <VisitContext.Provider value={{ visit, setVisit }}>
      {children}
    </VisitContext.Provider>
  );
}

export function useVisitContext(): VisitContextType {
  const context = useContext(VisitContext);
  if (!context) throw new Error('useVisitContext must be used within VisitProvider');
  return context;
}
