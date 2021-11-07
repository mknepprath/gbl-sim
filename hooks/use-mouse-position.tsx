import { useState, useEffect } from "react";

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState<{
    buttons: number;
    x: number;
    y: number;
  }>({ buttons: 0, x: 0, y: 0 });

  const updateMousePosition = (ev: MouseEvent) => {
    setMousePosition({ buttons: ev.buttons, x: ev.clientX, y: ev.clientY });
  };

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition);

    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return mousePosition;
};

export default useMousePosition;
