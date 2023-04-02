import Image from "next/image";

import wosWheel from "@/public/wos.png";

import styles from "./Spinner.module.css";

type Props = {
  height?: number;
};

export default function Spinner({ height }: Props) {
  return (
    <Image
      src={wosWheel}
      alt="Spinner"
      className={styles.spinner}
      height={height}
    />
  );
}
