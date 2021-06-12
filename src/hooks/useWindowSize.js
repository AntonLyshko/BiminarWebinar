import { useEffect, useState } from "react";

function useWindowSize() {
  const isClient = typeof window === "object";

  function getSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);
  const [isMobile, setIsMobile] = useState();
  const [isTablet, setIsTablet] = useState();
  const [isDesktop, setDesktop] = useState();
  const [isVertical, setIsVertical] = useState();

  useEffect(() => {
    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  useEffect(() => {
    if (
      (windowSize.height > windowSize.width && windowSize.width < 500) ||
      (windowSize.width > windowSize.height && windowSize.width < 1024)
    ) {
      setIsMobile(true);
      setIsTablet(false);
      setDesktop(false);
    } else if (
      windowSize.height > windowSize.width &&
      windowSize.width <= 768
    ) {
      setIsMobile(false);
      setIsTablet(true);
      setDesktop(false);
    } else {
      setIsMobile(false);
      setIsTablet(false);
      setDesktop(true);
    }

    if (windowSize.height > windowSize.width) {
      setIsVertical(true);
    } else {
      setIsVertical(false);
    }
  }, [windowSize.width, windowSize.height]);

  return { ...windowSize, isMobile, isTablet, isDesktop, isVertical };
}

export default useWindowSize;
