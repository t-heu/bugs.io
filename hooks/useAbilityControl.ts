import { useEffect } from "react";

export function useAbilityControl(player: any, useAbility: any) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // Verifica se a tecla 'e' foi pressionada
      if (key === "e" && player?.ability) {
        useAbility();  // Chama a função de usar habilidade
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "e") {
        // Caso precise fazer algo ao soltar a tecla, adicione aqui
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [player, useAbility]); // O useEffect é disparado sempre que player ou useAbility mudam
}
