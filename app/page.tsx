'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"

import AdBanner from "@/components/ad-banner"
import CookieConsent from "@/components/cookie-consent-banner"

export default function Home() {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null)

  // Verifica se o consentimento já foi armazenado no localStorage
  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    setHasConsented(consent === "true" ? true : consent === "false" ? false : null)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-800 to-green-950 text-white p-4">
      {hasConsented === true ? <AdBanner /> : 'ADS'}

      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">Bugs.io</h1>
        <p className="text-xl md:text-2xl text-green-200">Batalha de Insetos</p>

        <div className="flex flex-col items-center space-y-6 mt-8">
          <p className="text-lg max-w-md">Escolha seu inseto, colete comida, cresça e domine a arena!</p>

          <Link href="/game" className="w-full max-w-xs">
            <Button className="w-full h-14 text-lg bg-green-600 hover:bg-green-500">Jogar Agora</Button>
          </Link>

          <Link href="/instructions" className="w-full max-w-xs">
            <Button
              variant="outline"
              className="w-full h-14 text-lg border-green-500 text-green-300 hover:bg-green-900/30"
            >
              Como Jogar
            </Button>
          </Link>
        </div>
      </div>

      <CookieConsent />
    </div>
  )
}
