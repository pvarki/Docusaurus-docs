import React, {createContext, useContext, useEffect, useState} from 'react';
import {detectOS, OS} from '../utils/getOperatingSystem';

type OSContextShape = {
  os: OS;
  setOS: (os: OS) => void;
};

const OSContext = createContext<OSContextShape | undefined>(undefined);
export const useOS = () => {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error('useOS must be inside <OSProvider>');
  return ctx;
};

export const OSProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [os, setOS] = useState<OS>('android');

  useEffect(() => {
    // first load: auto‑detect or restore manual choice
    const stored = localStorage.getItem('os') as OS | null;
    setOS(stored ?? detectOS());
  }, []);

  const setAndStore = (next: OS) => {
    localStorage.setItem('os', next);
    setOS(next);
  };

  return (
    <OSContext.Provider value={{os, setOS: setAndStore}}>
      {children}
    </OSContext.Provider>
  );
};
