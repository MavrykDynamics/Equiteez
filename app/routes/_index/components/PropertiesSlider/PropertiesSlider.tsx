import { EmblaOptionsType } from 'embla-carousel';
import EmblaCarousel from './EmblaCarousel';

import estates from 'app/mocks/estates.json';
import { useState } from 'react';

const OPTIONS: EmblaOptionsType = { align: 'start' };

export const PropertiesSlider = () => {
  const [estateSlidesData] = useState(() => estates);

  return (
    <section className="px-11">
      <div className="px-11 py-16 bg-green-main rounded-4xl">
        <h1 className="text-white text-hero max-w-[1017px] mb-4">
          Explore our diverse portfolio of exceptional properties
        </h1>
        <EmblaCarousel slides={estateSlidesData} options={OPTIONS} />
      </div>
    </section>
  );
};
