import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

import insects from "../../insects.json";

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
              {insects.map((info, i) => (
                <div key={i} className="bg-green-800/50 p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2 text-green-300">{info.name}</h3>
                <p className="mb-2">{info.description}</p>
                  <ul className="list-disc list-inside text-sm">
                    {info.attributes.map((att, i2) => (
                      <li key={i2}>{att}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-green-900/50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Controles</h2>
            <p className="mb-2">Use as teclas WASD ou as setas para mover seu inseto pela arena.</p>
            <p>Use a tecla "SPACE" para atacar outros insetos/jogadores.</p>
          </section>

          <section className="bg-green-900/50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Dicas</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Colete comidas para recuperar sua vida</li>
              <li>Cada tipo de inseto tem vantagens diferentes - use-as estrategicamente</li>
              <li>Fuja de insetos e bole estratégias</li>
              <li>Trabalhe em equipe com outros insetos do mesmo tipo se quiser enfrentar o mais forte</li>
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
