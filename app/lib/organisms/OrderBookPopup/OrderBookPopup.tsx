import { FC, memo, useEffect, useState } from "react";

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

const DESKTOP_PANEL_WIDTH = 359;
const MOBILE_BREAKPOINT = 820;

export const ORDER_BOOK_TOGGLE_LABELS = {
  hide: "Hide Order Book",
  show: "Show Order Book",
} satisfies OrderBookToggleLabels;

type OrderBookPopupProps = {
  baseTokenDecimals: number;
  baseTokenSymbol: string;
  className?: string;
  desktopHeight?: number;
  emptyMessage?: string;
  enabled?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onPriceClick?: (price: number, side: "ask" | "bid") => void;
  quoteTokenDecimals: number;
  quoteTokenSymbol?: string;
  referencePrice?: number;
  rwaAddress?: string | null;
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

const OrderBookPopupComponent: FC<OrderBookPopupProps> = ({
  baseTokenDecimals,
  baseTokenSymbol,
  className,
  desktopHeight,
  emptyMessage,
  enabled = true,
  isOpen,
  onClose,
  onPriceClick,
  quoteTokenDecimals,
  quoteTokenSymbol,
  referencePrice,
  rwaAddress,
}) => {
  const isMobileViewport = useIsMobileViewport();
  const isMobile = isMobileViewport;
  const wrapperClassName = clsx(
    isMobile ? styles.mobileOverlay : styles.desktopWrapper,
    className
  );
  const desktopWrapperStyle = isMobile
    ? undefined
    : {
        flexBasis: isOpen ? DESKTOP_PANEL_WIDTH : 0,
        height: desktopHeight,
        width: isOpen ? DESKTOP_PANEL_WIDTH : 0,
      };
  const panel = (
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
          onPriceClick={onPriceClick}
          quoteTokenDecimals={quoteTokenDecimals}
          quoteTokenSymbol={quoteTokenSymbol}
          referencePrice={referencePrice}
          rwaAddress={rwaAddress}
        />
      </div>
    </section>
  );

  if (!isMobile) {
    return (
      <div className={wrapperClassName} style={desktopWrapperStyle}>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="desktop-order-book"
              className={styles.desktopPanelMotion}
              style={{ width: DESKTOP_PANEL_WIDTH }}
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={PANEL_TRANSITION}
            >
              {panel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="mobile-order-book"
          className={wrapperClassName}
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0, zIndex: -1 }}
          exit={{ opacity: 0, x: "100%", zIndex: -1 }}
          transition={PANEL_TRANSITION}
        >
          {panel}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const OrderBookPopup = memo(OrderBookPopupComponent);

OrderBookPopup.displayName = "OrderBookPopup";
