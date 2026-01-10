import React, { useMemo, useState } from 'react'
import ReactPlayer from 'react-player'

/** ===== Fake data ===== */
const fakeMovie = {
  title: 'Thợ Săn Phù Thủy',
  slug: 'tho-san-phu-thuy-2024',
  description: 'Phim lấy bối cảnh một thị trấn thời trung cổ bị quái vật hoành hành nh…',
  thumb_url: 'https://img.ophim.live/uploads/movies/tho-san-phu-thuy-2024-thumb.jpg',
  poster_url: 'https://img.ophim.live/uploads/movies/tho-san-phu-thuy-2024-poster.jpg',
  duration: '80 Phút',
  year_released: 2024,
  level: 'medium',
  genre: 'Viễn Tưởng, Hành Động, Phiêu Lưu',
  link_m3u8: 'https://vip.opstream90.com/20251008/14500_a8442efa/index.m3u8',
}

const fakeSubEn = `
1
00:00:13,535 --> 00:00:16,846
The Cardinal War had been
waged for nearly a decade.

2
00:00:16,929 --> 00:00:22,026
So much death, famine, disease.

3
00:00:22,109 --> 00:00:26,160
The conflict reached a bloody
and decisive conclusion,

4
00:00:26,243 --> 00:00:29,424
with Konrad I of
the House of Barlow

5
00:00:29,507 --> 00:00:33,907
emerging victorious as
ruler, his power absolute.

6
00:00:33,990 --> 00:00:36,997
King Konrad soon
consolidated his reach,

7
00:00:37,080 --> 00:00:42,002
unifying his dominion at
the border along the Weald,

8
00:00:42,085 --> 00:00:46,615
and his reign continued
on, peaceful and fair,

9
00:00:46,698 --> 00:00:50,489
until the King discovered
there still remained

10
00:00:50,572 --> 00:00:54,319
one last threat
looming in his midst.

11
00:00:54,402 --> 00:00:56,843
Many years had passed
when his kingdom

12
00:00:56,926 --> 00:01:00,890
was first beset by
rumor, innuendo,

13
00:01:00,973 --> 00:01:03,850
ghastly sighs from the depths.

14
00:01:03,933 --> 00:01:07,462
The tranquil land had begun
to change in horrific ways.

15
00:01:07,545 --> 00:01:10,770
Gisela, the Witch of the Weald.

16
00:01:10,853 --> 00:01:14,556
Even a whisper of
her cursed name

17
00:01:14,639 --> 00:01:17,211
could strike fear in
the bravest of men.

18
00:01:17,294 --> 00:01:19,257
Children run and
recoil in terror

19
00:01:19,340 --> 00:01:24,001
at the very mention of her.

20
00:01:24,084 --> 00:01:28,222
One by one, old
warriors, mercenaries,

21
00:01:28,305 --> 00:01:31,225
and agnostics would seek
her out to prove she was

22
00:01:31,308 --> 00:01:35,360
only a myth, or to put
an end to her heresy.

23
00:01:35,443 --> 00:01:37,014
But those who entered the Weald

24
00:01:37,097 --> 00:01:39,233
met a cruel and bloody end

25
00:01:39,316 --> 00:01:41,801
as Gisela grew angrier
and more spiteful

26
00:01:41,884 --> 00:01:44,238
at each of the challenges,

27
00:01:44,321 --> 00:01:47,502
until the King
was left no choice

28
00:01:47,585 --> 00:01:51,502
but to seek an appeasement
with her in official capacity.

29
00:02:30,411 --> 00:02:33,548
Volker, why do we not try
to sneak our way inside?

30
00:02:33,631 --> 00:02:34,549
Quietly.

31
00:02:34,632 --> 00:02:36,160
Quietly?

32
00:02:36,243 --> 00:02:39,511
We are here by the
order of King Konrad.

33
00:02:39,594 --> 00:02:40,773
Let the Witch see us coming.

34
00:02:40,856 --> 00:02:43,558
Caution has value, young Lotten.

35
00:02:43,641 --> 00:02:45,778
You cannot sneak up on a Witch.

36
00:02:45,861 --> 00:02:49,608
She has eyes everywhere.

37
00:02:49,691 --> 00:02:53,177
Then let's pluck them out
and finish this madness.

38
00:02:53,260 --> 00:02:54,439
Witch dies tonight.

39
00:02:54,522 --> 00:02:56,789
Quiet.

40
00:02:56,872 --> 00:03:02,055
If we rush in with violence,
we do not stand a chance.

41
00:03:02,138 --> 00:03:06,055
Your presence here is merely
as a backup, do you understand?

42
00:03:08,231 --> 00:03:09,671
We are here to
seek an arrangement

43
00:03:09,754 --> 00:03:11,978
with the Witch, that's all.

44
00:03:12,061 --> 00:03:14,023
You think you can
reason with a Witch?

45
00:03:14,106 --> 00:03:18,680
That is folly.

46
00:03:18,763 --> 00:03:23,163
We were sent by the
King, your King,

47
00:03:23,246 --> 00:03:26,340
to find out what
she would agree to.

48
00:03:26,423 --> 00:03:27,598
Do you understand?

49
00:03:42,265 --> 00:03:44,267
Soon, my love.

50
00:03:46,878 --> 00:03:48,010
Soon.
`

