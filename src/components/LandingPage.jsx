import { BookOpen, LogIn } from 'lucide-react'

export default function LandingPage({ onGoToCatalog, onGoToLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-sm">
        {/* Logo */}
        <img src="/logo-landing.png" alt="Studio Dancers" className="w-64 mx-auto mb-6 object-contain drop-shadow-lg" />
        <p className="text-white/70 text-sm mb-10">Escuela de Ballet en Guayaquil</p>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onGoToCatalog}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-white/80 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors text-base"
          >
            <BookOpen size={20} />
            Ver Cursos
          </button>
          <button
            onClick={onGoToLogin}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-purple-700 rounded-xl font-semibold hover:bg-white/90 transition-colors text-base shadow-lg"
          >
            <LogIn size={20} />
            Ingresar al Portal
          </button>
        </div>

        <p className="text-white/50 text-xs mt-8">
          Si tiene dudas, contacte al estudio.
        </p>
      </div>
    </div>
  )
}
