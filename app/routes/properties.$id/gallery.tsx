import { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [{ title: 'Gallery' }, { name: 'description', content: 'Gallery' }];
};

export default function Gallery() {
  return <div className="text-hero text-content">Gallery</div>;
}
