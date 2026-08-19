import { Link } from "@remix-run/react";
import { Button } from "~/lib/atoms/Button";
import styles from './viewAll.module.css';
// icons
import ArrowRight from "app/icons/arrow-right.svg?react";

export const ViewAll = () => {
  return (
    <Link to={"/marketplace"}>
      <Button
        variant="custom"
        className={styles.button}
      >
          View All
          <ArrowRight className="w-6 h-6 stroke-current" />
      </Button>
    </Link>
  );
};
