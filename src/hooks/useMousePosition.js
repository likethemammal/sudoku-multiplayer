import { useEffect, useRef } from "react";

const useMousePosition = () => {
  const positionRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const updateMousePosition = (e) => {
      // Update the ref value directly
      positionRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const onFrame = () => {
      // Schedule the next frame
      rafRef.current = requestAnimationFrame(onFrame);
    };

    // Start the animation frame loop
    rafRef.current = requestAnimationFrame(onFrame);

    // Add mouse move listener
    window.addEventListener("mousemove", updateMousePosition);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return positionRef;
};

export default useMousePosition;
