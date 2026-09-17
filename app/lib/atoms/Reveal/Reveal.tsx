import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

import {
  type MotionViewport,
  revealVariants,
  revealViewport,
  type RevealPreset,
} from "~/lib/animations/animations";

import styles from "./Reveal.module.css";

type RevealElement = "article" | "div" | "header" | "li" | "section" | "span";

export type RevealProps = Omit<
  HTMLMotionProps<"div">,
  "as" | "initial" | "variants" | "viewport" | "whileInView"
> & {
  as?: RevealElement;
  children: ReactNode;
  delay?: number;
  isDisabled?: boolean;
  preset?: RevealPreset;
  viewport?: MotionViewport;
};

function getMotionElement(as: RevealElement): typeof motion.div {
  switch (as) {
    case "article":
      return motion.article as typeof motion.div;
    case "header":
      return motion.header as typeof motion.div;
    case "li":
      return motion.li as typeof motion.div;
    case "section":
      return motion.section as typeof motion.div;
    case "span":
      return motion.span as typeof motion.div;
    case "div":
      return motion.div;
  }
}

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  isDisabled = false,
  preset = "rise",
  viewport = revealViewport,
  ...props
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const MotionElement = getMotionElement(as);
  const shouldAnimate = !isDisabled && !shouldReduceMotion;

  return (
    <MotionElement
      className={clsx(styles.reveal, className)}
      custom={delay}
      initial={shouldAnimate ? "hidden" : false}
      variants={revealVariants[preset]}
      viewport={viewport}
      whileInView={shouldAnimate ? "visible" : undefined}
      {...props}
    >
      {children}
    </MotionElement>
  );
}
