"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import CharacterSelection from "@/components/character-selection"
import GameArena from "@/components/game-arena"

import { database, set, ref, update, get, child, push } from "@/api/firebase"
import generateRandomWord from "@/utils/generate-random-word"
import { generateInitialFood } from "@/utils/food"
import { generateInitialCactus } from "@/utils/cactus"
import { ARENA_SIZE, FOOD_COUNT, CACTUS_COUNT } from "@/utils/game-constants"

import { exitPlayer } from "@/utils/monitor-connection"

import insects from "../../insects.json"

export default function Game() {
  const [gameState, setGameState] = useState("selection") // selection, playing, gameOver
  const [score, setScore] = useState(0)
  const [roomKey, setRoomKey] = useState('')
  const [player, setPlayer] = useState<any>({})
  const [assassin, setAssassin] = useState('')
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const characters = insects;

  useEffect(() => {
    if (player && player.uid && gameState === "selection") {
      setGameState("playing");
    }
  }, [player]);

  const handleCharacterSelect = (character: any, scoreCurrent: number = 0) => {
    if (!name) return alert('Erro: Nome não fornecido');
  
    if (!(/^[a-zA-Z\s]*$/.test(name))) {
      return alert('Erro: Nome inválido');
    }

    setLoading(true)

    if (player.uid) {
      exitPlayer(roomKey, player.uid)
      setPlayer({})
      setAssassin('')
    }

    setScore(scoreCurrent)
    joinOrCreateRoom(name, character, scoreCurrent)
  }

  const handleGameOver = (finalScore: number) => {
    setGameState("gameOver")
    setLoading(false)
    setScore(finalScore)
  }

  const restartGame = () => {
    setGameState("selection")
    setLoading(false)
  }

  function createPlayer(roomKey: string, name: string, character: any, scoreCurrent: number) {
    try {
      const updates: any = {};
      const playersRef = ref(database, `bugsio/rooms/${roomKey}/players`);
      const newPlayerRef = push(playersRef);
      const nextPlayer = newPlayerRef.key;
  
      const playerData = {
        name,
        uid: nextPlayer,
        killer: '',
        position: {
          x: ARENA_SIZE / 2,
          y: ARENA_SIZE / 2,
        },
        size: 30,
        score: scoreCurrent,
        stats: {
          speed: character.stats.speed * 0.5,
          attack: character.stats.attack,
          health: character.stats.health,
          maxHealth: character.stats.health,
        },
        effects: {
          invincible: '',
          speedBoost: '',
          poisonedUntil: '',
          specialAttack: '',
          slow: ''
        },
        poisonNextAttack: false,
        type: character.id,
        ability: character.ability || null
      };

      setRoomKey(roomKey)
      setPlayer(playerData)
  
      if (nextPlayer) {
        updates[`bugsio/rooms/${roomKey}/players/p${nextPlayer}`] = playerData;
        update(ref(database), updates);
      }
    } catch (error) {
      setLoading(false)
      console.error('Erro ao criar jogador:', error);
    }
  }
  
  async function createGame(status: boolean, name: string, character: any, scoreCurrent: number) {
    try {
      if (status) {
        const roomKey = generateRandomWord(6);

        const initialFood = generateInitialFood(FOOD_COUNT, ARENA_SIZE)
        const cactusList = generateInitialCactus(CACTUS_COUNT, ARENA_SIZE)
  
        await set(ref(database, 'bugsio/rooms/' + roomKey), {
          gameInProgress: false,
          createdAt: Date.now(),
          food: initialFood,
          cactus: cactusList
        });
  
        createPlayer(roomKey, name, character, scoreCurrent);
      }
    } catch (e) {
      setLoading(false)
      console.error('Erro ao criar jogo:', e);
    }
  }
  
  function joinOrCreateRoom(name: string, character: any, scoreCurrent: number) {
    get(child(ref(database), 'bugsio/rooms')).then((snapshot: any) => {
      if (snapshot.exists()) {
        const rooms = snapshot.val();
        let foundRoom = false;
  
        Object.keys(rooms).some((roomKey) => {
          const room = rooms[roomKey];
          const playersObject = room.players || {};
          const numPlayers = Object.keys(playersObject).length;
  
          if (!room.gameInProgress && numPlayers < 8) {
            createPlayer(roomKey, name, character, scoreCurrent);
            foundRoom = true;
            return true;
          }
        });
  
        if (!foundRoom) {
          createGame(true, name, character, scoreCurrent);
        }
      } else {
        createGame(true, name, character, scoreCurrent);
      }
    }).catch((error: any) => {
      setLoading(false)
      console.error(`Erro ao buscar salas: ${error.message}`);
    });
  }  

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-950 text-white">
      {gameState === "selection" && (
        <div className="p-4">
          <Link href="/">
            <Button variant="ghost" className="text-green-300 hover:text-white hover:bg-green-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <CharacterSelection 
            characters={characters} 
            name={name} 
            onName={setName} 
            onSelect={handleCharacterSelect} 
            score={score} 
            loading={loading}
          />
        </div>
      )}

      {gameState === "playing" && player && roomKey && <GameArena setAssassin={setAssassin} onGameOver={handleGameOver} roomKey={roomKey} player={player} setPlayer={setPlayer} />}

      {gameState === "gameOver" && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-green-900/70 p-8 rounded-lg max-w-md w-full text-center">
            <h2 className="text-3xl font-bold mb-4">Fim de Jogo</h2>
            <p className="text-xl mb-6">{assassin ? `Você foi eliminado por ${assassin}!` : 'Você saiu!'}</p>
            <p className="text-xl mb-6">Sua pontuação: {score}</p>

            <div className="space-y-4">
              <Button onClick={restartGame} className="w-full bg-green-600 hover:bg-green-500">
                Jogar Novamente
              </Button>

              <Link href="/" className="block w-full">
                <Button variant="outline" className="w-full border-green-500 text-green-300 hover:bg-green-900/30">
                  Menu Principal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
