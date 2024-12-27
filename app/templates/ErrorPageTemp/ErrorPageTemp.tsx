import { ERROR_TYPE_FATAL, ERROR_TYPE_ROUTER } from "~/errors/error.const";
import { InternalErrorType } from "~/errors/error.type";
import { FooterSecondary } from "~/layouts/PageLayout/Footer/FooterSecondary";
import { Header } from "~/layouts/PageLayout/Header/Header";
import { Button } from "~/lib/atoms/Button";
import {
  errorDescDefaultText,
  errorHeaderDefaultText,
} from "~/providers/ToasterProvider/toaster.provider.const";

import Error404Img from "app/assets/error/404.png";

type ErrorPageProps = {
  headerText?: string;
  descText?: string | JSX.Element;
  type?: InternalErrorType;
};

export const ErrorPageTemp = ({
  headerText = errorHeaderDefaultText,
  descText = errorDescDefaultText,
  type = ERROR_TYPE_FATAL,
}: ErrorPageProps) => {
  return (
    <>
      <div className="h-screen overflow-hidden  bg-mvrk font-aeonik text-mvrk-main gap-3 flex items-center justify-between flex-col w-screen bg-sand-50">
        <Header />
        <div className="flex flex-col items-center">
          <img
            className="w-[689px] h-auto object-cover mb-[72px]"
            src={Error404Img}
            alt="404"
          />
          <div className="flex flex-col gap-4 items-center text-sand-900">
            <h3 className="text-section-headline font-semibold">
              {headerText || "Unknown error"}
            </h3>
            <p className="text-base text-center">{descText}</p>
          </div>
          {type === ERROR_TYPE_ROUTER && (
            <a href="/" className="mvrk-btn mx-auto block w-fit mt-6">
              <Button> Go To Main Page</Button>
            </a>
          )}
        </div>

        <FooterSecondary />
      </div>
    </>
  );
};
