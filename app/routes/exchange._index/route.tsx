import type { MetaFunction } from '@remix-run/node';
import PageLayout from '~/layouts/PageLayout/Pagelayout';
import { useEffect } from 'react';
import { Navigate } from '@remix-run/react';
import { useNavigate } from 'react-router-dom';

export const meta: MetaFunction = () => {
  return [
    { title: 'Exchange' },
    { name: 'description', content: 'Exchange route!' },
  ];
};

export default function Exchange() {

  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/exchange/0`);
  }, [navigate]);

  return (<div>Loading...</div>)
  // return (
  //   <Navigate to={'/exchange/0'} />
  // );
}
