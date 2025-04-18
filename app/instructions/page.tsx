import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function Instructions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-950 text-white p-4">
      <div className="max-w-3xl mx-auto py-8">
        <Link href="/">
          <Button variant="ghost" className="text-green-300 hover:text-white hover:bg-green-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mt-6 mb-8 text-center">Como Jogar</h1>

        <div className="space-y-8">
          <section className="bg-green-900/50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Objetivo</h2>
            <p>Colete migalhas e comida para crescer, torne-se o maior e mais forte inseto da arena!</p>
          </section>

          <section className="bg-green-900/50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Insetos</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-800/50 p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2 text-green-300">Formiga</h3>
                <p className="mb-2">Rápida e ágil</p>
                <ul className="list-disc list-inside text-sm">
                  <li>Alta velocidade</li>
                  <li>Ataque médio</li>
                  <li>Vida baixa</li>
                </ul>
              </div>
              <div className="bg-green-800/50 p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2 text-green-300">Aranha</h3>
                <p className="mb-2">Forte e agressiva</p>
                <ul className="list-disc list-inside text-sm">
                  <li>Velocidade média</li>
                  <li>Alto ataque</li>
                  <li>Vida média</li>
                </ul>
              </div>
              <div className="bg-green-800/50 p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2 text-green-300">Besouro</h3>
                <p className="mb-2">Resistente e durável</p>
                <ul className="list-disc list-inside text-sm">
                  <li>Velocidade baixa</li>
                  <li>Ataque médio</li>
                  <li>Alta vida</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-green-900/50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Controles</h2>
            <p className="mb-4">Use as teclas WASD ou as setas para mover seu inseto pela arena.</p>
            <p>Aproxime-se de outros insetos para atacá-los automaticamente.</p>
          </section>

          <section className="bg-green-900/50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Dicas</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Comece coletando comida para crescer antes de enfrentar outros insetos</li>
              <li>Cada tipo de inseto tem vantagens diferentes - use-as estrategicamente</li>
              <li>Fuja de insetos maiores até estar forte o suficiente</li>
              <li>Trabalhe em equipe com outros insetos do mesmo tipo</li>
            </ul>
          </section>
        </div>

        <div className="mt-10 text-center">
          <Link href="/game">
            <Button className="bg-green-600 hover:bg-green-500 px-8 py-6 text-lg">Começar a Jogar</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
