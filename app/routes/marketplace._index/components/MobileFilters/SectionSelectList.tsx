import { FC, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ChevronDownIcon from "app/icons/chevron-down.svg?react";
import { Icon } from "~/lib/atoms/Icon";
import { Checkbox } from "~/lib/atoms/CheckBox";

import styles from "./SectionSelectList.module.css";

type PropsType = {
  name: string;
  options: Array<{
    label: string;
    prevIcon?: string;
    prevImage?: string;
    image?: string;
    icon?: string;
    value: string;
  }>;
  selectedValues: Set<string>;
  onChange: (value: string) => void;
};

const listVariants = {
  open: {
    height: "auto",
    opacity: 1,
  },
  closed: {
    height: 0,
    opacity: 0,
  },
};

export const SectionSelectList: FC<PropsType> = ({
  name,
  options,
  selectedValues,
  onChange,
}) => {
  const initialOpenState = useRef(
    options.some((option) => selectedValues.has(option.value))
  ).current;
  const [isOpen, setIsOpen] = useState(initialOpenState);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const createOptionClickHandler = (value: string) => () => {
    onChange(value);
  };

  const countOfSelected = useMemo(
    () =>
      options.reduce((acc, option) => {
        if (selectedValues.has(option.value)) {
          return acc + 1;
        }
        return acc;
      }, 0),
    [options, selectedValues]
  );

  return (
    <div className={styles.sectionList}>
      <button onClick={handleToggle} className={styles.sectionButton}>
        <span className={styles.sectionName}>{name}</span>
        <div className={styles.rightSide}>
          {countOfSelected > 0 && (
            <span className={styles.selectedCount}>
              <span className={styles.selectedCountText}>
                {countOfSelected}
              </span>
            </span>
          )}
          <ChevronDownIcon
            width={24}
            height={24}
            color="var(--color-sand-900)"
            className={styles.chevronIcon}
            data-opened={isOpen}
          />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.optionsList}
            variants={listVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={createOptionClickHandler(option.value)}
                className={styles.optionButton}
              >
                <Checkbox checked={selectedValues.has(option.value)} />
                {option.prevIcon && (
                  <span className={styles.prevIconWrapper}>
                    <Icon icon={option.prevIcon} />
                  </span>
                )}
                {option.prevImage && (
                  <img
                    alt={option.label}
                    className={styles.prevImg}
                    src={option.prevImage}
                  />
                )}
                {option.label} {option.image}
                {option.icon && <Icon className="ml-auto" icon={option.icon} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
