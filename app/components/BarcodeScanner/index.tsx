import { Box, Flex, Loader, type ComboboxStore } from "@mantine/core";
import {
  BarcodeDetector,
  type BarcodeDetectorOptions,
} from "barcode-detector/pure";
import { useEffect, useRef, useState } from "react";

interface InputProps {
  fetchDetailsHandler: (
    beers?: BeerStringSearchResponse[],
    barcode?: number,
    optionValue?: string,
    combobox?: ComboboxStore
  ) => Promise<void>;
}

const videoCaptureOptions = {
  audio: false,
  video: { facingMode: "environment" },
};

const scannerOptions: BarcodeDetectorOptions = {
  formats: ["ean_13"],
};

export const Barcode = ({ fetchDetailsHandler }: InputProps) => {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barcodeDetectorRef = useRef<BarcodeDetector | null>(null);
  const detectionComplete = useRef(false);

  useEffect(() => {
    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          videoCaptureOptions
        );
        setMediaStream(stream);
      } catch (error) {
        console.error("Error accessing camera:", error);
        setLoading(false);
      }
    };

    if (!mediaStream) {
      enableStream();
    }

    return () => {
      mediaStream?.getTracks().forEach((track) => track.stop());
    };
  }, [mediaStream]);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;

      const playVideo = () => {
        videoRef.current
          ?.play()
          .then(() => {
            setLoading(false);
            startBarcodeDetection();
          })
          .catch((error) => console.error("Error playing video:", error));
      };

      videoRef.current.addEventListener("loadedmetadata", playVideo);

      return () => {
        videoRef.current?.removeEventListener("loadedmetadata", playVideo);
      };
    }
  }, [mediaStream]);

  const startBarcodeDetection = () => {
    if (!("BarcodeDetector" in window)) {
      console.error("BarcodeDetector is not supported in this browser.");
      return;
    }

    barcodeDetectorRef.current = new BarcodeDetector(scannerOptions);

    const detectBarcodes = async () => {
      if (
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        barcodeDetectorRef.current &&
        !detectionComplete.current
      ) {
        try {
          const barcodes = await barcodeDetectorRef.current.detect(
            videoRef.current
          );
          if (barcodes.length > 0) {
            const barcodeValue = barcodes[0].rawValue;
            const barcode = parseInt(barcodeValue);
            fetchDetailsHandler(undefined, barcode);
            detectionComplete.current = true;
          }
        } catch (error) {
          console.error("Barcode detection failed:", error);
        }
      }

      if (!detectionComplete.current) {
        requestAnimationFrame(detectBarcodes);
      }
    };

    requestAnimationFrame(detectBarcodes);
  };

  return (
    <Box pos="relative" w="100%" h="auto">
      {loading && (
        <Flex justify="center" align="center" pos="absolute" inset="0">
          <Loader color="untappd" />
        </Flex>
      )}

      <Box pos="relative" w="100%" mx="auto">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
          }}
        />

        <Flex
          align="center"
          justify="center"
          pos="absolute"
          left="50%"
          top="50%"
          w="100%"
          h="70%"
          style={{
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          <img
            src="/focus-border.svg"
            alt="Focus Border"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </Flex>
      </Box>
    </Box>
  );
};
