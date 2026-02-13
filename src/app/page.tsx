"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

const FEATURED_POKEMON = [
  { id: 6, name: "Charizard" },
  { id: 150, name: "Mewtwo" },
  { id: 249, name: "Lugia" },
  { id: 384, name: "Rayquaza" },
  { id: 483, name: "Dialga" },
  { id: 484, name: "Palkia" },
];

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-yellow-300 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="flex justify-center gap-3 mb-8">
            {FEATURED_POKEMON.map((p) => (
              <div key={p.id} className="relative w-14 h-14 md:w-20 md:h-20 opacity-80 hover:opacity-100 hover:scale-110 transition-all">
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`}
                  alt={p.name}
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>
            ))}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Trade Pokemon
            <span className="block text-yellow-300">with Trainers</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            List the Pokemon you want and what you can offer. Find matching trainers and chat in real-time to arrange trades.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/traders">
                  <Button size="lg" variant="ghost" className="text-white border border-white/30 hover:bg-white/10">
                    Browse Traders
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Everything you need to trade
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-bold mb-2">Want & Offer Lists</h3>
              <p className="text-gray-600 text-sm">
                List Pokemon you&apos;re looking for and ones you can trade. Tag them as Shiny, Shadow, or Lucky.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold mb-2">Find Matches</h3>
              <p className="text-gray-600 text-sm">
                Browse other trainers and find someone who has what you need - and wants what you have.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-bold mb-2">Real-time Chat</h3>
              <p className="text-gray-600 text-sm">
                Message trainers directly to work out trade details, share friend codes, and coordinate meetups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pokemon GO Specific */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Built for Pokemon GO
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <span className="text-2xl">✦</span>
              <h3 className="font-semibold mt-2">Shiny Tracking</h3>
              <p className="text-sm text-gray-500 mt-1">Tag shinies on your lists</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <span className="text-2xl">🌑</span>
              <h3 className="font-semibold mt-2">Shadow Pokemon</h3>
              <p className="text-sm text-gray-500 mt-1">Track shadow variants</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <span className="text-2xl">⭐</span>
              <h3 className="font-semibold mt-2">Lucky Trades</h3>
              <p className="text-sm text-gray-500 mt-1">Flag lucky Pokemon</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <span className="text-2xl">💰</span>
              <h3 className="font-semibold mt-2">Stardust Costs</h3>
              <p className="text-sm text-gray-500 mt-1">View trade costs by friendship</p>
            </div>
          </div>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
              <p className="text-sm font-semibold text-blue-700">Team Mystic</p>
              <p className="text-xs text-blue-500 mt-1">Show your team pride</p>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
              <p className="text-sm font-semibold text-red-700">Team Valor</p>
              <p className="text-xs text-red-500 mt-1">Show your team pride</p>
            </div>
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 text-center">
              <p className="text-sm font-semibold text-yellow-700">Team Instinct</p>
              <p className="text-xs text-yellow-500 mt-1">Show your team pride</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to start trading?
          </h2>
          <p className="text-blue-100 mb-8">
            Join trainers already using PokeTrade to complete their Pokedex.
          </p>
          {!session && (
            <Link href="/auth/register">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8">
                Create Free Account
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>PokeTrade - A Pokemon GO Trading Community</p>
        <p className="mt-1 text-xs">Pokemon GO is a trademark of Niantic, Inc. This is a fan-made tool.</p>
      </footer>
    </div>
  );
}
