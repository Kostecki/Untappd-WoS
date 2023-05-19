import React, { useRef } from "react";

import Image from "next/image";
import { Box } from "@mui/material";

import ScannerLogic from "../ScannerLogic";
import focusBorder from "@/public/focusBorder.svg";
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
      <Box className={styles.overlay}>
        <Image
          className={styles.image}
          src={focusBorder}
          fill={true}
          alt="crosshair"
        />
      </Box>
      <ScannerLogic
        scannerRef={scannerRef}
        onDetected={(result: any) =>
          onSuccess({ value: result.code, type: result.format })
        }
      />
    </div>
  );
}
