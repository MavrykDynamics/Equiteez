import { useCallback, useState } from 'react';

import { useDidUpdate } from 'app/hooks/use-did-update';
import { useEnvContext } from '~/providers/EnvProvider/EnvProvider';

/**
 * @arg sources // Memoize
 */
export const useImagesStackLoading = (sources: string[]) => {
  const { IS_WEB } = useEnvContext();
  const emptyStack = sources.length < 1;

  const [isLoading, setIsLoading] = useState(!IS_WEB || emptyStack === false);
  const [isStackFailed, setIsStackFailed] = useState(emptyStack);

  useDidUpdate(() => {
    const emptyStack = sources.length < 1;

    setIndex(emptyStack ? -1 : 0);
    setIsLoading(emptyStack === false);
    setIsStackFailed(emptyStack);
  }, [sources]);

  const [index, setIndex] = useState(emptyStack ? -1 : 0);

  const src = sources[index] as string | undefined;

  const onSuccess = useCallback(() => void setIsLoading(false), []);

  const onFail = useCallback(() => {
    if (isStackFailed) {
      return;
    }

    if (index + 1 === sources.length) {
      setIndex(-1);
      setIsLoading(false);
      setIsStackFailed(true);

      return;
    }

    setIndex(index + 1);
  }, [isStackFailed, sources.length, index]);

  return {
    src,
    isLoading,
    isStackFailed,
    onSuccess,
    onFail,
  };
};
