import type { MetaFunction } from '@remix-run/node';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FullScreenSpinner } from '~/lib/atoms/Spinner/Spinner';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';

export const meta: MetaFunction = () => {
  return [
    { title: 'Exchange' },
    { name: 'description', content: 'Exchange route!' },
  ];
};

export default function Exchange() {
  const { estates } = useEstatesContext();
  const navigate = useNavigate();
  const id = useMemo(
    () =>
      estates.length > 0
        ? estates[0].assetDetails.blockchain[0].identifier
        : null,
    [estates]
  );

  useEffect(() => {
    if (!id) navigate('/');
    navigate(`/exchange/${id}`);
  }, [navigate, id]);

  return <FullScreenSpinner />;
}
