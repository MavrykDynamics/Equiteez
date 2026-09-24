import { useState } from "react";

import { Container } from "~/lib/atoms/Container/Container";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";

import {
  RTransactionWidget,
  type RTransactionWidgetState,
} from "./RTransactionWidget";
import styles from "./RTransactionWidgetPreview.module.css";

const variants: { label: string; state: RTransactionWidgetState }[] = [
  { label: "Default / Step 1", state: { status: "progress", step: 1 } },
  { label: "Step 2", state: { status: "progress", step: 2 } },
  { label: "Step 3", state: { status: "progress", step: 3 } },
  { label: "Step 4", state: { status: "progress", step: 4 } },
  { label: "Success", state: { status: "success" } },
  {
    label: "Error",
    state: {
      status: "error",
      description:
        "The deposit has not completed. Review the transaction before trying again.",
    },
  },
  {
    label: "Warning",
    state: {
      status: "warning",
      description:
        "The transaction has been sent. Check its confirmation before starting another deposit.",
    },
  },
];

// TODO REMOVE: temporary manual widget preview; no transaction integration.
export function RTransactionWidgetPreview() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <section aria-label="Temporary widget preview" className={styles.panel}>
      <Container className={styles.content}>
        <RText size="body-sm" weight="medium">
          TODO REMOVE — Widget preview
        </RText>
        <div
          aria-label="Widget variants"
          className={styles.controls}
          role="group"
        >
          {variants.map(({ label }, index) => (
            <RButton
              key={label}
              aria-pressed={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
              size="small"
              tone="black"
              variant={selectedIndex === index ? "primary" : "secondary"}
            >
              {label}
            </RButton>
          ))}
        </div>
        <RTransactionWidget
          amount={1000}
          recipient="mv1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          state={variants[selectedIndex].state}
        />
      </Container>
    </section>
  );
}
