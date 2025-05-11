import { useEffect, useRef, useState } from "react";

import { specialAttack, activateShield, activateSpeedBoost, applyPoisonEffect, healPlayer, applySlow } from "@/utils/ability"

export function useAbilityLogic(player: any, setPlayer: any, broadcast: any) {
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0); // em milissegundos
  const abilityCooldownsRef = useRef<Record<string, number>>({});
  const activeEffectsRef = useRef<any>({}); // ajusta o tipo conforme seu jogo

  function useAbility() {
    if (!player?.ability) return;

    const now = Date.now();
    const { name: abilityName, cooldown = 5 } = player.ability;
    const cooldownMs = cooldown * 1000;
    const lastUsed = abilityCooldownsRef.current[abilityName] || 0;

    if (now < lastUsed) {
      setIsCooldown(true);
      setCooldownTime(lastUsed - now); // mostra o tempo restante
      return;
    }

    executeAbilityEffect(abilityName);
    abilityCooldownsRef.current[abilityName] = now + cooldownMs;
    setCooldownTime(cooldownMs);
    setIsCooldown(true);
  }

  function executeAbilityEffect(abilityName: string) {
    const abilityActions: Record<string, () => void> = {
      "Special Attack": () => specialAttack(activeEffectsRef, player, broadcast),
      "Hard Shell": () => activateShield(activeEffectsRef, player, broadcast),
      "Speed Boost": () => activateSpeedBoost(activeEffectsRef, player, broadcast),
      "Regeneration": () => healPlayer(player, setPlayer, broadcast),
      "Poison": () => applyPoisonEffect(player.uid, player, broadcast),
      "Slow Strike": () => applySlow(activeEffectsRef, player, broadcast),
    };

    const action = abilityActions[abilityName];
    if (action) action();
  }

  // ✅ Este useEffect atualiza o tempo visual da barra de cooldown
  useEffect(() => {
    if (!isCooldown || cooldownTime <= 0) return;

    const interval = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 100) {
          clearInterval(interval);
          setIsCooldown(false);
          return 0;
        }
        return prev - 100;
      });
    }, 100); // Atualiza a cada 100ms para suavidade visual

    return () => clearInterval(interval);
  }, [isCooldown, cooldownTime]);

  return { useAbility, isCooldown, cooldownTime };
}
