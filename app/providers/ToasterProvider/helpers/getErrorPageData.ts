import { InternalErrorType } from '~/errors/error.type';
import {
  errorDescDefaultText,
  errorDescDefaultTextWhenError,
  errorHeaderDefaultText,
  errorHeaderDefaultTextWhenError,
} from '../toaster.provider.const';
import { ERROR_TYPE_FATAL, ERROR_TYPE_ROUTER } from '~/errors/error.const';

export function getErrorPageData(type: InternalErrorType) {
  switch (type) {
    case ERROR_TYPE_ROUTER:
      return {
        header: errorHeaderDefaultText,
        desc: errorDescDefaultText,
      };
    case ERROR_TYPE_FATAL:
    default:
      return {
        header: errorHeaderDefaultTextWhenError,
        desc: errorDescDefaultTextWhenError,
      };
  }
}
