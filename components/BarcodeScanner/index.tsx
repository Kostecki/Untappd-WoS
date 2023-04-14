import { useEffect, useState } from "react";

import Image from "next/image";
import { useZxing } from "react-zxing";

import { Box } from "@mui/material";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

import focusBorder from "@/public/focusBorder.svg";
import styles from "./BarcodeScanner.module.css";

interface Props {
  paused: boolean;
  onSuccess: (payload: Barcode) => void;
}

const hints = new Map();
const formats = [
  BarcodeFormat.EAN_8,
  BarcodeFormat.EAN_13,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
];
hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

export default function BarcodeScanner({ paused, onSuccess }: Props) {
  const [deviceId, setDeviceId] = useState<undefined | string>(undefined);

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: "environment",
          width: { ideal: 4096 },
          height: { ideal: 2160 },
        },
      })
      .then((stream) => {
        const id = stream.getVideoTracks()[0].getSettings().deviceId;
        setDeviceId(id);
      })
      .catch((err) => console.error(err));
  };

  const getBarcodeType = (typeIndex: number) => {
    switch (typeIndex) {
      case 6:
      case 7:
        return "ean";

      case 14:
      case 15:
      case 16:
        return "upc";

      default:
        break;
    }
  };

  useEffect(() => {
    if (!deviceId) {
      getVideo();
    }
  }, [deviceId]);

  const { ref } = useZxing({
    deviceId,
    paused: !deviceId || paused,
    timeBetweenDecodingAttempts: 10,
    hints,
    constraints: {
      video: {
        facingMode: "environment",
        width: { ideal: 4096 },
        height: { ideal: 2160 },
      },
      audio: false,
    },
    onResult(result) {
      const value = result.getText();
      const type = getBarcodeType(result.getBarcodeFormat());

      if (type) {
        onSuccess({ value, type });
      }
    },
  });

  return (
    <Box sx={{ overflow: "hidden", height: 250, position: "relative" }}>
      <video ref={ref} muted playsInline />
      <Box className={styles.overlay}>
        <Image
          className={styles.image}
          src={focusBorder}
          fill={true}
          alt="crosshair"
        />
      </Box>
    </Box>
  );
}
