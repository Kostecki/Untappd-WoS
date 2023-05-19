import React, { useEffect, useRef } from "react";

import BarcodeScanner from "../Scanner";

import styles from "./ScannerComponent.module.css";

interface Props {
  onSuccess: (payload: Barcode) => void;
}

export default function ScannerComponent({ onSuccess }: Props) {
  const scannerRef = useRef(null);

  return (
    <div
      ref={scannerRef}
      style={{ position: "relative" }}
      className={styles.scannerContainer}
    >
      <canvas
        className="drawingBuffer"
        style={{
          position: "absolute",
          top: "0px",
        }}
        width="640"
        height="480"
      />
      <BarcodeScanner
        scannerRef={scannerRef}
        onDetected={(result: any) =>
          onSuccess({ value: result.code, type: result.format })
        }
      />
    </div>
  );
}
