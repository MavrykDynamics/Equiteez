// consts
import { ERROR_TYPE_FATAL, ERROR_TYPE_ROUTER } from '~/errors/error.const';
import { InternalErrorType } from '~/errors/error.type';
import {
  errorDescDefaultText,
  errorHeaderDefaultText,
} from '~/providers/ToasterProvider/toaster.provider.const';

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
    <div className="h-screen  bg-mvrk font-aeonik text-mvrk-main overflow-hidden gap-3 flex items-center justify-center flex-col w-screen">
      <h1 className="font-bold text-2xl">Error</h1>
      <div>{headerText || 'Unknown error'}</div>
      <div>{descText}</div>
      {type === ERROR_TYPE_ROUTER && (
        <a href="/" className="mvrk-btn w-[300px]">
          Go To Main Page
        </a>
      )}
    </div>
  );
};
