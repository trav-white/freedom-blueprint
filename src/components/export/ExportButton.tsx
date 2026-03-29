'use client'

import { useState } from 'react'
import { useSessionStore } from '@/store/sessionStore'

export function ExportButton() {
  const completedAnswers = useSessionStore((s) => s.completedAnswers)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const hasContent = Object.keys(completedAnswers).some(
    (k) => !k.endsWith('_scores') && !k.endsWith('_responses') && completedAnswers[k]
  )

  if (!hasContent) return null

  async function handleExport() {
    setGenerating(true)
    setError('')
    try {
      const [{ pdf }, { BlueprintPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./BlueprintPDF'),
      ])
      const blob = await pdf(<BlueprintPDF completedAnswers={completedAnswers} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `freedom-blueprint-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF export failed:', err)
      setError('PDF generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleExport}
        disabled={generating}
        className="h-9 px-5 rounded-lg text-xs font-medium text-white/50 hover:text-white/80 transition-all duration-200 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080f1a]"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {generating ? 'Generating...' : 'Export PDF'}
      </button>
      {error && (
        <div className="absolute top-full right-0 mt-2 px-3 py-2 rounded-lg text-xs text-red-300 whitespace-nowrap" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}
    </div>
  )
}