const fakeSubVi = `
1
00:00:13,535 --> 00:00:16,846
Cuộc chiến Hồng y đã diễn ra trong gần một thập kỷ.

2
00:00:16,929 --> 00:00:22,026
Quá nhiều cái chết, nạn đói và bệnh tật.

3
00:00:22,109 --> 00:00:26,160
Cuộc xung đột đã đi đến một kết thúc đẫm máu và quyết định,

4
00:00:26,243 --> 00:00:29,424
với Konrad I của Nhà Barlow

5
00:00:29,507 --> 00:00:33,907
nổi lên chiến thắng như người cai trị, quyền lực của ông là tuyệt đối.

6
00:00:33,990 --> 00:00:36,997
Vua Konrad sớm củng cố quyền lực của mình,

7
00:00:37,080 --> 00:00:42,002
thống nhất lãnh thổ của mình tại biên giới dọc theo Weald,

8
00:00:42,085 --> 00:00:46,615
và triều đại của ông vẫn tiếp tục, hòa bình và công bằng,

9
00:00:46,698 --> 00:00:50,489
cho đến khi nhà vua phát hiện ra vẫn còn

10
00:00:50,572 --> 00:00:54,319
một mối đe dọa cuối cùng đang rình rập anh ta.

11
00:00:54,402 --> 00:00:56,843
Nhiều năm đã trôi qua khi vương quốc của ông

12
00:00:56,926 --> 00:01:00,890
đầu tiên bị bao vây bởi tin đồn, ám chỉ,

13
00:01:00,973 --> 00:01:03,850
những tiếng thở dài khủng khiếp từ sâu thẳm.

14
00:01:03,933 --> 00:01:07,462
Vùng đất yên bình đã bắt đầu thay đổi theo những cách khủng khiếp.

15
00:01:07,545 --> 00:01:10,770
Gisela, Phù thủy xứ Weald.

16
00:01:10,853 --> 00:01:14,556
Ngay cả một lời thì thầm về cái tên bị nguyền rủa của cô ấy

17
00:01:14,639 --> 00:01:17,211
có thể khiến những người đàn ông dũng cảm nhất phải sợ hãi.

18
00:01:17,294 --> 00:01:19,257
Trẻ em chạy và lùi lại vì sợ hãi

19
00:01:19,340 --> 00:01:24,001
ngay khi nhắc đến cô ấy.

20
00:01:24,084 --> 00:01:28,222
Từng người một, những chiến binh già, lính đánh thuê,

21
00:01:28,305 --> 00:01:31,225
và những người theo thuyết bất khả tri sẽ tìm đến cô ấy để chứng minh rằng cô ấy

22
00:01:31,308 --> 00:01:35,360
chỉ là một huyền thoại, hoặc để chấm dứt tà giáo của bà.

23
00:01:35,443 --> 00:01:37,014
Nhưng những người bước vào Weald

24
00:01:37,097 --> 00:01:39,233
đã gặp phải một kết cục tàn khốc và đẫm máu

25
00:01:39,316 --> 00:01:41,801
khi Gisela ngày càng tức giận và độc ác hơn

26
00:01:41,884 --> 00:01:44,238
ở mỗi thử thách,

27
00:01:44,321 --> 00:01:47,502
cho đến khi nhà vua không còn lựa chọn nào khác

28
00:01:47,585 --> 00:01:51,502
nhưng để tìm cách xoa dịu bà với tư cách chính thức.

29
00:02:30,411 --> 00:02:33,548
Volker, tại sao chúng ta không thử lẻn vào bên trong?

30
00:02:33,631 --> 00:02:34,549
Một cách lặng lẽ.

31
00:02:34,632 --> 00:02:36,160
Một cách lặng lẽ?

32
00:02:36,243 --> 00:02:39,511
Chúng tôi đến đây theo lệnh của Vua Konrad.

33
00:02:39,594 --> 00:02:40,773
Hãy để mụ phù thủy thấy chúng ta đang tới.

34
00:02:40,856 --> 00:02:43,558
Thận trọng là có giá trị, Lotten trẻ tuổi ạ.

35
00:02:43,641 --> 00:02:45,778
Bạn không thể lẻn đến gần một Phù thủy.

36
00:02:45,861 --> 00:02:49,608
Cô ấy có mắt ở khắp mọi nơi.

37
00:02:49,691 --> 00:02:53,177
Vậy thì hãy nhổ chúng ra và chấm dứt sự điên rồ này.

38
00:02:53,260 --> 00:02:54,439
Phù thủy sẽ chết vào đêm nay.

39
00:02:54,522 --> 00:02:56,789
Im lặng.

40
00:02:56,872 --> 00:03:02,055
Nếu chúng ta xông vào bằng bạo lực, chúng ta sẽ không có cơ hội nào.

41
00:03:02,138 --> 00:03:06,055
Sự hiện diện của anh ở đây chỉ là phương án dự phòng thôi, anh hiểu không?

42
00:03:08,231 --> 00:03:09,671
Chúng tôi ở đây để tìm kiếm một sự sắp xếp

43
00:03:09,754 --> 00:03:11,978
với Phù thủy, thế thôi.

44
00:03:12,061 --> 00:03:14,023
Bạn nghĩ bạn có thể lý luận được với một phù thủy sao?

45
00:03:14,106 --> 00:03:18,680
Thật là điên rồ.

46
00:03:18,763 --> 00:03:23,163
Chúng tôi được Đức Vua, Đức Vua của các bạn, phái đến

47
00:03:23,246 --> 00:03:26,340
để tìm hiểu xem cô ấy sẽ đồng ý với điều gì.

48
00:03:26,423 --> 00:03:27,598
Bạn hiểu không?

49
00:03:42,265 --> 00:03:44,267
Sớm thôi, tình yêu của anh.

50
00:03:46,878 --> 00:03:48,010
Sớm.
`

