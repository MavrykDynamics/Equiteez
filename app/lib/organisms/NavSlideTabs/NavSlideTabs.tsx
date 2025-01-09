import React, { FC, useRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

import styles from "./navSlideTabs.module.css";
import { CustomLink } from "~/lib/atoms/CustomLink/CustomLink";

type Position = {
  left: number;
  width: number;
  opacity: number;
  scale: number;
};

export type SlideNavTab = {
  id: number;
  to: string;
  text: string;
  disabled: boolean;
};

type SlideTabsProps = {
  tabs: SlideNavTab[];
  activeTabId: number | null;
  fixedWidth?: number;
};

export const NavSlideTabs: FC<SlideTabsProps> = ({
  tabs,
  activeTabId,
  fixedWidth,
}) => {
  const [position, setPosition] = useState<Position>({
    left: 0,
    width: 0,
    opacity: 0,
    scale: 0,
  });

  return (
    <ul
      onMouseLeave={() => {
        setPosition((pv) => ({
          ...pv,
          opacity: 0,
          scale: 0,
        }));
      }}
      className="relative mx-auto flex w-fit items-center gap-[1px] rounded-xl bg-gray-100 px-2 py-1"
    >
      {tabs.map((tab, idx, arr) => (
        <React.Fragment key={tab.id}>
          <Tab
            setPosition={setPosition}
            fixedWidth={fixedWidth}
            isActive={tab.id === activeTabId}
            to={tab.to}
            disabled={tab.disabled}
          >
            {tab.text}
          </Tab>

          {/* grid divider */}
          {idx !== arr.length - 1 && (
            <div className="w-[1px] h-5 bg-gray-200" />
          )}
        </React.Fragment>
      ))}

      <Cursor position={position} />
    </ul>
  );
};

const Tab: FC<
  PropsWithChildren & {
    setPosition: React.Dispatch<React.SetStateAction<Position>>;
    fixedWidth?: number;
    isActive: boolean;
    to: string;
    disabled: boolean;
  }
> = ({ children, setPosition, fixedWidth, isActive, to, disabled }) => {
  const ref = useRef<HTMLLIElement | null>(null);

  return (
    <CustomLink to={to} disabled={disabled}>
      <li
        ref={ref}
        style={{ minWidth: fixedWidth ? fixedWidth : "unset" }}
        onMouseEnter={() => {
          if (!ref?.current) return;

          const { width } = ref.current.getBoundingClientRect();

          setPosition({
            left: ref.current.offsetLeft,
            width,
            opacity: 1,
            scale: 1,
          });
        }}
        className={clsx(
          "relative z-10 block cursor-pointer p-2 rounded-xl",
          "text-center text-body-xs font-semibold text-black-secondary capitalize",
          disabled && "opacity-50 pointer-events-none",
          isActive && styles.active,
          isActive && "bg-sand-800  text-white"
        )}
      >
        {children}
      </li>
    </CustomLink>
  );
};

const Cursor: FC<{ position: Position }> = ({ position }) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      transition={{
        scale: { ease: "linear" },
        // left: { duration: 0 },
        width: { duration: 0 },
      }}
      // whileHover={{
      //   transition: {
      //     left: { duration: 0.3 },
      //   },
      // }}
      className="absolute z-0 h-[34px] rounded-xl bg-sand-300"
    />
  );
};
