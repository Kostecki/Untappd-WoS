import { RingProgress } from "@mantine/core";
import { isMobile } from "~/utils";

interface InputProps {
  size: number;
  value: number;
  maxValue: number;
  children: React.ReactNode;
}

const mapValue = (value: number, maxValue: number) => {
  return Math.floor((value / maxValue) * 100);
};

export const Ring = ({ size, value, maxValue, children }: InputProps) => {
  const clampedSize = Math.min(Math.max(size, 100), 150);
  const mappedValue = mapValue(value, maxValue);
  const mobile = isMobile();

  return (
    <RingProgress
      size={clampedSize}
      thickness={mobile ? 3 : 5}
      transitionDuration={250}
      sections={[{ value: mappedValue, color: "untappd" }]}
      label={children}
    />
  );
};
