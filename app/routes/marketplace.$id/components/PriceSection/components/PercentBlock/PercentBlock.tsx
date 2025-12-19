import React, { useState } from "react";
import styles from "./styles.module.css";

export function PercentBlock() {
  const [currentPercent, setCurrentPercent] = useState<string | number>("");

  return (
    <div className="flex items-center gap-[4px]">
      <button
        onClick={() => setCurrentPercent(5)}
        className={styles.percentButton}
      >
        -5%
      </button>
      <button
        onClick={() => setCurrentPercent(10)}
        className={styles.percentButton}
      >
        -10%
      </button>
      <input
        value={currentPercent}
        placeholder="0.00%"
        type="number"
        onChange={(e) => setCurrentPercent(e.target.value)}
        name="percent"
        className={styles.percentInput}
      />
    </div>
  );
}
