import { useState, useRef, useEffect, useMemo } from "react";

import { cva, cx } from "class-variance-authority";

import Tooltip from "@tippyjs/react";
import "react-tippy/dist/tippy.css";

const inputContainerStyles = cva("");

import gsap from "gsap";

function Input({ tooltipProps, inputProps, succeeded, delay, className }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!succeeded) {
      return;
    }

    const flipAnimation = gsap.to(ref.current, {
      rotateY: `+=360`,
      duration: 0.6,
      ease: "power2.inOut",
      paused: true,
      clearProps: "all",
      delay,
    });

    flipAnimation.play();
  }, [succeeded]);

  return (
    <div ref={ref} className={className}>
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
        <input
          type="tel"
          maxLength="1"
          {...inputProps}
          style={{
            transitionDelay: succeeded ? `${delay * 1.6}s` : ``,
            ...inputProps.style,
          }}
        />
      </Tooltip>
    </div>
  );
}

export default Input;
