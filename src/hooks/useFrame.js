import { useEffect, useRef } from "react";

const useFrame = (callback, fps = 60, dependencies = []) => {
  const requestRef = useRef(null);
  const previousTimeRef = useRef(null);
  const callbackRef = useRef(callback);
  const frameInterval = useRef(1000 / fps); // milliseconds per frame

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const animate = (time) => {
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = time;
      }

      const deltaTime = time - previousTimeRef.current;

      // Only execute if enough time has passed since last frame
      if (deltaTime >= frameInterval.current) {
        callbackRef.current(deltaTime, time);
        // Update previous time, accounting for any excess time
        previousTimeRef.current = time - (deltaTime % frameInterval.current);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

export default useFrame;
