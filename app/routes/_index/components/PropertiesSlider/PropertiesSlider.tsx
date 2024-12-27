import { EmblaOptionsType } from "embla-carousel";
import EmblaCarousel from "./EmblaCarousel";
import { getRestMockedEstates } from "~/providers/EstatesProvider/utils/estatesMocked";

// fake data
const fakeCardsRecord = getRestMockedEstates();
const fakeEstates = Object.values(fakeCardsRecord).slice(0, 10);

const OPTIONS: EmblaOptionsType = { align: "start" };

export const PropertiesSlider = () => {
  return (
    <div className="px-11 py-16 bg-green-main rounded-4xl">
      <h1 className="text-white text-hero max-w-[1017px] mb-6">Newly Listed</h1>
      <EmblaCarousel slides={fakeEstates} options={OPTIONS} />
    </div>
  );
};
