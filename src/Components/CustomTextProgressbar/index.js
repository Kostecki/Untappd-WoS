import { CircularProgressbar } from "react-circular-progressbar";

function CustomTextProgressbar(props) {
  const { children, ...otherProps } = props;

  return (
    <div
      style={{
        position: "relative",
        width: "145px",
        height: props.mobile ? "100px" : "145px",
      }}
    >
      <div style={{ position: "absolute" }}>
        <CircularProgressbar
          {...otherProps}
          styles={{ path: { stroke: "#ffc000" } }}
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
        {props.children}
      </div>
    </div>
  );
}

export default CustomTextProgressbar;
