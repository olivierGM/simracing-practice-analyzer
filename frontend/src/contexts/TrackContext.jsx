/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const TrackContext = createContext(null);

export function TrackProvider({ children }) {
  const [trackFilter, setTrackFilter] = useState(null);
  
  return (
    <TrackContext.Provider value={{ trackFilter, setTrackFilter }}>
      {children}
    </TrackContext.Provider>
  );
}

export function useTrackContext() {
  return useContext(TrackContext);
}

