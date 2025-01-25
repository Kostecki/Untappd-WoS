import {
  Box,
  Flex,
  Loader,
  type ComboboxStore,
  ActionIcon,
} from "@mantine/core";
import { IconBulb, IconBulbOff } from "@tabler/icons-react";
import { BarcodeDetector, type BarcodeDetectorOptions } from "barcode-detector";
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
  const [loading, setLoading] = useState(true);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isTorchAvailable, setIsTorchAvailable] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const barcodeDetectorRef = useRef<BarcodeDetector | null>(null);
  const detectionComplete = useRef(false);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          videoCaptureOptions
        );
        const videoTrack = stream.getVideoTracks()[0];

        videoTrackRef.current = videoTrack;
        if (videoRef.current) videoRef.current.srcObject = stream;

        // Check if the torch feature is available
        const capabilities = (videoTrack.getCapabilities() as any) || {};
        setIsTorchAvailable(!!capabilities.torch);

        videoRef.current?.play().then(() => {
          setLoading(false);
          startBarcodeDetection();
        });
      } catch (error) {
        console.error("Error accessing camera:", error);
        setLoading(false);
      }
    };

    enableCamera();

    return () => {
      if (videoTrackRef.current) {
        // Turn off the torch before stopping the camera
        videoTrackRef.current
          .applyConstraints({ advanced: [{ torch: false }] } as any)
          .catch(console.error);
        videoTrackRef.current.stop();
      }
    };
  }, []);

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
            fetchDetailsHandler(undefined, parseInt(barcodes[0].rawValue));
            detectionComplete.current = true;
          }
        } catch (error) {
          console.error("Barcode detection failed:", error);
        }
      }

      if (!detectionComplete.current) requestAnimationFrame(detectBarcodes);
    };

    requestAnimationFrame(detectBarcodes);
  };

  const toggleFlash = async () => {
    const videoTrack = videoTrackRef.current;
    if (videoTrack) {
      try {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !isFlashOn }] as any,
        });

        setIsFlashOn((prev) => !prev);
      } catch (error) {
        console.error("Failed to toggle flash:", error);
      }
    }
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
          style={{ width: "100%", height: "auto", borderRadius: "8px" }}
        />

        <Flex
          align="center"
          justify="center"
          pos="absolute"
          left="50%"
          top="50%"
          w="100%"
          h="40%"
          style={{ transform: "translate(-50%, -50%)", pointerEvents: "none" }}
        >
          <img
            src="/focus-border.svg"
            alt="Focus Border"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Flex>

        {isTorchAvailable && (
          <Flex
            className="balls-flash"
            justify="flex-end"
            pos="absolute"
            w="100%"
            bottom="0"
          >
            <ActionIcon variant="subtle" onClick={toggleFlash} mb="md" mr="md">
              {isFlashOn ? (
                <IconBulbOff size={26} color="white" stroke={1.2} />
              ) : (
                <IconBulb size={26} color="white" stroke={1.2} />
              )}
            </ActionIcon>
          </Flex>
        )}
      </Box>
    </Box>
  );
};
