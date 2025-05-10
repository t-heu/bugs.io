"use client"

import { useState, useEffect, useRef } from "react";

import {InsectDrawing} from "@/app/insects/insect-drawing";
import { insectDrawingComponents, InsectType } from "@/app/insects";

export default function CharacterSelection({ onSelect, name, onName, characters, score, loading }: any) {
  const [hoveredCharacter, setHoveredCharacter] = useState(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  function getStatBlocks(value: number, max: number, totalBlocks = 10): number {
    const ratio = value / max;
    return Math.round(Math.min(Math.max(ratio, 0), 1) * totalBlocks);
  }

  const renderInsectIcon = (type: InsectType, isHovered: any) => {
    const color = isHovered ? "#4ade80" : "#22c55e";
    const strokeColor = isHovered ? "#ffffff" : "#15803d";

    const drawInsect = insectDrawingComponents[type];
    return drawInsect ? (
      <InsectDrawing draw={drawInsect} fillColor={color} strokeColor={strokeColor} />
    ) : null;
  };

  const availableCharacters = characters.filter((char: any) => char.requiredScore <= score);
  const lockedCharacters = characters.filter((char: any) => char.requiredScore > score);

  const renderCharacterCard = (character: any, isLocked: boolean = false) => {
    const isHovered = hoveredCharacter === character.id;

    return (
      <div
        key={character.id}
        className={`border-2 rounded-xl p-6 transition-all duration-300 select-none
          ${isHovered && !isLocked ? "border-green-400 bg-green-900/50 scale-105" : "border-green-800 bg-green-950/70"}
          ${isLocked ? "opacity-40 pointer-events-none grayscale" : ""}
        `}
        onMouseEnter={() => setHoveredCharacter(character.id)}
        onMouseLeave={() => setHoveredCharacter(null)}
      >
        <div className="flex flex-col items-center mb-5">
          <div className="mb-2">{renderInsectIcon(character.id, isHovered)}</div>
          <h3 className="text-xl font-semibold text-center text-white mb-2">{character.name}</h3>
          <p className="text-sm text-center text-green-300 mb-2">{character.description}</p>
          <p className="text-sm text-center text-green-300 mb-2">
            {character.requiredScore === 0
              ? "Não requer pontuação"
              : `Pontuação mínima: ${character.requiredScore}`}
          </p>
        </div>

        <div className="space-y-3 text-sm text-white">
          <div className="flex justify-between items-center">
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
          <div className="flex justify-between items-center">
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
          <div className="flex justify-between items-center">
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

        {!isLocked && (
          <div className="mt-4">
            <button
              className="w-full py-2 bg-green-600 hover:bg-green-500 text-[#111] rounded-md transition"
              onClick={() => onSelect(character, score - character.requiredScore)}
              disabled={loading}
            >
              Selecionar
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-5">Escolha seu Inseto</h1>
      <p className="text-center text-green-300 mb-3">Pontuação atual: {score}</p>
      <input
        type="text"
        placeholder="Seu nome"
        ref={inputRef}
        value={name}
        onChange={(e) => onName(e.target.value)}
        className="mb-5 w-full p-2 border border-green-500 rounded-md bg-green-950/70 text-green-300 placeholder-green-400"
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
