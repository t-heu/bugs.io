"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import { useMobile } from "@/hooks/use-mobile"
import { useKeyboardControls } from "@/hooks/useKeyboardControls"
import { useMobileAttackButton } from "@/hooks/useMobileAttackButton"
import { useMobileJoystick } from "@/hooks/useMobileJoystick"
import { useAbilityControl } from "@/hooks/useAbilityControl"
import { useMobileAbilityButton } from "@/hooks/useMobileAbilityButton"

import { database, ref, update, off, onValue, onChildChanged, get } from "@/api/firebase"
import { drawArenaBoundary, drawEntities, drawFood, drawGrid, drawPlayer, drawCactus } from "@/utils/draw"
import { generateFood } from "@/utils/food"
import { monitorConnectionStatus, exitPlayer } from "@/utils/monitorConnection"
import { ARENA_SIZE, VIEWPORT_SIZE, FOOD_VALUE_HEATH, FOOD_VALUE_SCORE } from "@/utils/gameConstants"

import { specialAttack, activateShield, activateSpeedBoost, applyPoisonEffect, healPlayer } from "@/utils/ability"

type HandleDeathOptions = {
  playerUid?: string;
  score?: number;
};

export default function GameArena({ setAssassin, onGameOver, roomKey, player, setPlayer }: any) {
  const canvasRef = useRef(null)
  const gameInitializedRef = useRef(false)
  const frameCountRef = useRef(0)
  const joystickRef = useRef(null)
  const attackButtonRef = useRef<HTMLDivElement | null>(null)
  const abilityButtonRef = useRef(null);
  const attackPressedRef = useRef(false);
  const lastAttackTimeRef = useRef<number>(0);
  const abilityCooldownsRef = useRef<{ [key: string]: number }>({});
  const activeEffectsRef = useRef<{ [key: string]: number }>({});
  const lastPoisonTickRef = useRef<{ [uid: string]: number }>({});

  const [food, setFood] = useState<any>([])
  const [cactus, setCactus] = useState<any>([])
  const [keys, setKeys] = useState({ up: false, down: false, left: false, right: false })
  const [gameRunning, setGameRunning] = useState(true)
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 })
  const [joystickActive, setJoystickActive] = useState(false)
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  const [joystickAngle, setJoystickAngle] = useState(0)
  const [joystickDistance, setJoystickDistance] = useState(0)
  const [debugInfo, setDebugInfo] = useState({ frameCount: 0, playersCount: 0, name: '' })
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])

  const isMobile = useMobile()
  useKeyboardControls(setKeys, attackPressedRef)
  useMobileAttackButton(isMobile, attackButtonRef, attackPressedRef)
  useMobileJoystick(isMobile,
    joystickRef,
    joystickActive,
    setJoystickActive,
    setJoystickPos,
    setJoystickAngle,
    setJoystickDistance
  );
  useAbilityControl(player, useAbility);
  useMobileAbilityButton(isMobile, abilityButtonRef, useAbility);
  
  // 🔁 Inicializa o jogo uma única vez
  useEffect(() => {
    if (gameInitializedRef.current) return
    gameInitializedRef.current = true
  
    const data = ref(database, `bugsio/rooms/${roomKey}`);
    get(data).then(snapshot => {
      const snapData = snapshot.val() || [];

      setCactus(snapData.cactus);
      setFood(snapData.food)
    });
  
  }, [])  

  // 🔁 Escuta tudo do jogador (atualiza todo objeto sempre que algo muda)
  useEffect(() => {
    if (!roomKey || !player?.uid) return;

    const playerRef = ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`);

    // 🔁 Escuta mudanças individuais nos campos
    const unsubscribe = onChildChanged(playerRef, (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      
      if (!key) return;

      // Atualiza só o campo alterado
      setPlayer((prevPlayer: any) => ({
        ...prevPlayer,
        [key]: value,
      }));
    });

    return () => {
      off(playerRef, "child_changed", unsubscribe);
    };
  }, [roomKey, player]);
  
  // Escuta outros jogadores
  useEffect(() => {
    if (!roomKey) return;
  
    const playersRef = ref(database, `bugsio/rooms/${roomKey}/players`);
  
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const playersData = snapshot.val() || {};
      let otherPlayers = Object.values(playersData).filter(
        (p: any) => p.uid !== player.uid
      );
  
      // Remove jogadores com saúde 0
      otherPlayers = otherPlayers.filter((p: any) => p.stats.health > 0);
  
      // Adia o setState para o final do ciclo de render
      setTimeout(() => {
        setOtherPlayers((prevState) => {
          if (JSON.stringify(prevState) !== JSON.stringify(otherPlayers)) {
            return otherPlayers;
          }
          return prevState;
        });
      }, 0);
    });
  
    return () => {
      off(playersRef, "value", unsubscribe);
    };
  }, [roomKey, player.uid]);  

  // update food
  useEffect(() => {
    if (!roomKey) return;
  
    const foodRef = ref(database, `bugsio/rooms/${roomKey}/food`);
    const unsubscribeChanged = onChildChanged(foodRef, (snapshot) => {
      const index = snapshot.key;
      const data = snapshot.val();
  
      setFood((prev: any) => {
        const updated = [...prev];
        updated[Number(index)] = data;
        return updated;
      });
    });
  
    return () => {
      off(foodRef, 'child_changed', unsubscribeChanged);
    };
  }, [roomKey]);
   
  // Game loop
  useEffect(() => {
    if (!gameRunning) return

    let animationFrameId: any
    let lastTime = 0

    const gameLoop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp
      //const deltaTime = (timestamp - lastTime) / 1000
      lastTime = timestamp

      frameCountRef.current += 1
      if (frameCountRef.current % 30 === 0) {
        // Atualizar a cada 30 frames
        setDebugInfo((prev) => ({
          ...prev,
          frameCount: frameCountRef.current,
          playersCount: otherPlayers.length,
          name: player.name
        }))
      }

      updateGame()
      renderGame()

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    animationFrameId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [gameRunning, player, food, keys, joystickActive, joystickAngle, joystickDistance])
  
  const handlePlayerDeath = ({
    playerUid,
    score = 0
  }: HandleDeathOptions) => {
    if (!playerUid) return;

    sessionStorage.setItem("score", String(score));
    setPlayer(null);
    setGameRunning(false);
    onGameOver?.(score);
    exitPlayer(roomKey, playerUid);
  };    

  const renderGame = () => {
    const canvas: HTMLCanvasElement | any = canvasRef.current
    if (!canvas) return
  
    const ctx = canvas.getContext("2d")
    if (!ctx) return
  
    const now = Date.now()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  
    drawGrid(ctx, canvas, viewportOffset)
    drawArenaBoundary(ctx, viewportOffset)
    drawEntities(ctx, food, (ctx, item) => drawFood(ctx, item, viewportOffset));
    drawEntities(ctx, cactus, (ctx, item) => drawCactus(ctx, item, viewportOffset));
    otherPlayers.forEach(p => {
      drawPlayer(ctx, p, now, viewportOffset, false)
    })
    drawPlayer(ctx, player, now, viewportOffset, true)
  }

  const updateGame = () => {
    if (!canvasRef.current) return;
    if (!player) return; // Proteção básica

    // Verificar efeitos temporários
    const nowEffect = Date.now();
    const isInvincible = activeEffectsRef.current["invincible"] && activeEffectsRef.current["invincible"] > nowEffect;
    const hasSpeedBoost = activeEffectsRef.current["speedBoost"] && activeEffectsRef.current["speedBoost"] > nowEffect;
  
    let speed = player.stats.speed;
    if (hasSpeedBoost) {
      speed *= player.ability.boost;
    }

    const { newX, newY } = updatePlayerPosition(speed);
  
    setViewportOffset({
      x: newX - VIEWPORT_SIZE / 2,
      y: newY - VIEWPORT_SIZE / 2,
    });
  
    // Colisão com comida
    handleFoodCollision(newX, newY, food, player);

    // ⚔️ Dano de cactu
    const {tookDamage, newHealth} = handleCactusCollision(newX, newY, cactus, player)
    if (tookDamage && !isInvincible) {
      if (newHealth === 0) {
        setAssassin("cactu");
        handlePlayerDeath({ playerUid: player.uid, score: player.score });
        return;
      }
  
      setPlayer((prev: any) => {
        if (!prev) return prev;
      
        const updated = {
          ...prev,
          stats: {
            ...prev.stats,
            health: newHealth,
          },
        };
      
        update(
          ref(database, `bugsio/rooms/${roomKey}/players/p${prev.uid}/stats`),
          { health: newHealth }
        );
      
        return updated;
      });      
    }   
  
    // ⚔️ Ataque com cooldown
    const now = Date.now();
    if (attackPressedRef.current && now - lastAttackTimeRef.current > 500) {
      lastAttackTimeRef.current = now;
  
      handlePlayerAttack(player, otherPlayers,
        // ✅ onPlayerDamaged
        (targetUID, newHealth) => {
          // Atualiza Firebase antes
          update(ref(database, `bugsio/rooms/${roomKey}/players/p${targetUID}/stats`), {
            health: newHealth,
          });

          // Atualiza localmente
          setOtherPlayers((prev) =>
            prev.map((p) =>
              p.uid === targetUID
                ? { ...p, stats: { ...p.stats, health: newHealth } }
                : p
            )
          );          
        },
  
        // ✅ onPlayerKills
        (playerUID, newScore) => {
          setPlayer((prev: any) => {
            const updated = { ...prev, score: newScore };
            update(ref(database, `bugsio/rooms/${roomKey}/players/p${playerUID}`), {
              score: newScore,
            });
            return updated;
          });
        }
      );
    }

    // 3. No seu updateGame() (game loop), dar dano de veneno a cada segundo:
    otherPlayers.forEach((target) => {
      if (target.poisonedUntil && target.poisonedUntil > Date.now()) {
        const lastTick = lastPoisonTickRef.current[target.uid] || 0;
        if (Date.now() - lastTick > 1000) {
          let poisonDamage = player.ability.poisonDamage;

          if (target.id === player.ability.specialBonusDamage.target) {
            const bonusPoisonDamage = player.ability.specialBonusDamage.bonusDamage || 0;
            poisonDamage += bonusPoisonDamage;
          }

          const newHealth = Math.max(0, target.stats.health - poisonDamage);


          update(ref(database, `bugsio/rooms/${roomKey}/players/p${target.uid}/stats`), {
            health: newHealth,
          });

          // Atualiza localmente também se quiser:
          setOtherPlayers((prev) =>
            prev.map((p) =>
              p.uid === target.uid
                ? { ...p, stats: { ...p.stats, health: newHealth } }
                : p
            )
          );

          lastPoisonTickRef.current[target.uid] = Date.now();
        }
      }
    });

    // ☠️ Verifica morte
    if (player.stats.health <= 0) {
      setAssassin(player.killer || '');
      handlePlayerDeath({ playerUid: player.uid, score: player.score });
      return;
    }
  
    // 🧭 Atualiza posição do player
    setPlayer((prev: any) => {
      if (!prev) return prev;
      const updatedPlayer = {
        ...prev,
        position: {
          ...prev.position,
          x: newX,
          y: newY,
        },
      };
    
      update(ref(database, `bugsio/rooms/${roomKey}/players/p${prev.uid}/position`), {
        x: newX,
        y: newY,
      });
    
      return updatedPlayer;
    });
  };
  
  function handlePlayerAttack(
    player: any,
    otherPlayers: any[],
    onPlayerDamaged: (uid: string, newHealth: number) => void,
    onPlayerKills: (uid: string, newScore: number) => void
  ) {
    const attackRange = 50;
    const damagedUIDs = new Set();
  
    otherPlayers.forEach((targetPlayer) => {
      const dist = Math.hypot(targetPlayer.position.x - player.position.x, targetPlayer.position.y - player.position.y);
      if (dist > attackRange) return;
  
      if (damagedUIDs.has(targetPlayer.uid)) return;

      // ⬇️⬇️⬇️ NOVO: Verificar se o targetPlayer está invencível
      if (targetPlayer.effects?.invincible && targetPlayer.effects.invincible > Date.now()) {
        return; // não causa dano se o alvo está invencível
      }

      damagedUIDs.add(targetPlayer.uid);
  
      const playerAttack = player.stats.attack * (player.size / 30);
      const damageToTarget = player.effects.specialAttack > Date.now() ? playerAttack * player.ability.damageMultiplier : playerAttack * 1.5;

      const newHealthTarget = Math.max(0, targetPlayer.stats.health - damageToTarget);
      onPlayerDamaged(targetPlayer.uid, newHealthTarget);

       // ⚡ AQUI: Se o jogador está com poisonNextAttack, aplica veneno no alvo
      if (player.poisonNextAttack) {
        // Marca veneno no alvo
        update(ref(database, `bugsio/rooms/${roomKey}/players/p${targetPlayer.uid}`), {
          poisonedUntil: Date.now() + 5000, // 5 segundos de veneno
        });

        // Cancela o poisonNextAttack para o jogador
        update(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`), {
          poisonNextAttack: false,
        });

        lastPoisonTickRef.current[targetPlayer.uid] = Date.now();
      }

      if (targetPlayer.name && newHealthTarget === 0) {
        update(ref(database, `bugsio/rooms/${roomKey}/players/p${targetPlayer.uid}`), {
          killer: `${player.name} - (${player.type})`,
        });
        const newScore = player.score + 15;
        onPlayerKills(player.uid, newScore);
      }
    });
  }

  function updatePlayerPosition(speed: any) {
    let dx = 0, dy = 0
  
    if (isMobile && joystickActive) {
      dx = Math.cos(joystickAngle) * joystickDistance * speed
      dy = Math.sin(joystickAngle) * joystickDistance * speed
    } else {
      if (keys.up) dy -= speed
      if (keys.down) dy += speed
      if (keys.left) dx -= speed
      if (keys.right) dx += speed
  
      if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.sqrt(2)
        dx *= factor
        dy *= factor
      }
    }
  
    const newX = Math.round(Math.max(0, Math.min(ARENA_SIZE, player.position.x + dx)))
    const newY = Math.round(Math.max(0, Math.min(ARENA_SIZE, player.position.y + dy)))
    return { newX, newY, dx, dy }
  }

  function handleCactusCollision(x: number, y: number, cactusList: any[], player: any) {
    let tookDamage = false
    let newHealth = player.stats.health;
    const now = Date.now()
  
    for (const cactus of cactusList) {
      // Calcular a distância entre o jogador e o cacto
      const dist = Math.hypot(x - cactus.x, y - cactus.y)
  
      //console.log(`Distância entre jogador e cacto: ${dist}`)
      //console.log(`Raio do jogador: ${player.size / 2}, Raio do cacto: ${cactus.size / 2}`)
  
      // Verifique se a distância entre o jogador e o cacto é menor que a soma dos raios
      if (dist < (player.size / 2 + cactus.size / 2)) {
        //console.log("Colisão detectada!")
        if (!cactus.lastHit || now - cactus.lastHit > 500) {
          cactus.lastHit = now
          newHealth = Math.max(0, player.stats.health - 5)
          tookDamage = true
        }
      }
    }
  
    return {tookDamage, newHealth}
  }    

  function handleFoodCollision(x: number, y: number, foodList: any[], player: any) {
    const updatedFood = [...foodList]
    let foodEaten = false

    for (let i = 0; i < updatedFood.length; i++) {
      const f = updatedFood[i];
      const dist = Math.hypot(x - f.x, y - f.y);
    
      if (dist < player.size / 2 + f.size / 2) {
        const newFood = generateFood(ARENA_SIZE);
        updatedFood[i] = newFood; // Substitui localmente
    
        // Atualiza só esse item no Firebase
        update(ref(database, `bugsio/rooms/${roomKey}/food/${i}`), newFood);
    
        const newHealth = Math.min(player.stats.health + FOOD_VALUE_HEATH, player.stats.maxHealth);
        const newScore = player.score + FOOD_VALUE_SCORE;
    
        setPlayer((prev: any) => ({
          ...prev,
          stats: {
            ...prev.stats,
            health: newHealth,
          },
          score: newScore,
        }));
        
        update(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`), {
          'stats/health': newHealth,
          score: newScore,
        });        
    
        foodEaten = true;
      }
    }
  }

  function useAbility() {
    if (!player?.ability) return;

    const now = Date.now();
    const abilityName = player.ability.name;
    const abilityCooldownMs = (player.ability.cooldown || 5) * 1000;

    const lastUsed = abilityCooldownsRef.current[abilityName] || 0;
    if (now < lastUsed) {
      return;
    }

    // Executa efeitos baseados no tipo
    switch (abilityName) {
      case "Special Attack":
        specialAttack(activeEffectsRef, roomKey, player);
        break;
      case "Hard Shell":
        activateShield(activeEffectsRef, roomKey, player);
        break;
      case "Speed Boost":
        activateSpeedBoost(activeEffectsRef, roomKey, player);
        break;
      case "Regeneration":
        healPlayer(roomKey, player, setPlayer);
        break;
      case "Poison":
        applyPoisonEffect(player.uid, roomKey);
        break;
      // adicione outros tipos conforme for criando mais habilidades
      default:
        break
    }

    // Coloca habilidade em cooldown
    abilityCooldownsRef.current[abilityName] = now + abilityCooldownMs;
  }
  
  const exitGame = () => {
    const confirmExit = window.confirm("Tem certeza que deseja sair da partida? Você ira perder sua pontuação atual.")
    if (confirmExit) {
      handlePlayerDeath({ playerUid: player.uid })
      setAssassin('')
    }
  }

  useEffect(() => monitorConnectionStatus(roomKey, player.uid), [player]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-green-950">
      {/* Game canvas */}
      <canvas
        ref={canvasRef}
        width={VIEWPORT_SIZE}
        height={VIEWPORT_SIZE}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-green-900/70 p-2 rounded-lg">
          <div className="text-sm text-green-300">Pontuação: {player.score}</div>
          <div className="text-sm text-green-300">Seu nome: {debugInfo.name}</div>
          <div className="text-sm text-green-300">Players On: {debugInfo.playersCount}</div>
        </div>

        <div className="w-1/3">
          <div className="text-xs text-green-300 mb-1">
            Vida: {Math.floor(player.stats.health)}/{player.stats.maxHealth}
          </div>
          <Progress
            value={(player.stats.health / player.stats.maxHealth) * 100}
            className={`h-2 ${
              (player.stats.health / player.stats.maxHealth) > 0.5
                ? "[&>div]:bg-white"
                : (player.stats.health / player.stats.maxHealth) > 0.25
                ? "[&>div]:bg-orange-500"
                : "[&>div]:bg-red-500"
            }`}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="text-green-300 hover:text-white hover:bg-green-800"
            onClick={() => exitGame()}            
          >
            Sair
          </Button>
        </div>
      </div>

      {/* Mobile controls */}
      {isMobile && (
        <div
          ref={joystickRef}
          className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-green-900/50 border-2 border-green-500"
        >
          <div
            className="absolute w-16 h-16 rounded-full bg-green-700 border-2 border-green-400"
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
              left: "calc(50% - 32px)",
              top: "calc(50% - 32px)",
            }}
          />
        </div>
      )}

      {isMobile && (
        <>
          <div ref={attackButtonRef} className="floating-button attack">
            ⚔️
          </div>
          <button ref={abilityButtonRef} className="floating-button special">⚡</button> 
        </>
      )}
    </div>
  )
}
