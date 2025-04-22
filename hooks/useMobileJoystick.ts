import { useEffect } from "react";

export function useMobileJoystick(
  isMobile: boolean,
  joystickRef: any,
  joystickActive: boolean,
  setJoystickActive: Function,
  setJoystickPos: Function,
  setJoystickAngle: Function,
  setJoystickDistance: Function
) {
  useEffect(() => {
    if (!isMobile || !joystickRef.current) return;

    const joystickElement: any = joystickRef.current;
    const rect = joystickElement.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxDistance = rect.width / 2;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      setJoystickActive(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!joystickActive) return;
      e.preventDefault();

      const touch = e.touches[0];
      const x = touch.clientX - rect.left - centerX;
      const y = touch.clientY - rect.top - centerY;
      const distance = Math.min(Math.hypot(x, y), maxDistance);
      const angle = Math.atan2(y, x);
      const normalized = distance / maxDistance;

      setJoystickPos({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance });
      setJoystickAngle(angle);
      setJoystickDistance(normalized);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      setJoystickActive(false);
      setJoystickPos({ x: 0, y: 0 });
      setJoystickAngle(0);
      setJoystickDistance(0);
    };

    joystickElement.addEventListener("touchstart", handleTouchStart);
    joystickElement.addEventListener("touchmove", handleTouchMove);
    joystickElement.addEventListener("touchend", handleTouchEnd);

    return () => {
      joystickElement.removeEventListener("touchstart", handleTouchStart);
      joystickElement.removeEventListener("touchmove", handleTouchMove);
      joystickElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, joystickActive]);
}
