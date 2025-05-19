import React, { ReactNode } from 'react';
import Link from "next/link"

import { ArrowLeft } from "lucide-react"

interface CardProps {
  children: ReactNode;
  className?: string;
}
function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-[#111] border border-gray-700 rounded-md p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}
function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <header
      className={`flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 ${className}`}
    >
      {children}
    </header>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}
function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h2
      className={`text-xl font-semibold text-white flex items-center gap-2 ${className}`}
    >
      {children}
    </h2>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}
function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-gray-400 ${className}`}>{children}</p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}
function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`pt-2 ${className}`}>
      {children}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  className?: string;
}
function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full text-white select-none
      ${className}`}
    >
      {children}
    </span>
  );
}

export default function ChangelogPage() {
  const changelog = [
    {
      version: "v2.1.1",
      date: "18 de Maio, 2025",
      description: "Correções de bugs",
      changes: [
        { type: "fix", text: 'Resolvido bug onde o jogador parecia se mover com hesitação ("movimento themido").' },
        { type: "fix", text: "Corrigido problema onde o Host não atualizava imediatamente sua própria posição e vida após enviar atualização." }
      ],
    },
    {
      version: "v2.1.0",
      date: "14 de Maio, 2025",
      description: "Correções de bugs e pequenas integrações",
      changes: [
        { type: "fix", text: "Corrigido bug em que múltiplos jogadores não eram renderizados corretamente uns para os outros ao entrarem na sala." },
        { type: "fix", text: "Corrigido problema em que apenas o Host era notificado quando um Guest se desconectava, resultando em jogadores fantasmas para os demais." },
        { type: "fix", text: "Corrigido parcialmente o bug que fazia o jogador dar saltos involuntários ao atacar ou comer frutas." },
        { type: "new", text: "Adicionado limite máximo de jogadores por partida: 6 jogadores." },
      ],
    },
    {
      version: "v2.0.0",
      date: "10 de Maio, 2025",
      description: "Pequenas melhorias",
      changes: [
        { type: "remove", text: "Removido matchmaker random" },
        { type: "new", text: "Adicionado novo protocolo de comunicação" },
        { type: "new", text: "Adicionado novos insetos" },
        { type: "improvement", text: "Balanceamento nos insetos." },
      ],
    },
    {
      version: "v1.0.0",
      date: "20 de Abril, 2025",
      description: "Lançamento inicial",
      changes: [
        { type: "new", text: "Primeira versão pública do aplicativo" },
        { type: "new", text: "Funcionalidades básicas implementadas" },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-950 text-white p-4">
      <div className="max-w-3xl mx-auto py-8">
        <Link href="/">
          <button className="flex items-center text-green-300 hover:text-white hover:bg-green-800 rounded-md px-4 py-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </button>
        </Link>

        <div className="space-y-2 text-center mb-10">
          <h1 className="text-4xl font-bold mt-6 mb-2 text-center">Changelogs</h1>
          <p className="text-white">Histórico de atualizações e melhorias do nosso produto</p>
        </div>

        <div className="space-y-8">
          {changelog.map((release, index) => (
            <Card key={release.version} className="border-l-4 border-l-green-300">
              <CardHeader>
                <div>
                  <CardTitle>
                    {release.version}
                    {index === 0 && (
                      <Badge className="ml-2 bg-green-600 hover:bg-green-700">Mais recente</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{release.date}</CardDescription>
                </div>
                <p className="text-sm text-gray-400">{release.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {release.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {change.type === 'new' && (
                        <Badge className="mt-0.5 bg-blue-600 hover:bg-blue-700">Novo</Badge>
                      )}
                      {change.type === 'improvement' && (
                        <Badge className="mt-0.5 bg-purple-600 hover:bg-purple-700">Melhoria</Badge>
                      )}
                      {change.type === 'fix' && (
                        <Badge className="mt-0.5 bg-red-600 hover:bg-red-700">Correção</Badge>
                      )}
                      {change.type === 'remove' && (
                        <Badge className="mt-0.5 bg-red-400 hover:bg-red-500 text-red-900 font-bold">Removido</Badge>
                      )}
                      {change.type === 'update' && (
                        <Badge className="mt-0.5 bg-indigo-500 hover:bg-indigo-600 text-indigo-900 font-semibold">Ajuste</Badge>
                      )}
                      <span className="text-gray-200">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
