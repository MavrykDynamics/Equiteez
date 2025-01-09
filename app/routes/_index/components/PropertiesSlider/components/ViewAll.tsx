import { Link } from "@remix-run/react";
import { Button } from "~/lib/atoms/Button";

// icons
import ArrowRight from "app/icons/arrow-right.svg?react";

export const ViewAll = () => {
  return (
    <Link to={"/marketplace"}>
      <Button
        variant="custom"
        className="text-white bg-transparent border-2 border-white py-[8px]"
      >
        <div className="flex items-center gap-2">
          View All
          <ArrowRight className="w-6 h-6 stroke-current" />
        </div>
      </Button>
    </Link>
  );
};
