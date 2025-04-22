export const generateInitialCactus = (count: number, ARENA_SIZE: number) => {
  const items = []
  for (let i = 0; i < count; i++) {
    items.push({
      x: Math.random() * ARENA_SIZE,
      y: Math.random() * ARENA_SIZE,
      width: 15 + Math.random() * 10,
      height: 40 + Math.random() * 20,
      color: `hsl(${Math.random() * 10 + 100}, 50%, 35%)`,
      size: 20 + Math.random() * 30,
    })
  }
  return items
}
