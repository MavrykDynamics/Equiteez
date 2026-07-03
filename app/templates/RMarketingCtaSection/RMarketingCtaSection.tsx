import clsx from "clsx";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import {
  RButton,
  type RButtonTone,
  type RButtonVariant,
} from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { Reveal } from "~/lib/atoms/Reveal";
import { RSectionHeader } from "~/lib/molecules/RSectionHeader";

import styles from "./RMarketingCtaSection.module.css";

type RMarketingCtaBaseAction = {
  disabled?: boolean;
  iconRight?: ReactNode;
  label: string;
  tone?: RButtonTone;
  variant?: RButtonVariant;
};

type RMarketingCtaAnchorAction = RMarketingCtaBaseAction & {
  href: string;
  rel?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  to?: never;
};

type RMarketingCtaLinkAction = RMarketingCtaBaseAction & {
  href?: never;
  to: string;
};

export type RMarketingCtaAction =
  | RMarketingCtaAnchorAction
  | RMarketingCtaLinkAction;

export type RMarketingCtaSectionProps = {
  className?: string;
  description: string;
  heading: string | string[];
  id?: string;
  primaryAction: RMarketingCtaAction;
  secondaryAction?: RMarketingCtaAction;
};

function isAnchorAction(
  action: RMarketingCtaAction
): action is RMarketingCtaAnchorAction {
  return "href" in action;
}

function RMarketingCtaButton({ action }: { action: RMarketingCtaAction }) {
  const iconRight =
    action.iconRight === undefined ? (
      <RIcon aria-hidden name="arrow-long-right" />
    ) : (
      action.iconRight
    );

  if (!isAnchorAction(action)) {
    return (
      <RButton
        as="link"
        disabled={action.disabled}
        iconRight={iconRight}
        to={action.to}
        tone={action.tone ?? "black"}
        variant={action.variant ?? "primary"}
      >
        {action.label}
      </RButton>
    );
  }

  return (
    <RButton
      as="a"
      disabled={action.disabled}
      href={action.href}
      iconRight={iconRight}
      rel={action.rel}
      target={action.target}
      tone={action.tone ?? "black"}
      variant={action.variant ?? "primary"}
    >
      {action.label}
    </RButton>
  );
}

export function RMarketingCtaSection({
  className,
  description,
  heading,
  id,
  primaryAction,
  secondaryAction,
}: RMarketingCtaSectionProps) {
  return (
    <section className={clsx(styles.section, className)} id={id}>
      <div className={styles.shell}>
        <Reveal className={styles.header}>
          <RSectionHeader
            align="center"
            description={description}
            heading={heading}
          />
        </Reveal>
        <Reveal className={styles.actions} delay={0.05}>
          <RMarketingCtaButton action={primaryAction} />
          {secondaryAction ? (
            <RMarketingCtaButton action={secondaryAction} />
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
