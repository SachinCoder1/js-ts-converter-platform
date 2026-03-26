'use client';

import { useState, useEffect } from 'react';

export function useIsMac() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac/.test(navigator.userAgent));
  }, []);

  return isMac;
}
