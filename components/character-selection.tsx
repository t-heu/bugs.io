"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const characters = [
  {
    id: "ant",
    name: "Formiga",
    description: "Rápida e ágil",
    stats: {
      speed: 7,      // Diminui um pouco a velocidade para não ser tão ágil
      attack: 5,     // Mantém o ataque equilibrado
      health: 6,     // Aumenta um pouco a resistência para balancear
    },
  },
  {
    id: "spider",
    name: "Aranha",
    description: "Forte e agressiva",
    stats: {
      speed: 5,      // Mantém a velocidade média
      attack: 7,     // Mantém o ataque forte
      health: 6,     // Diminui um pouco a resistência para não ser muito resistente
    },
  },
  {
    id: "beetle",
    name: "Besouro",
    description: "Resistente e durável",
    stats: {
      speed: 4,      // Aumenta um pouco a resistência para ser mais durável
      attack: 5,     // Mantém o ataque equilibrado
      health: 8,     // Aumenta a resistência para ser realmente durável
    },
  },
];

export default function CharacterSelection({ onSelect }: any) {
  const [hoveredCharacter, setHoveredCharacter] = useState(null)

  const renderInsectIcon = (type: any, isHovered: any) => {
    const color = isHovered ? "#4ade80" : "#22c55e"
    const strokeColor = isHovered ? "#ffffff" : "#15803d"

    if (type === "ant") {
      return (
        <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="60" rx="8" ry="12" fill={color} stroke={strokeColor} strokeWidth="2" />
          <ellipse cx="50" cy="45" rx="6" ry="8" fill={color} stroke={strokeColor} strokeWidth="2" />
          <ellipse cx="50" cy="30" rx="10" ry="12" fill={color} stroke={strokeColor} strokeWidth="2" />
          <path d="M46 65 Q35 80 40 85" stroke={strokeColor} strokeWidth="2" />
          <path d="M54 65 Q65 80 60 85" stroke={strokeColor} strokeWidth="2" />
          <path d="M42 60 L25 65" stroke={strokeColor} strokeWidth="2" />
          <path d="M44 50 L25 45" stroke={strokeColor} strokeWidth="2" />
          <path d="M40 35 L25 25" stroke={strokeColor} strokeWidth="2" />
          <path d="M58 60 L75 65" stroke={strokeColor} strokeWidth="2" />
          <path d="M56 50 L75 45" stroke={strokeColor} strokeWidth="2" />
          <path d="M60 35 L75 25" stroke={strokeColor} strokeWidth="2" />
        </svg>
      )
    } else if (type === "spider") {
      return (
        <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="50" rx="12" ry="12" fill={color} stroke={strokeColor} strokeWidth="2" />
          <ellipse cx="50" cy="70" rx="8" ry="8" fill={color} stroke={strokeColor} strokeWidth="2" />
          <circle cx="47" cy="68" r="2" fill="white" />
          <circle cx="53" cy="68" r="2" fill="white" />
          <path d="M40 50 Q25 35 15 45" stroke={strokeColor} strokeWidth="2" />
          <path d="M38 55 Q20 55 10 60" stroke={strokeColor} strokeWidth="2" />
          <path d="M38 60 Q20 70 10 75" stroke={strokeColor} strokeWidth="2" />
          <path d="M40 65 Q25 80 15 90" stroke={strokeColor} strokeWidth="2" />
          <path d="M60 50 Q75 35 85 45" stroke={strokeColor} strokeWidth="2" />
          <path d="M62 55 Q80 55 90 60" stroke={strokeColor} strokeWidth="2" />
          <path d="M62 60 Q80 70 90 75" stroke={strokeColor} strokeWidth="2" />
          <path d="M60 65 Q75 80 85 90" stroke={strokeColor} strokeWidth="2" />
        </svg>
      )
    } else if (type === "beetle") {
      return (
        <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="50" rx="20" ry="25" fill={color} stroke={strokeColor} strokeWidth="2" />
          <ellipse cx="50" cy="70" rx="8" ry="8" fill={color} stroke={strokeColor} strokeWidth="2" />
          <line x1="40" y1="50" x2="60" y2="50" stroke={strokeColor} strokeWidth="2" />
          <line x1="50" y1="30" x2="50" y2="65" stroke={strokeColor} strokeWidth="2" />
          <path d="M45 75 L35 85" stroke={strokeColor} strokeWidth="2" />
          <path d="M55 75 L65 85" stroke={strokeColor} strokeWidth="2" />
          <path d="M32 60 L20 65" stroke={strokeColor} strokeWidth="2" />
          <path d="M30 50 L15 45" stroke={strokeColor} strokeWidth="2" />
          <path d="M32 40 L20 30" stroke={strokeColor} strokeWidth="2" />
          <path d="M68 60 L80 65" stroke={strokeColor} strokeWidth="2" />
          <path d="M70 50 L85 45" stroke={strokeColor} strokeWidth="2" />
          <path d="M68 40 L80 30" stroke={strokeColor} strokeWidth="2" />
        </svg>
      )
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Escolha seu Inseto</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {characters.map((character: any) => {
          const isHovered = hoveredCharacter === character.id

          return (
            <Card
              key={character.id}
              className={`border-2 transition-all duration-300 ${
                isHovered ? "border-green-400 bg-green-900/50 transform scale-105" : "border-green-800 bg-green-950/70"
              }`}
              onMouseEnter={() => setHoveredCharacter(character.id)}
              onMouseLeave={() => setHoveredCharacter(null)}
            >
              <CardHeader>
                <div className="flex justify-center mb-2">{renderInsectIcon(character.id, isHovered)}</div>
                <CardTitle className="text-center text-xl">{character.name}</CardTitle>
                <CardDescription className="text-center text-green-300">{character.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Velocidade</span>
                    <div className="flex space-x-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-4 rounded-sm ${
                            i < character.stats.speed ? "bg-green-500" : "bg-green-900"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Ataque</span>
                    <div className="flex space-x-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-4 rounded-sm ${
                            i < character.stats.attack ? "bg-green-500" : "bg-green-900"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Vida</span>
                    <div className="flex space-x-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-4 rounded-sm ${
                            i < character.stats.health ? "bg-green-500" : "bg-green-900"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-green-600 hover:bg-green-500" onClick={() => onSelect(character)}>
                  Selecionar
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
