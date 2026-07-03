import styles from "./styles.module.css";
import QRCode from "react-qr-code";
import React from "react";

export function QrCode({ address }: { address: string }) {
  return (
    <div className={styles.qrWrapper}>
      <QRCode
        value={address}
        size={148}
        bgColor="#ffffff"
        fgColor="#000000"
        style={{ borderRadius: 8 }}
      />
    </div>
  );
}
