import React from 'react'
import { fmtTime, sanitizeSubtitle } from '@/utils/helpers.js'

const SubtitlePanel = ({
  subLoading,
  subs,
  activeIdx,
  rowRefs,
  listRef,
  seekTo,
  mode,
}) => {
  return (
    <div className="flex flex-col">
      <div
        ref={listRef}
        className="bg-[#1B2A36] rounded-md border border-white/10 h-[420px] overflow-y-auto"
      >
        {subLoading ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Đang tải phụ đề…
          </div>
        ) : subs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Chưa có phụ đề
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {subs.map((c, i) => {
              const isCurrent = i === activeIdx
              const showEn = mode !== 'vi' && c.en
              const showVi = mode !== 'en' && c.vi

              return (
                <li
                  key={i}
                  ref={(el) => (rowRefs.current[i] = el)}
                  className={`p-3 cursor-pointer transition-colors border-l-4 ${
                    isCurrent
                      ? 'bg-white/10 border-[#E4D161]'
                      : 'hover:bg-white/5 border-transparent'
                  }`}
                  onClick={() => seekTo(c.start)}
                  title={`${fmtTime(c.start)} → ${fmtTime(c.end)}`}
                >
                  <div
                    className={`text-[11px] font-mono mb-1 ${
                      isCurrent ? 'text-[#E4D161]' : 'text-gray-400'
                    }`}
                  >
                    {fmtTime(c.start)} <span className="opacity-70">→</span>{' '}
                    {fmtTime(c.end)}
                  </div>

                  {showEn && (
                    <div
                      className={`text-[15px] mb-1 ${
                        isCurrent
                          ? 'text-white font-semibold'
                          : 'text-white/90 font-semibold'
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeSubtitle(c.en),
                      }}
                    />
                  )}

                  {showVi && (
                    <div
                      className={`text-sm italic ${
                        isCurrent ? 'text-gray-200' : 'text-gray-300'
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeSubtitle(c.vi),
                      }}
                    />
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default SubtitlePanel