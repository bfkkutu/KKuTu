import React from "react";
import { Oval } from "react-loader-spinner";

import { useSpinnerStore } from "front/@global/Bayadere/spinner/Store";

export default function SpinnerManager() {
  const visible = useSpinnerStore((state) => state.visible);

  if (!visible) return null;
  return (
    <Oval
      height={80}
      width={80}
      color="#fff"
      ariaLabel="oval-loading"
      secondaryColor="#000"
      strokeWidth={3}
      strokeWidthSecondary={3}
      wrapperClass="spinner-wrapper"
      visible
    />
  );
}
