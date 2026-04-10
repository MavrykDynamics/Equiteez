import { FC, useEffect, useState } from "react";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

import CloseIcon from "app/icons/cross.svg?react";
import EyeClosedBoldIcon from "app/icons/eye-closed-bold.svg?react";
import EyeOpenBoldIcon from "app/icons/eye-open-bold.svg?react";

import { OrderBookTable } from "./OrderBookTable";
import type { OrderBookToggleLabels } from "./orderBook.types";
import styles from "./orderBookPopup.module.css";

const PANEL_TRANSITION = {
  duration: 0.2,
  ease: "easeInOut",
} as const;

const MOBILE_BREAKPOINT = 820;

export const ORDER_BOOK_TOGGLE_LABELS = {
  hide: "Hide Order Book",
  show: "Show Order Book",
} satisfies OrderBookToggleLabels;

type OrderBookPopupProps = {
  baseTokenDecimals: number;
  baseTokenSymbol: string;
  className?: string;
  emptyMessage?: string;
  enabled?: boolean;
  isOpen: boolean;
  onClose: () => void;
  quoteTokenDecimals: number;
  quoteTokenSymbol?: string;
  referencePrice?: number;
  rwaAddress?: string | null;
  useSimulatedOrders?: boolean;
};

type OrderBookToggleButtonProps = {
  className?: string;
  isOpen: boolean;
  labels: OrderBookToggleLabels;
  onClick: () => void;
};

const getIsMobileViewport = () =>
  typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT;

const useIsMobileViewport = () => {
  const [isMobileViewport, setIsMobileViewport] = useState(getIsMobileViewport);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleResize = () => {
      setIsMobileViewport(getIsMobileViewport());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobileViewport;
};

export const OrderBookToggleButton: FC<OrderBookToggleButtonProps> = ({
  className,
  isOpen,
  labels,
  onClick,
}) => {
  const Icon = isOpen ? EyeClosedBoldIcon : EyeOpenBoldIcon;

  return (
    <button
      type="button"
      aria-pressed={isOpen}
      className={clsx(styles.toggleButton, className)}
      onClick={onClick}
    >
      <Icon className={styles.toggleIcon} />
      <span className={styles.toggleLabel}>
        {isOpen ? labels.hide : labels.show}
      </span>
    </button>
  );
};

export const OrderBookPopup: FC<OrderBookPopupProps> = ({
  baseTokenDecimals,
  baseTokenSymbol,
  className,
  emptyMessage,
  enabled = true,
  isOpen,
  onClose,
  quoteTokenDecimals,
  quoteTokenSymbol,
  referencePrice,
  rwaAddress,
  useSimulatedOrders = true,
}) => {
  const isMobileViewport = useIsMobileViewport();
  const isMobile = isMobileViewport;
  const wrapperClassName = clsx(
    isMobile ? styles.mobileOverlay : styles.desktopWrapper,
    className
  );

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key={isMobile ? "mobile-order-book" : "desktop-order-book"}
          className={wrapperClassName}
          initial={isMobile ? { opacity: 0, x: "100%" } : { opacity: 0, width: 0, x: -32 }}
          animate={isMobile ? { opacity: 1, x: 0 } : { opacity: 1, width: 359, x: 0 }}
          exit={isMobile ? { opacity: 0, x: "100%" } : { opacity: 0, width: 0, x: -32 }}
          transition={PANEL_TRANSITION}
        >
          <section
            className={clsx(
              styles.panel,
              isMobile ? styles.mobilePanel : styles.desktopPanel
            )}
          >
            {isMobile && (
              <button
                type="button"
                aria-label={ORDER_BOOK_TOGGLE_LABELS.hide}
                className={styles.mobileCloseButton}
                onClick={onClose}
              >
                <CloseIcon className={styles.mobileCloseIcon} />
              </button>
            )}

            <div
              className={clsx(
                styles.panelInner,
                isMobile ? styles.mobilePanelInner : styles.desktopPanelInner
              )}
            >
              <OrderBookTable
                baseTokenDecimals={baseTokenDecimals}
                baseTokenSymbol={baseTokenSymbol}
                emptyMessage={emptyMessage}
                enabled={enabled}
                isMobile={isMobile}
                quoteTokenDecimals={quoteTokenDecimals}
                quoteTokenSymbol={quoteTokenSymbol}
                referencePrice={referencePrice}
                rwaAddress={rwaAddress}
                useSimulatedOrders={useSimulatedOrders}
              />
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
