"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import CharacterSelection from "@/components/character-selection"
import GameArena from "@/components/game-arena"

import { database, set, ref, update, get, child, push } from "@/api/firebase"
import generateRandomWord from "@/utils/generateRandomWord"

export default function Game() {
  const [gameState, setGameState] = useState("selection") // selection, playing, gameOver
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [score, setScore] = useState(0)

  const characters = [
    {
      id: "ant",
      name: "Formiga",
      description: "Rápida e ágil",
      stats: {
        speed: 9,      // Bem rápida
        attack: 4,     // Fraca ofensivamente
        health: 30,    // Frágil
      },
    },
    {
      id: "spider",
      name: "Aranha",
      description: "Forte e agressiva",
      stats: {
        speed: 6,      // Velocidade média
        attack: 15,    // Forte ofensivamente
        health: 50,    // Mediana em resistência
      },
    },
    {
      id: "beetle",
      name: "Besouro",
      description: "Resistente e durável",
      stats: {
        speed: 3,      // Lento
        attack: 6,     // Ataque ok
        health: 80,    // Muito resistente
      },
    },
  ];  

  const handleCharacterSelect = (character: any) => {
    if (!name) return alert('Error: Insira seu nome!')

    setSelectedCharacter(character)
    setGameState("playing")
  }

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore)
    setGameState("gameOver")
  }

  const restartGame = () => {
    setGameState("selection")
    setSelectedCharacter(null)
    setScore(0)
  }

  const [name, setName] = useState('');

  function createPlayer(roomKey: string, owner: boolean, name: string) {
    try {
      const updates: any = {};
      const playersRef = ref(database, `bugsio/rooms/${roomKey}/players`);
      const newPlayerRef = push(playersRef);
      const nextPlayer = newPlayerRef.key;

      updates[`bugsio/rooms/${roomKey}/players/p${nextPlayer}`] = {
        name,
        gameover: false,
        victory: false,
        uid: nextPlayer,
        active: true,
        ready: false,
        owner,
      };

      if (nextPlayer) {
        update(ref(database), updates);
      }
    } catch (error) {
      console.error('Erro ao criar jogador:', error);
    }
  }

  async function createGame(stauts: boolean) {
    try {
      if (stauts) {
        if (!name) {
          console.error('Erro ao criar jogo: Nome do jogador não fornecido');
          return alert('Erro ao criar jogo: Nome do jogador não fornecido');
        }

        if (!(/^[a-zA-Z\s]*$/.test(name))) {
          console.error('Erro ao criar jogo: Nome do jogador inválido');
          return alert('Erro ao criar jogo: Nome do jogador inválido');
        }

        const roomKey = generateRandomWord(6);

        await set(ref(database, 'bugsio/rooms/' + roomKey), {
          turn: 'p1',
          gameInProgress: false,
          selectedLetters: Array('-'),
          wordArray: Array('-'),
          selectedWord: { name: '', dica: '' }
        });

        console.info('Jogo criado com sucesso', { roomKey, playerName: name });
        createPlayer(roomKey, true, name);
      } else {
        console.log('Jogo criado com sucesso');
      }
    } catch (e) {
      console.error('Erro ao criar jogo:', e);
      console.log(e);
    }
  }

  function joinRoom() {
    get(child(ref(database), 'bugsio/rooms')).then((snapshot: any) => {
      if (snapshot.exists()) {
        const rooms = snapshot.val();
        let foundRoom = false;

        Object.keys(rooms).some((roomKey) => {
          const room = rooms[roomKey];
          const playersObject = room.players || {};
          const numPlayers = Object.keys(playersObject).length;

          if (!room.gameInProgress && numPlayers < 8) {
            createPlayer(roomKey, false, name);
            foundRoom = true;
            return true;
          }
        });

        if (!foundRoom) {
          createGame(true);
        }
      } else {
        createGame(true);
        return true;
      }
    }).catch((error: any) => {
      console.error(`Erro ao verificar as salas: ${error.message}`);
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

      {gameState === "playing" && <GameArena characters={characters} character={selectedCharacter} onGameOver={handleGameOver} />}

      {gameState === "gameOver" && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-green-900/70 p-8 rounded-lg max-w-md w-full text-center">
            <h2 className="text-3xl font-bold mb-4">Fim de Jogo</h2>
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
