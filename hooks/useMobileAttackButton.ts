import { useEffect } from "react";

export function useMobileAttackButton(isMobile: boolean, attackButtonRef: any, attackPressedRef: any) {
  useEffect(() => {
    if (!isMobile || !attackButtonRef.current) return;

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
  }, [isMobile]);
}
