import axios from 'axios'
import Hls from 'hls.js'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import TaskBarUser from '../../components/TaskBars/TaskBarUser'
import { fetchMovieByIdApi } from '../../api'

/* ===== SUBTITLE HELPERS ===== */
function srtToCues(srtText = '') {
  const text = srtText.replace(/\r/g, '').replace(/^\uFEFF/, '')
  const blocks = text.split(/\n\n+/).filter(Boolean)
  const toSec = (t) => {
    const [h, m, sMs] = t.split(':')
    const [s, ms] = sMs.split(/[,.]/)
    return (+h) * 3600 + (+m) * 60 + (+s) + (+ms || 0) / 1000
  }
  const cues = []
  for (const block of blocks) {
    const lines = block.split('\n').filter(Boolean)
    if (lines.length < 2) continue
    const timeIdx = /^\d+$/.test(lines[0]) ? 1 : 0
    const m = lines[timeIdx].match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/)
    if (!m) continue
    const start = toSec(m[1])
    const end = toSec(m[2])
    const textLines = lines.slice(timeIdx + 1).join('\n')
    cues.push({ start, end, text: textLines })
  }
  return cues.sort((a, b) => a.start - b.start)
}
function pairCues(en = [], vi = []) {
  const max = Math.max(en.length, vi.length)
  const items = []
  for (let i = 0; i < max; i++) {
    const e = en[i], v = vi[i]
    if (!e && !v) continue
    items.push({ start: e?.start ?? v?.start ?? 0, end: e?.end ?? v?.end ?? 0, en: e?.text || '', vi: v?.text || '' })
  }
  return items
}
function sanitizeSubtitle(s = '') {
  let out = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  out = out.replace(/&lt;(\/?)?(i|b|u)&gt;/gi, '<$1$2>').replace(/\n/g, '<br/>')
  return out
}
function fmtTime(totalSec = 0) {
  const sec = Math.max(0, Math.floor(totalSec))
  const h = String(Math.floor(sec / 3600)).padStart(2, '0')
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}
function findActiveIndex(cues, t, eps = 0.05) {
  let lo = 0, hi = cues.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1, c = cues[mid]
    if (t < c.start - eps) hi = mid - 1
    else if (t > c.end + eps) lo = mid + 1
    else return mid
  }
  return -1
}

