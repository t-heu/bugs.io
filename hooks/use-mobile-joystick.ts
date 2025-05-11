import { useEffect } from "react";

interface UseMobileControlsProps {
  isMobile: boolean;
  joystickRef: any;
  attackButtonRef: any;
  abilityButtonRef: any;
  attackPressedRef: any;
  useAbility: Function;
  setJoystickActive: Function;
  setJoystickPos: Function;
  setJoystickAngle: Function;
  setJoystickDistance: Function;
}

export function useMobileJoystick({
  isMobile,
  joystickRef,
  attackButtonRef,
  abilityButtonRef,
  attackPressedRef,
  useAbility,
  setJoystickActive,
  setJoystickPos,
  setJoystickAngle,
  setJoystickDistance,
}: UseMobileControlsProps) {
  useEffect(() => {
    if (!isMobile) return;

    // Joystick
    const joystickEl = joystickRef?.current;
    if (joystickEl) {
      const rect = joystickEl.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const maxDistance = rect.width / 2;

      const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        setJoystickActive(true);
      };

      const handleTouchMove = (e: TouchEvent) => {
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

      joystickEl.addEventListener("touchstart", handleTouchStart);
      joystickEl.addEventListener("touchmove", handleTouchMove);
      joystickEl.addEventListener("touchend", handleTouchEnd);

      return () => {
        joystickEl.removeEventListener("touchstart", handleTouchStart);
        joystickEl.removeEventListener("touchmove", handleTouchMove);
        joystickEl.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isMobile, joystickRef]);

  useEffect(() => {
    if (!isMobile || !attackButtonRef?.current) return;

    const btn = attackButtonRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      attackPressedRef.current = true;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      attackPressedRef.current = false;
    };

    btn.addEventListener("touchstart", handleTouchStart);
    btn.addEventListener("touchend", handleTouchEnd);

    return () => {
      btn.removeEventListener("touchstart", handleTouchStart);
      btn.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, attackButtonRef]);

  useEffect(() => {
    if (!isMobile || !abilityButtonRef?.current) return;

    const btn = abilityButtonRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      useAbility();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
    };

    btn.addEventListener("touchstart", handleTouchStart);
    btn.addEventListener("touchend", handleTouchEnd);

    return () => {
      btn.removeEventListener("touchstart", handleTouchStart);
      btn.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, abilityButtonRef, useAbility]);
}
