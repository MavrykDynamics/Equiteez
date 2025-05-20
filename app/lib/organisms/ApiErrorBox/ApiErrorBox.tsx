import { FC } from "react";
import { Button } from "~/lib/atoms/Button";

const defaultOnRetry = () => {
  window.location.reload();
};

type ApiErrorBoxProps = {
  onRetry?: () => void;
  message: string | React.ReactNode;
};

export const ApiErrorBox: FC<ApiErrorBoxProps> = ({
  onRetry = defaultOnRetry,
  message,
}) => {
  return (
    <div className="bg-red-300 text-white border-red-500 border-2 flex flex-col gap-4 rounded-4xl p-6 ">
      <p className="text-xl">{message}</p>
      <div className="flex flex-col gap-2">
        <p className="text-base">
          Try reloading the page or come back again later.
        </p>
        <div>
          <Button
            variant="custom"
            className="bg-yellow-500 hover:bg-yellow-400"
            onClick={onRetry}
          >
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
};
