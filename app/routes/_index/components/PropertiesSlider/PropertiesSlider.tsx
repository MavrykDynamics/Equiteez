import { EmblaOptionsType } from "embla-carousel";
import EmblaCarousel from "./EmblaCarousel";
import { useEstatesContext } from "~/providers/EstatesProvider/estates.provider";

const OPTIONS: EmblaOptionsType = { align: "start" };

export const PropertiesSlider = () => {
  const { estatesArr } = useEstatesContext();

  return (
    <section className="px-11">
      <div className="px-11 py-16 bg-green-main rounded-4xl">
        <h1 className="text-white text-hero max-w-[1017px] mb-6">
          Explore our diverse portfolio of exceptional properties
        </h1>
        <EmblaCarousel slides={estatesArr.slice(0, 7)} options={OPTIONS} />
      </div>
    </section>
  );
};
