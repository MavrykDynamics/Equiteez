import { FooterSecondary } from "~/layouts/PageLayout/Footer/FooterSecondary";
import { Header } from "~/layouts/PageLayout/Header";
import MaintanceImg from "app/assets/error/maintance.png";

export const MaintancePageTemp = () => {
  return (
    <>
      <div className="h-screen overflow-hidden  bg-mvrk font-aeonik text-mvrk-main gap-3 flex items-center flex-col w-screen bg-sand-50">
        <Header />
        <div className="flex flex-col items-center text-center z-10 justify-self-start transform mt-[100px]">
          <div className="flex flex-col gap-5 items-center text-sand-900">
            <h3 className="text-section-headline font-semibold">
              The site is currently down <br />
              for maintenance
            </h3>
            <p className="text-base text-center">
              The Equiteez app will be back up shortly, we apologize for any
              inconveniences caused. <br /> See you soon!
            </p>
          </div>
        </div>

        <div className="z-10 w-full">
          <FooterSecondary theme="light" />
        </div>
        <img
          src={MaintanceImg}
          alt="maintance"
          className="w-full h-auto absolute left-0 bottom-0 right-0 "
        />
      </div>
    </>
  );
};
