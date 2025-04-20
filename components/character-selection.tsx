"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import {AntDrawing} from "@/app/insects/ant";
import {BeetleDrawing} from "@/app/insects/beetle"
import {CockroachDrawing} from "@/app/insects/cockroach"
import {LadybugDrawing} from "@/app/insects/ladybug"
import {SpiderDrawing} from "@/app/insects/spider"
import {WaspDrawing} from "@/app/insects/wasp"

export default function CharacterSelection({ onSelect, name, onName, characters }: any) {
  const [hoveredCharacter, setHoveredCharacter] = useState(null);
  
  function getStatBlocks(value: number, max: number, totalBlocks = 10): number {
    const ratio = value / max;
    return Math.round(Math.min(Math.max(ratio, 0), 1) * totalBlocks);
  }

  const renderInsectIcon = (type: any, isHovered: any) => {
    const color = isHovered ? "#4ade80" : "#22c55e"
    const strokeColor = isHovered ? "#ffffff" : "#15803d"

    if (type === "ant") {
      return (
        <AntDrawing fillColor={color} strokeColor={strokeColor} />
      )
    } else if (type === "spider") {
      return (
        <SpiderDrawing fillColor={color} strokeColor={strokeColor} />
      )
    } else if (type === "beetle") {
      return (
        <BeetleDrawing fillColor={color} strokeColor={strokeColor} />
      )
    } else if (type === "ladybug") {
      return (
        <LadybugDrawing fillColor={color} strokeColor={strokeColor} />
      )
    } else if (type === "wasp") {
      return (
        <WaspDrawing fillColor={color} strokeColor={strokeColor} />
      )
    } else if (type === "cockroach") {
      return (
        <CockroachDrawing fillColor={color} strokeColor={strokeColor} />
      )
    }      
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Escolha seu Inseto</h1>
      <input
        type="text"
        placeholder="Seu nome"
        value={name} onChange={(e) => onName(e.target.value)}
        className="mb-5 w-full p-2 border border-green-500 rounded-md bg-green-950/70 text-green-300"
      />

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
                            i < getStatBlocks(character.stats.speed, 15) ? "bg-green-500" : "bg-green-900"
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
                            i < getStatBlocks(character.stats.attack, 40) ? "bg-green-500" : "bg-green-900"
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
                            i < getStatBlocks(character.stats.health, 100) ? "bg-green-500" : "bg-green-900"
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
