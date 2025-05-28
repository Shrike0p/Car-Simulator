import { useState, useEffect } from "react";

export function useKeyboard() {
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
    space: false,
    c: false,
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (key in keys) {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, [key]: true }));
      }
      if (event.key === "Shift") {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, shift: true }));
      }
      if (event.key === " ") {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, space: true }));
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (key in keys) {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, [key]: false }));
      }
      if (event.key === "Shift") {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, shift: false }));
      }
      if (event.key === " ") {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, space: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keys;
}
