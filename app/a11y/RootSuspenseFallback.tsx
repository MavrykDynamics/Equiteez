import { FC, useEffect } from 'react';

import useForceUpdate from 'use-force-update';

import { Spinner } from '~/lib/atoms/Spinner';

const DELAY = 1_000;

let startedAt: number;

const RootSuspenseFallback: FC = () => {
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (!startedAt) {
      startedAt = Date.now();
    }
    if (startedAt + DELAY > Date.now()) {
      const t = setTimeout(forceUpdate, DELAY - (Date.now() - startedAt));
      return () => clearTimeout(t);
    }
    return undefined;
  }, [forceUpdate]);

  return (
    <div className="flex items-center justify-center h-screen bg-primary-bg">
      <div>
        <Spinner />
      </div>
    </div>
  );
};

export default RootSuspenseFallback;