/* ===== UI PANELS ===== */
function PlayerPanel({ loading, error, videoRef }) {
  return (
    <div className="lg:col-span-2">
      <div className="bg-[#1B2A36] rounded-md border border-white/10">
        {loading ? (
          <div className="w-full h-[420px] bg-[#101820] flex items-center justify-center text-gray-400">Đang tải…</div>
        ) : error ? (
          <div className="w-full h-[420px] bg-[#101820] flex items-center justify-center text-red-400">{error}</div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-[420px] bg-black"
            controls
            playsInline
            crossOrigin="anonymous"
          />
        )}
      </div>
    </div>
  )
}
function SubtitlePanel({ subLoading, subs, activeIdx, rowRefs, listRef, seekTo }) {
  return (
    <div className="flex flex-col">
      <div ref={listRef} className="bg-[#1B2A36] rounded-md border border-white/10 h-[420px] overflow-y-auto">
        {subLoading ? (
          <div className="h-full flex items-center justify-center text-gray-400">Đang tải phụ đề…</div>
        ) : subs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">Chưa có phụ đề</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {subs.map((c, i) => {
              const isCurrent = i === activeIdx
              return (
                <li
                  key={i}
                  ref={el => (rowRefs.current[i] = el)}
                  className={`p-3 cursor-pointer transition-colors border-l-4 ${isCurrent ? 'bg-white/10 border-[#E4D161]' : 'hover:bg-white/5 border-transparent'}`}
                  onClick={() => seekTo(c.start)}
                  title={`${fmtTime(c.start)} → ${fmtTime(c.end)}`}
                >
                  <div className={`text-[11px] font-mono mb-1 ${isCurrent ? 'text-[#E4D161]' : 'text-gray-400'}`}>{fmtTime(c.start)} <span className="opacity-70">→</span> {fmtTime(c.end)}</div>
                  {c.en && (<div className={`text-[15px] mb-1 ${isCurrent ? 'text-white font-semibold' : 'text-white/90 font-semibold'}`} dangerouslySetInnerHTML={{ __html: sanitizeSubtitle(c.en) }} />)}
                  {c.vi && (<div className={`text-sm italic ${isCurrent ? 'text-gray-200' : 'text-gray-300'}`} dangerouslySetInnerHTML={{ __html: sanitizeSubtitle(c.vi) }} />)}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
function InfoPanel({ movie }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-[#1B2A36] p-4 rounded-md text-gray-300">
        <h3 className="text-lg font-semibold text-white mb-2">Thông tin phim</h3>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs px-2 py-1 rounded-full bg-[#14202A] text-[#E4D161]">Năm: {movie?.year ?? 'N/A'}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-[#14202A] text-gray-200">Thời lượng: {movie?.time ?? 'N/A'}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-[#14202A] text-gray-200">Thể loại: {movie?.genre ?? 'Unknown'}</span>
        </div>
        <div className="text-sm text-gray-200 leading-relaxed max-h-44 overflow-y-auto">
          {movie?.description ? <p className="whitespace-pre-wrap">{movie.description}</p> : <p className="text-gray-400">Mô tả phim chưa có.</p>}
        </div>
      </div>
      <div className="bg-[#1B2A36] p-4 rounded-md text-gray-300">
        <h3 className="text-lg font-semibold text-white mb-2">Phim cùng thể loại</h3>
        <p className="text-sm text-gray-400">TODO: hiển thị danh sách phim tương tự tại đây…</p>
      </div>
    </div>
  )
}

/* ===== MAIN PAGE ===== */
export default function MoviePlayerPage() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [subs, setSubs] = useState([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [subLoading, setSubLoading] = useState(false)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const listRef = useRef(null)
  const rowRefs = useRef([])
  const lastCommittedIdx = useRef(-1)

  // Fetch movie info
  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true); setError(null)
      try {
        const data = await fetchMovieByIdApi(id)
        setMovie(data)
      } catch { setError('Không thể tải dữ liệu phim') }
      finally { setLoading(false) }
    })()
  }, [id])

  // Fetch subtitles
  useEffect(() => {
    if (!id) return
    ;(async () => {
      setSubLoading(true)
      try {
        const res = await axios.get(`http://localhost:5001/api/subtitles/movie/${id}?withContent=1`)
        const list = res?.data?.data || []
        const enCues = srtToCues(list.find(x => x.language === 'en')?.srtContent || '')
        const viCues = srtToCues(list.find(x => x.language === 'vi')?.srtContent || '')
        setSubs(pairCues(enCues, viCues))
      } finally { setSubLoading(false) }
    })()
  }, [id])

  // Attach HLS to video and keep 1 highlight
  useEffect(() => {
    const video = videoRef.current
    if (!video || !movie?.link_m3u8) return
    setActiveIdx(-1); lastCommittedIdx.current = -1
    const updateActive = () => {
      const t = video.currentTime || 0
      if (!subs.length) return
      let cur = findActiveIndex(subs, t)
      if (cur === -1) cur = lastCommittedIdx.current
      if (cur !== -1) lastCommittedIdx.current = cur
      setActiveIdx((p) => (p !== cur ? cur : p))
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = movie.link_m3u8
      video.addEventListener('timeupdate', updateActive)
      video.addEventListener('seeking', updateActive)
      video.addEventListener('seeked', updateActive)
      video.addEventListener('ratechange', updateActive)
      video.addEventListener('loadedmetadata', updateActive)
      video.addEventListener('ended', () => { setActiveIdx(-1); lastCommittedIdx.current = -1 })
      return () => {
        video.removeAttribute('src'); video.load()
        video.removeEventListener('timeupdate', updateActive)
        video.removeEventListener('seeking', updateActive)
        video.removeEventListener('seeked', updateActive)
        video.removeEventListener('ratechange', updateActive)
        video.removeEventListener('loadedmetadata', updateActive)
      }
    }
    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(movie.link_m3u8)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data?.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad()
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError()
          else hls.destroy()
        }
      })
      video.addEventListener('timeupdate', updateActive)
      video.addEventListener('seeking', updateActive)
      video.addEventListener('seeked', updateActive)
      video.addEventListener('ratechange', updateActive)
      video.addEventListener('loadedmetadata', updateActive)
      video.addEventListener('ended', () => { setActiveIdx(-1); lastCommittedIdx.current = -1 })
      return () => {
        video.removeEventListener('timeupdate', updateActive)
        video.removeEventListener('seeking', updateActive)
        video.removeEventListener('seeked', updateActive)
        video.removeEventListener('ratechange', updateActive)
        video.removeEventListener('loadedmetadata', updateActive)
        hls.destroy()
      }
    }
  }, [movie?.link_m3u8, subs])

  // Auto scroll subtitle list
  useEffect(() => {
    if (activeIdx < 0) return
    const el = rowRefs.current[activeIdx], wrap = listRef.current
    if (el && wrap) {
      const top = el.offsetTop - wrap.clientHeight / 2 + el.clientHeight / 2
      wrap.scrollTo({ top, behavior: 'smooth' })
    }
  }, [activeIdx])

  // Seek to subtitle
  const seekTo = (sec) => {
    const v = videoRef.current
    if (v) v.currentTime = sec
  }

  // ===== Layout =====
  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-[#E4D161] mb-3">{movie?.title ?? 'Đang tải phim...'}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PlayerPanel loading={loading} error={error} videoRef={videoRef} />
          <SubtitlePanel subLoading={subLoading} subs={subs} activeIdx={activeIdx} rowRefs={rowRefs} listRef={listRef} seekTo={seekTo} />
        </div>
        <InfoPanel movie={movie} />
      </div>
    </div>
  )
}
