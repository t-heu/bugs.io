import { useEffect } from "react";

export function useKeyboardControls(player: any, setKeys: Function, attackPressedRef: any, useAbility: any) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Movimento
      if (key === "w" || e.key === "ArrowUp") setKeys((k: any) => ({ ...k, up: true }));
      if (key === "s" || e.key === "ArrowDown") setKeys((k: any) => ({ ...k, down: true }));
      if (key === "a" || e.key === "ArrowLeft") setKeys((k: any) => ({ ...k, left: true }));
      if (key === "d" || e.key === "ArrowRight") setKeys((k: any) => ({ ...k, right: true }));

      // Ataque
      if (e.code === "Space") attackPressedRef.current = true;

      // Habilidade
      if (key === "e" && player?.ability) {
        useAbility?.();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === "w" || e.key === "ArrowUp") setKeys((k: any) => ({ ...k, up: false }));
      if (key === "s" || e.key === "ArrowDown") setKeys((k: any) => ({ ...k, down: false }));
      if (key === "a" || e.key === "ArrowLeft") setKeys((k: any) => ({ ...k, left: false }));
      if (key === "d" || e.key === "ArrowRight") setKeys((k: any) => ({ ...k, right: false }));

      if (e.code === "Space") attackPressedRef.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [player, setKeys, attackPressedRef, useAbility]);
}
