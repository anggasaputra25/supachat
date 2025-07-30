'use client';

import { useState, useEffect } from 'react';
import { Send, Sparkles, ArrowRight, Github } from 'lucide-react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br text-white overflow-hidden relative">

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 flex items-center justify-between min-h-screen flex-col lg:flex-row">
        <div className={`md:w-1/2 space-y-8 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-violet-400/30">
              <Sparkles className="w-4 h-4 text-violet-300" />
              <span className="text-sm text-violet-200">Next-Gen Chat Experience</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black leading-tight bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
              Welcome to{' '}
                <span className="text-violet-500 animate-pulse">
                  Supachat
                </span>
            </h1>
          </div>

          <p className="text-xl md:text-xl text-gray-300 leading-relaxed">
            Where conversations come alive! ⚡ Real-time messaging meets stunning design in a 
            <span className="text-violet-300 font-semibold"> Supabase </span>
            &
            <span className="text-purple-300 font-semibold"> Next.js </span>
            powered experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button className="group relative bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
              <span className="relative flex items-center gap-2">
                🚀 Start Chatting
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <a
              href="https://github.com/anggasaputra25/supachat"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 border-2 border-violet-400/50 px-8 py-4 rounded-2xl hover:bg-violet-500/10 hover:border-violet-400 transition-all duration-300 hover:scale-105"
            >
              <Github className="w-5 h-5" />
              <span className="font-semibold">View Source</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </a>
          </div>
        </div>

        {/* Hero Visual */}
        <div className={`md:w-1/2 mt-12 md:mt-0 transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
          <div className="relative">
            {/* Main Chat Interface Mockup */}
            <div className="rounded-xl p-6 bg-neutral-900">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-neutral-800 rounded-lg px-3 py-1 text-sm text-gray-400">
                  Angga • Online
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Chat Messages */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-sm font-bold">A</div>
                  <div className="bg-neutral-800 rounded-2xl rounded-tl-md px-4 py-2 max-w-xs">
                    <p className="text-sm">Hey! This app is amazing! 🔥</p>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <div className="bg-violet-600 rounded-2xl rounded-tr-md px-4 py-2 max-w-xs">
                    <p className="text-sm">I know right! Real-time is so smooth ⚡</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full flex items-center justify-center text-sm font-bold">Y</div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-sm font-bold">A</div>
                  <div className="bg-neutral-800 rounded-2xl rounded-tl-md px-4 py-2 max-w-xs animate-pulse flex justify-center items-center">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Input */}
              <div className="mt-4 flex gap-2">
                <div className="flex-1 bg-neutral-800 rounded-xl px-3 py-2 text-sm text-gray-400">
                  Type your message...
                </div>
                <button className="bg-neutral-800 p-2 rounded-xl hover:scale-110 transition-transform">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-violet-400 to-violet-700 p-3 rounded-full shadow-lg animate-bounce">
              ⚡
            </div>
            <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-violet-400 to-violet-700 p-3 rounded-full shadow-lg animate-pulse">
              💬
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">✨ Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-10 text-center">
          <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl shadow-md hover:scale-105 transition">
            <h3 className="text-xl font-semibold mb-2">💬 Real-Time Messaging</h3>
            <p className="text-gray-300">Send and receive messages instantly with Supabase Realtime.</p>
          </div>
          <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl shadow-md hover:scale-105 transition">
            <h3 className="text-xl font-semibold mb-2">🔐 Auth System</h3>
            <p className="text-gray-300">Secure login and signup using Supabase Auth (Email + OAuth).</p>
          </div>
          <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl shadow-md hover:scale-105 transition">
            <h3 className="text-xl font-semibold mb-2">📱 Responsive UI</h3>
            <p className="text-gray-300">Looks great on mobile, tablet, and desktop devices.</p>
          </div>
          <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl shadow-md hover:scale-105 transition">
            <h3 className="text-xl font-semibold mb-2">📤 Optimistic UI</h3>
            <p className="text-gray-300">Experience smooth message sending with loading states.</p>
          </div>
          <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl shadow-md hover:scale-105 transition">
            <h3 className="text-xl font-semibold mb-2">✅ Read Indicators</h3>
            <p className="text-gray-300">See which messages have been read for better context.</p>
          </div>
          <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl shadow-md hover:scale-105 transition">
            <h3 className="text-xl font-semibold mb-2">☁️ Deploy on Vercel</h3>
            <p className="text-gray-300">Ready to be deployed easily with Vercel integration.</p>
          </div>
        </div>
      </section>

      <footer className="text-center py-10 text-gray-400 border-t border-neutral-800">
        Made with ☕ by <a href="https://github.com/anggasaputra25" target="_blank" className="text-white underline">Angga</a>
      </footer>
    </main>
  );
}