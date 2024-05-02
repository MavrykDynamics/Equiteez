import { EmblaOptionsType } from 'embla-carousel';
import EmblaCarousel from './EmblaCarousel';

const OPTIONS: EmblaOptionsType = { align: 'start' };
const SLIDE_COUNT = 6;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

export const PropertiesSlider = () => {
  return (
    <section className="px-11">
      <div className="px-11 py-16 bg-green-main rounded-4xl">
        <h1 className="text-white text-hero max-w-[1017px] mb-4">
          Explore our diverse portfolio of exceptional properties
        </h1>
        <EmblaCarousel slides={SLIDES} options={OPTIONS} />
      </div>
    </section>
  );
};
