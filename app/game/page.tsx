"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import CharacterSelection from "@/components/character-selection"
import GameArena from "@/components/game-arena"

export default function Game() {
  const [gameState, setGameState] = useState("selection") // selection, playing, gameOver
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [score, setScore] = useState(0)

  const handleCharacterSelect = (character: any) => {
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
          <CharacterSelection onSelect={handleCharacterSelect} />
        </div>
      )}

      {gameState === "playing" && <GameArena character={selectedCharacter} onGameOver={handleGameOver} />}

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
