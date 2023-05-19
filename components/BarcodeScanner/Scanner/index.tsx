import { useCallback, useEffect } from "react";
import Quagga from "@ericblade/quagga2";

interface Props {
  onDetected: any;
  scannerRef: any;
  onScannerReady?: any;
  cameraId?: string;
  facingMode?: string;
  constraints?: any;
  locator?: any;
  numOfWorkers?: number;
  decoders?: any;
  locate?: boolean;
}

function getMedian(arr: any) {
  arr.sort((a: any, b: any) => a - b);
  const half = Math.floor(arr.length / 2);
  if (arr.length % 2 === 1) {
    return arr[half];
  }
  return (arr[half - 1] + arr[half]) / 2;
}

function getMedianOfCodeErrors(decodedCodes: any) {
  const errors = decodedCodes
    .filter((x: any) => x.error !== undefined)
    .map((x: any) => x.error);
  const medianOfErrors = getMedian(errors);
  return medianOfErrors;
}

const defaultConstraints = {
  width: { min: 640, ideal: 1920, max: 4096 },
  height: { min: 480, ideal: 1080, max: 2400 },
};

const defaultLocatorSettings = {
  patchSize: "large",
  halfSample: true,
  willReadFrequently: true,
};

const defaultDecoders = ["ean_reader"];

export default function BarcodeScanner({
  onDetected,
  scannerRef,
  onScannerReady,
  cameraId,
  facingMode,
  constraints = defaultConstraints,
  locator = defaultLocatorSettings,
  numOfWorkers = 0,
  decoders = defaultDecoders,
  locate = true,
}: Props) {
  const errorCheck = useCallback(
    (result: any) => {
      if (!onDetected) {
        return;
      }
      const err = getMedianOfCodeErrors(result.codeResult.decodedCodes);
      // if Quagga is at least 90% certain that it read correctly, then accept the code.
      if (err < 0.1) {
        onDetected(result.codeResult);
      }
    },
    [onDetected]
  );

  useEffect(
    () => {
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            constraints: {
              ...constraints,
              ...(cameraId && { deviceId: cameraId }),
              ...(!cameraId && { facingMode }),
            },
            target: scannerRef.current,
            willReadFrequently: true,
          },
          locator,
          numOfWorkers,
          decoder: { readers: decoders },
          locate,
        },
        (err) => {
          if (err) {
            return console.log("Error starting Quagga:", err);
          }
          if (scannerRef && scannerRef.current) {
            Quagga.start();
            if (onScannerReady) {
              onScannerReady();
            }
          }
        }
      );
      Quagga.onDetected(errorCheck);
      return () => {
        Quagga.offDetected(errorCheck);
        Quagga.stop();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cameraId,
      onDetected,
      onScannerReady,
      scannerRef,
      errorCheck,
      constraints,
      locator,
      decoders,
      locate,
    ]
  );
  return null;
}
