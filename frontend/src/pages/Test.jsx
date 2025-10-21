import React, { useEffect, useMemo, useRef, useState } from "react"
import ReactPlayer from "react-player"

/**
 * Bilingual Video Learning Layout
 * - Left: Video player (ReactPlayer)
 * - Right: Subtitle panel, synced by time (start/end)
 * - Features: highlight current line, click-to-seek, loop current line,
 *             speed control, subtitle modes (EN/VI/Both/Off), mini-quiz (cloze)
 *
 * How to use:
 *  1) npm i react-player
 *  2) Drop this component anywhere (e.g., MoviePlayerPage).
 *  3) Replace `videoUrl` and `sampleCues` with your data.
 */
export default function BilingualVideoLearning() {
  // === Mock data (replace with your movie & subtitles) ===
  const videoUrl =
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

  // Minimal demo cues; replace with parsed .vtt/.srt content
  const sampleCues = useMemo(
    () => [
      { id: 1, start: 1.2, end: 4.5, en: "Hey there! How are you today?", vi: "Này bạn! Hôm nay bạn thế nào?" },
      { id: 2, start: 4.6, end: 7.8, en: "I'm fine, thanks. And you?", vi: "Mình ổn, cảm ơn. Còn bạn?" },
      { id: 3, start: 7.9, end: 11.5, en: "Let's watch this short scene together.", vi: "Cùng xem đoạn ngắn này nhé." },
      { id: 4, start: 11.6, end: 15.9, en: "Click a line to jump to it.", vi: "Nhấn vào một dòng để tua tới đó." },
      { id: 5, start: 16.0, end: 20.5, en: "You can loop the current sentence for practice.", vi: "Bạn có thể lặp lại câu hiện tại để luyện tập." },
    ],
    []
  )

  // === State ===
  const playerRef = useRef(null)
  const [playing, setPlaying] = useState(true)
  const [playedSeconds, setPlayedSeconds] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [subtitleMode, setSubtitleMode] = useState("both") // 'en' | 'vi' | 'both' | 'off'
  const [loopCurrent, setLoopCurrent] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  // For auto-scroll to active subtitle
  const lineRefs = useRef({})

  // === Helpers ===
  const formatTime = (s) => {
    const sec = Math.max(0, Math.floor(s || 0))
    const m = Math.floor(sec / 60)
    const r = sec % 60
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
  }

  const findActiveIndex = (cues, t) => cues.findIndex((c) => t >= c.start && t < c.end)

  const seekTo = (seconds) => {
    playerRef.current?.seekTo(seconds, "seconds")
  }

  const step = (delta) => {
    seekTo(Math.max(0, playedSeconds + delta))
  }

  // === Sync active subtitle ===
  useEffect(() => {
    const idx = findActiveIndex(sampleCues, playedSeconds)
    setActiveIdx(idx)
  }, [playedSeconds, sampleCues])

  // === Loop current line if enabled ===
  useEffect(() => {
    if (!loopCurrent || activeIdx < 0) return
    const cur = sampleCues[activeIdx]
    if (!cur) return
    if (playedSeconds >= cur.end) {
      seekTo(cur.start)
    }
  }, [playedSeconds, loopCurrent, activeIdx, sampleCues])

  // === Auto-scroll to active line ===
  useEffect(() => {
    if (activeIdx < 0) return
    const el = lineRefs.current[activeIdx]
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [activeIdx])

  // === Keyboard shortcuts: Space (play/pause), J/L (±5s), K (toggle play), R (loop) ===
  useEffect(() => {
    const onKey = (e) => {
      if (e.target?.tagName === "INPUT" || e.target?.tagName === "TEXTAREA") return
      if (e.code === "Space" || e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPlaying((p) => !p)
      } else if (e.key.toLowerCase() === "j") {
        step(-5)
      } else if (e.key.toLowerCase() === "l") {
        step(5)
      } else if (e.key.toLowerCase() === "r") {
        setLoopCurrent((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [playedSeconds])

  // === Mini quiz (cloze) based on active EN line ===
  const activeLine = activeIdx >= 0 ? sampleCues[activeIdx] : null
  const quiz = useMemo(() => {
    if (!activeLine?.en) return null
    // Pick the longest word (>3) to blank out for a simple cloze
    const words = activeLine.en.split(/(\s+)/)
    let bestIdx = -1
    let bestLen = 0
    words.forEach((w, i) => {
      const clean = w.replace(/[^a-zA-Z']/g, "")
      if (clean.length > 3 && clean.length > bestLen) {
        bestLen = clean.length
        bestIdx = i
      }
    })
    if (bestIdx === -1) return null
    const answer = words[bestIdx].replace(/[^a-zA-Z']/g, "")
    const prompt = words
      .map((w, i) => (i === bestIdx ? "____" : w))
      .join("")
    return { prompt, answer }
  }, [activeLine])

  return (
    <div className="w-full h-[calc(100vh-2rem)] p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* LEFT: Video */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-xl">
        <ReactPlayer
          ref={playerRef}
          src={videoUrl}
          playing={playing}
          playbackRate={playbackRate}
          width="100%"
          height="100%"
          onProgress={({ playedSeconds }) => setPlayedSeconds(playedSeconds)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          controls
        />

        {/* Top overlay controls */}
        <div className="absolute top-2 left-2 right-2 flex flex-wrap items-center gap-2">
          <div className="px-2 py-1 rounded-xl bg-white/80 text-xs shadow">{formatTime(playedSeconds)}</div>
          <div className="ml-auto flex items-center gap-2 bg-white/80 rounded-xl px-2 py-1 shadow">
            <label className="text-xs">Speed</label>
            <select
              className="text-sm bg-transparent outline-none"
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
            >
              {[0.75, 1, 1.25, 1.5].map((r) => (
                <option key={r} value={r}>{r}x</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom overlay quick actions */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center gap-2">
          <button
            className="px-3 py-1 rounded-xl bg-white/80 text-sm shadow hover:bg-white"
            onClick={() => setPlaying((p) => !p)}
            aria-label="Play/Pause"
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button className="px-3 py-1 rounded-xl bg-white/80 text-sm shadow hover:bg-white" onClick={() => step(-5)}>
            -5s
          </button>
          <button className="px-3 py-1 rounded-xl bg-white/80 text-sm shadow hover:bg-white" onClick={() => step(5)}>
            +5s
          </button>
          <button
            className={`px-3 py-1 rounded-xl text-sm shadow hover:bg-white ${
              loopCurrent ? "bg-emerald-200" : "bg-white/80"
            }`}
            onClick={() => setLoopCurrent((v) => !v)}
            aria-pressed={loopCurrent}
            aria-label="Loop current line"
          >
            Loop line
          </button>
        </div>
      </div>

      {/* RIGHT: Subtitles & learning panel */}
      <div className="flex flex-col min-h-0 rounded-2xl border shadow-sm">
        {/* Header controls */}
        <div className="p-3 border-b flex flex-wrap items-center gap-2">
          <div className="font-medium">Subtitles</div>
          <div className="ml-auto flex items-center gap-1 text-sm">
            <ModeButton current={subtitleMode} setMode={setSubtitleMode} value="off" label="Off" />
            <ModeButton current={subtitleMode} setMode={setSubtitleMode} value="en" label="EN" />
            <ModeButton current={subtitleMode} setMode={setSubtitleMode} value="vi" label="VI" />
            <ModeButton current={subtitleMode} setMode={setSubtitleMode} value="both" label="EN+VI" />
          </div>
        </div>

        {/* Subtitle list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {sampleCues.map((c, i) => {
            const isActive = i === activeIdx
            const showEn = subtitleMode === "en" || subtitleMode === "both"
            const showVi = subtitleMode === "vi" || subtitleMode === "both"
            return (
              <div
                key={c.id}
                ref={(el) => (lineRefs.current[i] = el)}
                role="button"
                onClick={() => seekTo(c.start)}
                className={`rounded-xl p-3 border cursor-pointer transition shadow-sm ${
                  isActive ? "bg-amber-50 border-amber-300" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{formatTime(c.start)} - {formatTime(c.end)}</span>
                  <span>#{i + 1}</span>
                </div>
                {subtitleMode !== "off" ? (
                  <div className="space-y-1">
                    {showEn && <p className="text-base leading-snug">{c.en}</p>}
                    {showVi && <p className="text-sm leading-snug text-gray-600">{c.vi}</p>}
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-400">(Subtitles hidden)</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Mini-quiz panel */}
        <div className="p-3 border-t bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Mini Quiz (Cloze)</div>
            {activeLine && (
              <div className="text-xs text-gray-500">Current: #{activeIdx + 1}</div>
            )}
          </div>
          {quiz ? (
            <div className="space-y-2">
              <p className="text-sm">Fill the blank:</p>
              <p className="text-base font-medium">{quiz.prompt}</p>
              <details className="text-sm">
                <summary className="cursor-pointer select-none text-gray-600">Show answer</summary>
                <div className="mt-1">{quiz.answer}</div>
              </details>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Play a line to auto-generate a cloze question.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function ModeButton({ current, setMode, value, label }) {
  const active = current === value
  return (
    <button
      onClick={() => setMode(value)}
      className={`px-2.5 py-1 rounded-lg border text-xs transition ${
        active ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
