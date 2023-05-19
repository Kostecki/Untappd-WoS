import React, { useEffect, useRef } from "react";

import BarcodeScanner from "../Scanner";

import styles from "./ScannerComponent.module.css";

interface Props {
  paused: boolean;
  onSuccess: (payload: Barcode) => void;
}

export default function ScannerComponent({ paused, onSuccess }: Props) {
  const scannerRef = useRef(null);

  useEffect(() => {
    console.log("useEffect, paused", paused);
  }, [paused]);

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
      {!paused ? (
        <BarcodeScanner
          scannerRef={scannerRef}
          onDetected={(result: any) =>
            onSuccess({ value: result.code, type: result.format })
          }
        />
      ) : null}
    </div>
  );
}
