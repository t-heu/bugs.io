export function generateFood(ARENA_SIZE: number) {
  return {
    x: Math.random() * ARENA_SIZE,
    y: Math.random() * ARENA_SIZE,
    size: 5 + Math.random() * 5,
    color: `hsl(${Math.random() * 60 + 80}, 70%, 50%)`,
  }
} 

// 🍏 Função utilitária para gerar comidas
export const generateInitialFood = (count: number, ARENA_SIZE: number) =>
  Array.from({ length: count }, () => generateFood(ARENA_SIZE))

