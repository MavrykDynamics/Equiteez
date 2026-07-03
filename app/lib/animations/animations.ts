import type { HTMLMotionProps, Transition, Variants } from "framer-motion";

export const motionEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const motionDurations = {
  fast: 0.2,
  base: 0.36,
  reveal: 0.56,
  slow: 0.72,
} as const;

export type MotionViewport = NonNullable<HTMLMotionProps<"div">["viewport"]>;

export const revealViewport: MotionViewport = {
  amount: 0.24,
  margin: "0px 0px -12% 0px",
  once: true,
};

export type RevealPreset = "fade" | "image" | "rise" | "scale";

export function getRevealTransition(delay = 0): Transition {
  return {
    delay,
    duration: motionDurations.reveal,
    ease: motionEase,
  };
}

export function getMotionAwareScrollBehavior(
  shouldReduceMotion: boolean | null
): ScrollBehavior {
  return shouldReduceMotion ? "auto" : "smooth";
}

export const revealVariants: Record<RevealPreset, Variants> = {
  fade: {
    hidden: {
      opacity: 0,
    },
    visible: (delay = 0) => ({
      opacity: 1,
      transition: getRevealTransition(delay),
    }),
  },
  image: {
    hidden: {
      opacity: 0,
      scale: 0.985,
      y: 16,
    },
    visible: (delay = 0) => ({
      opacity: 1,
      scale: 1,
      transition: getRevealTransition(delay),
      y: 0,
    }),
  },
  rise: {
    hidden: {
      opacity: 0,
      scale: 0.98,
      y: 24,
    },
    visible: (delay = 0) => ({
      opacity: 1,
      scale: 1,
      transition: getRevealTransition(delay),
      y: 0,
    }),
  },
  scale: {
    hidden: {
      opacity: 0,
      scale: 0.98,
    },
    visible: (delay = 0) => ({
      opacity: 1,
      scale: 1,
      transition: getRevealTransition(delay),
    }),
  },
};
