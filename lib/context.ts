import { createContext } from 'react';
export const AppContext = createContext<{ user: any, role: string }>({ user: null, role: "noob"});