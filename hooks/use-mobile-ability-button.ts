import { useEffect } from "react";

export function useMobileAbilityButton(isMobile: boolean, abilityButtonRef: any, useAbility: Function) {
  useEffect(() => {
    if (!isMobile || !abilityButtonRef.current) return;

    const btn = abilityButtonRef.current;

    // Dispara a habilidade ao pressionar o botão
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      useAbility();  // Executa a habilidade
    };

    // Evita o disparo da habilidade caso o toque seja liberado antes
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
    };

    // Adiciona os eventos de touch
    btn.addEventListener("touchstart", handleTouchStart);
    btn.addEventListener("touchend", handleTouchEnd);

    return () => {
      // Remove os eventos ao desmontar o componente
      btn.removeEventListener("touchstart", handleTouchStart);
      btn.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, abilityButtonRef, useAbility]);
}
