import { useEffect, useState } from 'react';

export const PHONE_WIDTH = 480;
export const PHONE_MAX_WIDTH = 670;
export const TABLET_MIN_WIDTH = 820;
export const TABLET_MAX_WIDTH = 1180;
export const DESKTOP_WIDTH = 1304;

export function useWindowDimensions(): { width: number; height: number } {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDimensions({ width, height });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return dimensions;
}
