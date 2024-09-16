import { useEffect, useRef } from 'react';

export const useOutsideClick = (callback: () => void, disable = false) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disable) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mouseup', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [callback, disable]);

  return ref;
};
