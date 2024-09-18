import { useEffect, useRef } from 'react';

function usePrevious<T>(value: T, condition = true): T | undefined {
  const ref = useRef<T | undefined>();
  useEffect(() => {
    if (condition) ref.current = value; //assign the value of ref to the argument
  }, [condition, value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
}
export default usePrevious;
