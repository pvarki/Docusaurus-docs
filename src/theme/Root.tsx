import React from 'react';
import {OSProvider} from '../context/OSContext';

export default function Root({children}: {children: React.ReactNode}) {
  return <OSProvider>{children}</OSProvider>;
}
