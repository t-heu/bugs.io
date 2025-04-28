"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { InsectType } from "@/utils/draw"

import {AntDrawing} from "@/app/insects/ant";
import {BeetleDrawing} from "@/app/insects/beetle"
import {CockroachDrawing} from "@/app/insects/cockroach"
import {LadybugDrawing} from "@/app/insects/ladybug"
import {SpiderDrawing} from "@/app/insects/spider"
import {WaspDrawing} from "@/app/insects/wasp"
import {ScorpionDrawing} from "@/app/insects/scorpion"
import {ButterflyDrawing} from "@/app/insects/butterfly"
import {MosquitoDrawing} from "@/app/insects/mosquito"
import {MantisDrawing} from "@/app/insects/mantis"
import {StickBugDrawing} from "@/app/insects/stick-bug"
import {CentipedeDrawing} from "@/app/insects/centipede"
import {CricketDrawing} from "@/app/insects/cricket"
import {DragonflyDrawing} from "@/app/insects/dragonfly"
import {CicadaDrawing} from "@/app/insects/cicada"
import {BeeDrawing} from "@/app/insects/bee"
import {WaterBugDrawing} from "@/app/insects/waterBug"
import {WormDrawing} from "@/app/insects/worm"
import {GrasshopperDrawing} from "@/app/insects/grasshopper"
import {MothDrawing} from "@/app/insects/moth"
import {FlyDrawing} from "@/app/insects/fly"
import {SnailDrawing} from "@/app/insects/snail"
import {CaterpillarDrawing} from "@/app/insects/caterpillar"
import {EarwigDrawing} from "@/app/insects/earwig"
import {MarimbondoDrawing} from "@/app/insects/marimbondo"
import {EmeraldWaspDrawing} from "@/app/insects/emerald-wasp"
import {TanajuraDrawing} from "@/app/insects/tanajura"
import {TermiteDrawing} from "@/app/insects/termite"
import {FireflyDrawing} from "@/app/insects/firefly"

const insectDrawingComponents: Record<InsectType, React.FC<{ fillColor: string, strokeColor: string }>> = {
  ant: AntDrawing,
  spider: SpiderDrawing,
  beetle: BeetleDrawing,
  ladybug: LadybugDrawing,
  wasp: WaspDrawing,
  cockroach: CockroachDrawing,
  scorpion: ScorpionDrawing,
  butterfly: ButterflyDrawing,
  mosquito: MosquitoDrawing,
  mantis: MantisDrawing,
  stick_bug: StickBugDrawing,
  centipede: CentipedeDrawing,
  cricket: CricketDrawing,
  dragonfly: DragonflyDrawing,
  worm: WormDrawing,
  cicada: CicadaDrawing,
  bee: BeeDrawing,
  grasshopper: GrasshopperDrawing,
  water_bug: WaterBugDrawing,
  moth: MothDrawing,
  fly: FlyDrawing,
  snail: SnailDrawing,
  caterpillar: CaterpillarDrawing,
  earwig: EarwigDrawing,
  marimbondo: MarimbondoDrawing,
  emeraldWasp: EmeraldWaspDrawing,
  tanajura: TanajuraDrawing,
  termite: TermiteDrawing,
  firefly: FireflyDrawing
};

export default function CharacterSelection({ onSelect, name, onName, characters }: any) {
  const [hoveredCharacter, setHoveredCharacter] = useState(null);
  const [score, setScore] = useState(0);

  function getStatBlocks(value: number, max: number, totalBlocks = 10): number {
    const ratio = value / max;
    return Math.round(Math.min(Math.max(ratio, 0), 1) * totalBlocks);
  }

  const renderInsectIcon = (type: InsectType, isHovered: any) => {
    const color = isHovered ? "#4ade80" : "#22c55e";
    const strokeColor = isHovered ? "#ffffff" : "#15803d";

    const InsectComponent = insectDrawingComponents[type];
    return InsectComponent ? (
      <InsectComponent fillColor={color} strokeColor={strokeColor} />
    ) : null;
  };

  useEffect(() => {
    const storedScore = sessionStorage.getItem("score");
    const parsedScore = parseInt(storedScore ?? "0", 10);
    const NewScore = isNaN(parsedScore) ? 0 : parsedScore;
    setScore(NewScore);
  },[])

  const getPower = (stats: { speed: number; attack: number; health: number }) => {
    return 0//(stats.speed * 0.5) + (stats.attack * 1.2) + (stats.health * 0.3);
  };
  
  const getRequiredScore = (power: number) => {
    if (power <= 25) return 0;
    if (power <= 30) return 200;
    if (power <= 35) return 500;
    if (power <= 42) return 800;
    if (power <= 46) return 1100;
    return 1400;
  };
  
  const charactersWithScore = characters.map((char: any) => {
    const power = getPower(char.stats);
    return {
      ...char,
      power,
      requiredScore: getRequiredScore(power)
    };
  });

  const availableCharacters = charactersWithScore.filter((char: any) => char.requiredScore <= score);
  const lockedCharacters = charactersWithScore.filter((char: any) => char.requiredScore > score); 

  const renderCharacterCard = (character: any, isLocked: boolean = false) => {
    const isHovered = hoveredCharacter === character.id;

    return (
      <Card
        key={character.id}
        className={`border-2 transition-all duration-300 ${
          isHovered && !isLocked
            ? "border-green-400 bg-green-900/50 transform scale-105"
            : "border-green-800 bg-green-950/70"
        } ${isLocked ? "opacity-40 pointer-events-none grayscale" : ""}`}
        onMouseEnter={() => setHoveredCharacter(character.id)}
        onMouseLeave={() => setHoveredCharacter(null)}
      >
        <CardHeader>
          <div className="flex justify-center mb-2">{renderInsectIcon(character.id, isHovered)}</div>
          <CardTitle className="text-center text-xl">{character.name}</CardTitle>
          <CardDescription className="text-center text-green-300">{character.description}</CardDescription>
          <CardDescription className="text-center text-green-300">{character.requiredScore === 0 ? 'Não requer pontuação' : `Pontuação minima: ${character.requiredScore}`}</CardDescription>
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
        {!isLocked && (
          <CardFooter>
            <Button className="w-full bg-green-600 hover:bg-green-500" onClick={() => onSelect(character)}>
              Selecionar
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-5">Escolha seu Inseto</h1>
      <p className="text-center text-green-300 mb-3">Pontuação atual: {score}</p>
      <input
        type="text"
        placeholder="Seu nome"
        value={name}
        onChange={(e) => onName(e.target.value)}
        className="mb-5 w-full p-2 border border-green-500 rounded-md bg-green-950/70 text-green-300"
      />

      <h2 className="text-xl font-semibold text-green-400 mb-4">Disponíveis</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {availableCharacters.map((character: any) => renderCharacterCard(character))}
      </div>

      <h2 className="text-xl font-semibold text-green-600 mb-4">Bloqueados</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {lockedCharacters.map((character: any) => renderCharacterCard(character, true))}
      </div>
    </div>
  );
}
