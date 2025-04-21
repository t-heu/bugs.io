"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import CharacterSelection from "@/components/character-selection"
import GameArena from "@/components/game-arena"

import { database, set, ref, update, get, child, push, onValue } from "@/api/firebase"
import generateRandomWord from "@/utils/generateRandomWord"

import insects from "../../insects.json"

export default function Game() {
  const [gameState, setGameState] = useState("selection") // selection, playing, gameOver
  const [score, setScore] = useState(0)
  const [roomKey, setRoomKey] = useState('')
  const [player, setPlayer] = useState<any>()
  const [assassin, setAssassin] = useState('')
  
  const characters = insects; 

  const handleCharacterSelect = (character: any) => {
    if (!name) return alert('Erro: Nome não fornecido');
  
    if (!(/^[a-zA-Z\s]*$/.test(name))) {
      return alert('Erro: Nome inválido');
    }

    joinOrCreateRoom(name, character)

    setGameState("playing")
  }

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore)
    const killedByRef = ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}/killer`);
    onValue(killedByRef, (snapshot) => {
      const killerName = snapshot.val();
      
      // Agora você pode usar essa informação em setAssassin
      if (killerName) {
        setAssassin(killerName);
        
      }
    }, { onlyOnce: true });
    setGameState("gameOver")
  }

  const restartGame = () => {
    setGameState("selection")
    setScore(0)
  }

  const [name, setName] = useState('');

  function createPlayer(roomKey: string, owner: boolean, name: string, character: any) {
    const ARENA_SIZE = 2000;
    
    try {
      const updates: any = {};
      const playersRef = ref(database, `bugsio/rooms/${roomKey}/players`);
      const newPlayerRef = push(playersRef);
      const nextPlayer = newPlayerRef.key;
  
      const playerData = {
        name,
        uid: nextPlayer,
        active: true,
        ready: false,
        killer: '',
        owner,
        x: ARENA_SIZE / 2,
        y: ARENA_SIZE / 2,
        size: 30,
        speed: character.stats.speed * 0.5,
        attack: character.stats.attack,
        health: character.stats.health * 10,
        maxHealth: character.stats.health * 10,
        score: 0,
        type: character.id,
        lastDamageTime: 0,
      };

      setRoomKey(roomKey)
      setPlayer(playerData)
  
      if (nextPlayer) {
        sessionStorage.setItem('uid', nextPlayer)
        updates[`bugsio/rooms/${roomKey}/players/p${nextPlayer}`] = playerData;
        update(ref(database), updates);
      }
    } catch (error) {
      console.error('Erro ao criar jogador:', error);
    }
  }
  
  async function createGame(status: boolean, name: string, character: any) {
    try {
      if (status) {
        const roomKey = generateRandomWord(6);
  
        await set(ref(database, 'bugsio/rooms/' + roomKey), {
          gameInProgress: false,
          createdAt: Date.now(),
        });
  
        console.info('Jogo criado:', { roomKey });
        createPlayer(roomKey, true, name, character);
      }
    } catch (e) {
      console.error('Erro ao criar jogo:', e);
    }
  }
  
  function joinOrCreateRoom(name: string, character: any) {
    get(child(ref(database), 'bugsio/rooms')).then((snapshot: any) => {
      if (snapshot.exists()) {
        const rooms = snapshot.val();
        let foundRoom = false;
  
        Object.keys(rooms).some((roomKey) => {
          const room = rooms[roomKey];
          const playersObject = room.players || {};
          const numPlayers = Object.keys(playersObject).length;
  
          if (!room.gameInProgress && numPlayers < 8) {
            createPlayer(roomKey, false, name, character);
            foundRoom = true;
            return true;
          }
        });
  
        if (!foundRoom) {
          createGame(true, name, character);
        }
      } else {
        createGame(true, name, character);
      }
    }).catch((error: any) => {
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
          <CharacterSelection characters={characters} name={name} onName={setName} onSelect={handleCharacterSelect} />
        </div>
      )}

      {gameState === "playing" && player && roomKey && <GameArena onGameOver={handleGameOver} roomKey={roomKey} player={player} setPlayer={setPlayer} />}

      {gameState === "gameOver" && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-green-900/70 p-8 rounded-lg max-w-md w-full text-center">
            <h2 className="text-3xl font-bold mb-4">Fim de Jogo</h2>
            <p className="text-xl mb-6">Você foi eliminado por {assassin}!</p>
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
