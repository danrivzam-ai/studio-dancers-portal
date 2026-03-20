import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Algo salio mal</h1>
          <p className="text-gray-500 text-sm mb-6">Ocurrio un error inesperado. Intenta recargar la pagina.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#6b2145] text-white rounded-xl font-semibold text-base hover:bg-[#551735] transition-colors"
          >
            Recargar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
