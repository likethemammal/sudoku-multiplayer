import { useState, useRef, useEffect, useMemo } from "react";

import { cva, cx } from "class-variance-authority";

import Tooltip from "@tippyjs/react";
import "react-tippy/dist/tippy.css";

const inputContainerStyles = cva("");

function Input({ tooltipProps, inputProps }) {
  const ref = useRef();

  return (
    <div className={inputContainerStyles()}>
      {/* <div className={inputBadgeStyles()}>{index}</div> */}
      <Tooltip
        // ref={tippyRef}
        {...tooltipProps}
        duration={[200, 100]}
        trigger="focusin"
        animation="fade"
        arrow={true}
        theme="light"
        interactive={true}
      >
        <input type="tel" maxLength="1" {...inputProps} />
      </Tooltip>
    </div>
  );
}

export default Input;