// Dịnh dàng thời gian từ HH:MM:SS,MMM sang giây
const timeToSeconds = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(':')
  const [secs] = seconds.split(/[,.]/) // Bỏ phần mili giây
  return (
    parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(secs, 10)
  )
}

// Phân tích phụ đề từ văn bản SRT thành mảng { startTime, endTime, text }
const parseSubtitlesFromText = (subtitleContent) => {
  if (!subtitleContent) return []

  const blocks = subtitleContent
    .replace(/\r/g, '') // Loại bỏ ký tự carriage return
    .replace(/^\uFEFF/, '') // Loại bỏ BOM nếu có
    .split(/\n\s*\n/)
    .filter((block) => block.trim())

  const subtitles = []

  for (const block of blocks) {
    const lines = block.trim().split('\n').filter(Boolean)
    if (lines.length < 2) continue

    // Bỏ dòng index nếu có
    const hasIndexLine = /^\d+$/.test(lines[0])
    const timeLine = (hasIndexLine ? lines[1] : lines[0]).trim()
    const times = timeLine.split('-->')
    if (times.length !== 2) continue

    const startTime = timeToSeconds(times[0].trim())
    const endTime = timeToSeconds(times[1].trim())
    if (Number.isNaN(startTime) || Number.isNaN(endTime)) continue

    const textLines = lines.slice(hasIndexLine ? 2 : 1)
    const text = textLines.join('\n').trim()
    if (!text) continue

    subtitles.push({ startTime, endTime, text })
  }

  return subtitles
}

// Kết hợp phụ đề song ngữ vào cùng 1 mảng { startTime, endTime, englishText, vietnameseText }
const mergeBiSubs = (enSubs = [], viSubs = []) => {
  const len = Math.max(enSubs.length, viSubs.length)
  const result = []

  for (let i = 0; i < len; i += 1) {
    const en = enSubs[i]
    const vi = viSubs[i]

    if (!en && !vi) continue

    result.push({
      startTime: en?.startTime ?? vi?.startTime ?? 0,
      endTime: en?.endTime ?? vi?.endTime ?? 0,
      enText: en?.text || '',
      viText: vi?.text || '',
    })
  }

  return result
}

