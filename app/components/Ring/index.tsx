import { RingProgress } from "@mantine/core";

interface InputProps {
  value: number;
  maxValue: number;
  children: React.ReactNode;
}

const mapValue = (value: number, maxValue: number) => {
  return Math.floor((value / maxValue) * 100);
};

export const Ring = ({ value, maxValue, children }: InputProps) => {
  const mappedValue = mapValue(value, maxValue);

  return (
    <RingProgress
      size={150}
      thickness={6}
      roundCaps
      transitionDuration={250}
      sections={[{ value: mappedValue, color: "untappd" }]}
      label={children}
    />
  );
};
