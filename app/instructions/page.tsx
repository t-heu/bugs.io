import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import insects from "../../insects.json";

export default function Instructions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-950 text-white p-4">
      <div className="max-w-3xl mx-auto py-8">
        <Link href="/">
          <button className="flex items-center text-green-300 hover:text-white hover:bg-green-800 rounded-md px-4 py-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </button>
        </Link>

        <h1 className="text-4xl font-bold mt-6 mb-8 text-center">Como Jogar</h1>

        <div className="space-y-8">
          <section className="bg-green-900/50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Objetivo</h2>
            <p>Lute contra outros jogadores em batalhas intensas, usando habilidades especiais e vantagens únicas de cada inseto. Colete folhas durante a partida para ganhar pontos e recuperar vida. Com os pontos acumulados, você pode desbloquear e comprar insetos mais fortes, evoluindo sua estratégia e dominando a arena!</p>
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
                  {info.ability && (
                    <>
                      <p className="mt-2">Habilidade: {info.ability.name}</p>
                      <p className="mt-2">Info.: {info.ability.description}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-green-900/50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Controles</h2>
            <p className="mb-2">Use as teclas WASD ou as setas para mover seu inseto pela arena.</p>
            <p>Use a tecla "SPACE" para atacar outros insetos/jogadores.</p>
            <p>Use a tecla "E" para ativar sua habilidade ESPECIAL.</p>
          </section>

          <section className="bg-green-900/50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Dicas</h2>
            <ul className="list-disc list-inside space-y-2">
            <li>Coma folinhas espalhadas para recuperar vida durante as batalhas e ganhar pontos.</li>
            <li>Cada inseto possui habilidades únicas — escolha com sabedoria e use-as estrategicamente.</li>
            <li>Evite confrontos desvantajosos e sempre tenha uma rota de fuga em mente.</li>
            <li>Colabore com outros insetos do mesmo tipo para enfrentar inimigos mais poderosos</li>
            <li>Atenção aos cactos pela arena — eles causam dano ao encostar!</li>
            </ul>
          </section>
        </div>

        <div className="mt-10 text-center">
          <Link href="/game">
            <button className="bg-green-600 hover:bg-green-500 px-8 py-3 text-lg text-[#111] rounded-md">
              Começar a Jogar
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
