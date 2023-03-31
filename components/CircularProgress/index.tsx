import { ReactNode } from "react";
import { useTheme } from "@mui/material";
import { CircularProgressbar } from "react-circular-progressbar";

interface Props {
  checkinsPerLevel: number;
  totalStyles: number;
  haveHadCount: number;
  mobile: boolean;
  children?: ReactNode;
}

export default function CircularProgress({
  checkinsPerLevel,
  totalStyles,
  haveHadCount,
  mobile,
  children,
}: Props) {
  const theme = useTheme();

  return (
    <div
      style={{
        position: "relative",
        width: "145px",
        height: mobile ? "100px" : "145px",
      }}
    >
      <div style={{ position: "absolute", height: "100%", width: "100%" }}>
        <CircularProgressbar
          strokeWidth={4}
          value={Math.floor(haveHadCount / checkinsPerLevel)}
          maxValue={Math.floor(totalStyles / checkinsPerLevel)}
          styles={{ path: { stroke: theme.palette.primary.main } }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