// Định dạng thời gian từ giây sang HH:MM:SS
const formatTime = (timeInSeconds = 0) => {
  const safeSeconds = Math.max(0, Math.floor(timeInSeconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = Math.floor(safeSeconds % 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}


export default function MoviePlayerUI() {
  const bilingualSubtitles = useMemo(() => {
    const enSubs = parseSubtitlesFromText(fakeSubEn)
    const viSubs = parseSubtitlesFromText(fakeSubVi)
    return mergeBiSubs(enSubs, viSubs)
  }, [])

  const [subtitleMode, setSubtitleMode] = useState('bilingual')

  const filteredSubtitles = useMemo(() => {
    if (subtitleMode === 'en') {
      return bilingualSubtitles.map((sub) => ({
        ...sub,
        viText: '',
      }))
    }
    if (subtitleMode === 'vi') {
      return bilingualSubtitles.map((sub) => ({
        ...sub,
        enText: '',
      }))
    }
    return bilingualSubtitles
  }, [subtitleMode, bilingualSubtitles])

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-[#E4D161] mb-3">
          {fakeMovie.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player */}
          <div className="lg:col-span-2">
            <div className="bg-[#1B2A36] rounded-md border border-white/10 overflow-hidden">
              <div className="w-full h-[420px] bg-black">
                <ReactPlayer
                  src={fakeMovie.link_m3u8}
                  controls
                  width="100%"
                  height="100%"
                />
              </div>
            </div>
          </div>

          {/* Subtitle  */}
          <div className="flex flex-col">
            <div className="bg-[#1B2A36] rounded-md border border-white/10 h-[420px] overflow-y-auto">
              {filteredSubtitles.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Chưa có phụ đề
                </div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {filteredSubtitles.map((subtitle, index) => (
                    <li
                      key={index}
                      className="p-3 border-l-4 border-transparent hover:bg-white/5 transition-colors cursor-default"
                    >
                      <div className="text-[11px] font-mono mb-1 text-gray-400">
                        {formatTime(subtitle.startTime)} <span className="opacity-70">→</span>{' '}
                        {formatTime(subtitle.endTime)}
                      </div>

                      {subtitle.enText && (
                        <p className="text-[15px] text-white/90 font-semibold whitespace-pre-wrap mb-1">
                          {subtitle.enText}
                        </p>
                      )}

                      {subtitle.viText && (
                        <p className="text-sm italic text-gray-300 whitespace-pre-wrap">
                          {subtitle.viText}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={() => setSubtitleMode('bilingual')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${subtitleMode === 'bilingual' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
          >
            Xem song ngữ
          </button>

          <button
            type="button"
            onClick={() => setSubtitleMode('en')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${subtitleMode === 'en' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
          >
            Chỉ tiếng Anh
          </button>

          <button
            type="button"
            onClick={() => setSubtitleMode('vi')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${subtitleMode === 'vi' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
          >
            Chỉ tiếng Việt
          </button>

          <button
            type="button"
            className="ml-auto px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
            disabled
            title="UI only (đã bỏ logic tạo bài tập)"
          >
            Bài tập tương tác
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-[#1B2A36] p-6 rounded-xl shadow-lg text-gray-300 border border-white/5">
            <h3 className="text-xl font-bold text-[#E4D161] mb-4 border-b border-white/10 pb-2">
              Thông tin phim
            </h3>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="shrink-0 mx-auto sm:mx-0">
                <div className="w-32 sm:w-40 aspect-[2/3] rounded-lg overflow-hidden shadow-md border border-white/10 bg-black/20">
                  {fakeMovie?.thumb_url ? (
                    <img
                      src={fakeMovie.thumb_url}
                      alt={fakeMovie?.title || 'Movie poster'}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                      No Image
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-2xl font-bold text-white leading-tight">
                    {fakeMovie?.title || 'Đang tải...'}
                  </h4>

                  {fakeMovie?.level && (
                    <span
                      className={`inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full border 
                        ${
                          fakeMovie.level.toLowerCase() === 'easy'
                            ? 'bg-green-600/20 text-green-300 border-green-500/30'
                            : fakeMovie.level.toLowerCase() === 'medium'
                            ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
                            : fakeMovie.level.toLowerCase() === 'hard'
                            ? 'bg-red-600/20 text-red-300 border-red-500/30'
                            : 'bg-gray-600/20 text-gray-300 border-gray-500/30'
                        }`}
                    >
                      {fakeMovie.level}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="px-3 py-1 rounded-full bg-[#14202A] border border-white/10 text-gray-300 flex items-center gap-1">
                    <span className="text-[#E4D161]">Năm:</span>
                    <span>{fakeMovie?.year_released ?? 'N/A'}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-[#14202A] border border-white/10 text-gray-300 flex items-center gap-1">
                    <span className="text-[#E4D161]">Thời lượng:</span>
                    <span>{fakeMovie?.duration ?? 'N/A'}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-[#14202A] border border-white/10 text-gray-300 flex items-center gap-1">
                    <span className="text-[#E4D161]">Thể loại:</span>
                    <span>{fakeMovie?.genre ?? 'Unknown'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <h5 className="text-sm font-semibold text-gray-400 mb-1">Mô tả:</h5>
                  <div className="text-sm text-gray-300 leading-relaxed max-h-40 overflow-y-auto pr-2">
                    {fakeMovie?.description ? (
                      <p className="whitespace-pre-wrap">{fakeMovie.description}</p>
                    ) : (
                      <p className="italic text-gray-500">Mô tả phim chưa có.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Giữ layout giống bản cũ */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </div>
  )
}
