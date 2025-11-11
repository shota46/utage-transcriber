'use client'

import { useState } from 'react'

export default function Home() {
  const [utageUrl, setUtageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [directVideoUrl, setDirectVideoUrl] = useState('')
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'input' | 'detected' | 'transcribing' | 'completed'>('input')
  const [inputMode, setInputMode] = useState<'auto' | 'manual'>('auto')

  const handleDetectVideo = async () => {
    if (!utageUrl.trim()) {
      setError('URLを入力してください')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/extract-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageUrl: utageUrl })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || '動画の検出に失敗しました')
        setLoading(false)
        return
      }

      setVideoUrl(data.videoUrl)
      setStep('detected')
      setLoading(false)
    } catch (err) {
      setError('動画の検出に失敗しました')
      setLoading(false)
    }
  }

  const handleTranscribe = async () => {
    setLoading(true)
    setError('')
    setStep('transcribing')

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || '文字起こしに失敗しました')
        setLoading(false)
        setStep('detected')
        return
      }

      setTranscript(data.text)
      setStep('completed')
      setLoading(false)
    } catch (err) {
      setError('文字起こしに失敗しました')
      setLoading(false)
      setStep('detected')
    }
  }

  const handleSummarize = async () => {
    setSummaryLoading(true)
    setError('')

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || '要約に失敗しました')
        setSummaryLoading(false)
        return
      }

      setSummary(data.summary)
      setSummaryLoading(false)
    } catch (err) {
      setError('要約に失敗しました')
      setSummaryLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    alert(`${type}をコピーしました！`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-500/10 to-transparent animate-pulse-slow"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block relative mb-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              UTAGE TRANSCRIBER
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-lg blur opacity-30 animate-pulse"></div>
          </div>
          <p className="text-cyan-300 text-lg font-light tracking-wide">
            AI-POWERED TRANSCRIPTION SYSTEM
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse delay-75"></div>
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-pulse delay-150"></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-cyan-500/30 relative overflow-hidden">
          {/* Glow effects */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-75"></div>

          {/* Input Mode Toggle */}
          {step === 'input' && (
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setInputMode('auto')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  inputMode === 'auto'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                }`}
              >
                <span className="text-sm">🔍</span> 自動検出
              </button>
              <button
                onClick={() => setInputMode('manual')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  inputMode === 'manual'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                }`}
              >
                <span className="text-sm">⚡</span> 動画URL直接入力
              </button>
            </div>
          )}

          {/* Step 1: URL Input */}
          {step === 'input' && inputMode === 'auto' && (
            <>
              <div className="mb-6 relative">
                <label htmlFor="utage-url" className="block text-sm font-medium text-cyan-300 mb-2 tracking-wide">
                  <span className="text-cyan-400">▸</span> UTAGEページのURLを入力
                </label>
                <div className="relative">
                  <input
                    id="utage-url"
                    type="text"
                    value={utageUrl}
                    onChange={(e) => setUtageUrl(e.target.value)}
                    placeholder="https://utage-system.com/p/..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all backdrop-blur-sm"
                    disabled={loading}
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur-sm"></div>
                </div>
              </div>
              <button
                onClick={handleDetectVideo}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    動画を検出中...
                  </span>
                ) : (
                  '🚀 動画を検出'
                )}
              </button>
            </>
          )}

          {/* Manual Video URL Input */}
          {step === 'input' && inputMode === 'manual' && (
            <>
              <div className="mb-6 relative">
                <label htmlFor="direct-video-url" className="block text-sm font-medium text-purple-300 mb-2 tracking-wide">
                  <span className="text-purple-400">▸</span> 動画URL（m3u8）を入力
                </label>
                <div className="relative">
                  <input
                    id="direct-video-url"
                    type="text"
                    value={directVideoUrl}
                    onChange={(e) => setDirectVideoUrl(e.target.value)}
                    placeholder="https://s3.ap-northeast-1.wasabisys.com/.../video.m3u8"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur-sm"></div>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  💡 ブラウザの開発者ツール（F12）→ Networkタブで動画URLを確認できます
                </p>
              </div>
              <button
                onClick={() => {
                  if (directVideoUrl.trim()) {
                    setVideoUrl(directVideoUrl)
                    setStep('detected')
                  } else {
                    setError('動画URLを入力してください')
                  }
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-[1.02]"
              >
                ⚡ 文字起こし開始
              </button>
            </>
          )}

          {/* Step 2: Video Detected */}
          {(step === 'detected' || step === 'transcribing' || step === 'completed') && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-cyan-500/50 rounded-xl p-4 mb-4 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-cyan-400"></div>
                <p className="text-sm font-medium text-cyan-300 mb-1 flex items-center gap-2">
                  <span className="text-green-400">✓</span> 動画URLを検出しました
                </p>
                <p className="text-xs text-gray-300 break-all font-mono bg-gray-900/30 p-2 rounded mt-2">{videoUrl}</p>
              </div>

              {step === 'detected' && (
                <button
                  onClick={handleTranscribe}
                  className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  ⚡ 文字起こし開始
                </button>
              )}
            </div>
          )}

          {/* Step 3: Transcribing */}
          {step === 'transcribing' && (
            <div className="text-center py-12 relative">
              <div className="relative inline-block">
                <div className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/30 border-b-purple-400 rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
              </div>
              <p className="text-cyan-300 font-medium mt-6 text-lg">文字起こし処理中...</p>
              <p className="text-sm text-gray-400 mt-2">AI analyzing video content...</p>
              <div className="flex justify-center gap-1 mt-4">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 'completed' && (
            <div className="space-y-6">
              {/* Transcript */}
              <div className="relative">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                    <span className="text-cyan-400">▸</span> 文字起こし結果
                    <span className="text-sm font-normal text-purple-400 ml-2 bg-purple-500/20 px-2 py-1 rounded-lg">
                      {transcript.length.toLocaleString()}文字
                    </span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(transcript, '文字起こし')}
                    className="text-sm bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-4 py-2 rounded-lg transition-all border border-cyan-500/30"
                  >
                    📋 コピー
                  </button>
                </div>
                <textarea
                  value={transcript}
                  readOnly
                  className="w-full h-64 px-4 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-xl text-gray-200 resize-none font-mono text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              {/* Summary Button or Summary */}
              {!summary ? (
                <button
                  onClick={handleSummarize}
                  disabled={summaryLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {summaryLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      要約生成中...
                    </span>
                  ) : (
                    '✨ 要約する'
                  )}
                </button>
              ) : (
                <div className="relative">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
                      <span className="text-purple-400">▸</span> 要約
                    </h3>
                    <button
                      onClick={() => copyToClipboard(summary, '要約')}
                      className="text-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg transition-all border border-purple-500/30"
                    >
                      📋 コピー
                    </button>
                  </div>
                  <div className="px-4 py-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl backdrop-blur-sm">
                    <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{summary}</p>
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={() => {
                  setStep('input')
                  setUtageUrl('')
                  setVideoUrl('')
                  setTranscript('')
                  setSummary('')
                  setError('')
                }}
                className="w-full bg-gray-800/50 text-cyan-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-700/50 border border-cyan-500/30 transition-all"
              >
                🔄 新しい動画を処理
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
              <p className="text-sm text-red-300 flex items-center gap-2">
                <span className="text-red-400">⚠</span> {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="inline-block">
            <p className="text-sm text-cyan-400/60 font-light tracking-wider">
              Powered by <span className="text-cyan-300">OpenAI Whisper API</span>
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
