import { jest } from '@jest/globals'

await jest.unstable_mockModule('../../src/services/JwtService.js', () => ({
  JwtService: {
    generateToken: jest.fn(),
    verifyToken: jest.fn().mockResolvedValue({ id: 'test-user-id' }),
  },
}))

await jest.unstable_mockModule('../../src/services/OpenAiGenQuizService.js', () => ({
  OpenAiGenQuiz: {
    createQuiz: jest.fn().mockResolvedValue({ ok: true, data: { generated: true } }),
  },
}))

import request from 'supertest'

const { default: app } = await import('../../src/server.js')
const { default: Movie } = await import('../../src/models/movieModel.js')
const { default: Quiz } = await import('../../src/models/quizModel.js')

const {
  connectTestDB,
  disconnectTestDB,
  clearDB,
} = await import('../setupTestDB.js')

beforeAll(async () => {
  await connectTestDB()
})

afterAll(async () => {
  await disconnectTestDB()
})

afterEach(async () => {
  await clearDB()
  jest.clearAllMocks()
})

const sampleMovie = {
  title: 'Quiz Test Movie',
  slug: 'quiz-test-movie',
  description: 'Movie for quiz tests',
  thumb_url: 'https://example.com/t.jpg',
  poster_url: 'https://example.com/p.jpg',
  duration: '1h',
  year_released: 2025,
  level: 'medium',
  genre: 'Test',
  link_m3u8: 'https://example.com/stream.m3u8',
}

describe('API Quiz', () => {
  it('POST /api/quizzes - tạo quiz thành công', async () => {
    const movie = await Movie.create(sampleMovie)
    const payload = {
      movieId: String(movie._id),
      quizType: 'reading',
      passage: 'Đoạn test',
      questions: [
        {
          question: 'Câu hỏi 1?',
          answer: 'A',
          explanation: 'Giải thích',
          quote: '',
          options: [
            { label: 'A', content: 'opt A' },
            { label: 'B', content: 'opt B' },
            { label: 'C', content: 'opt C' },
            { label: 'D', content: 'opt D' },
          ],
        },
      ],
    }

    const res = await request(app)
      .post('/api/quizzes')
      .set('Authorization', 'Bearer faketoken')
      .send(payload)

    expect(res.statusCode).toBe(201)
    expect(res.body.ok).toBe(true)
    expect(res.body.data).toBeDefined()
    expect(res.body.data.movieId).toBe(String(movie._id))
    expect(res.body.data.quizType).toBe('reading')
    expect(Array.isArray(res.body.data.questions)).toBe(true)
  })

  it('GET /api/quizzes - thiếu query trả 400', async () => {
    const res = await request(app)
      .get('/api/quizzes')
      .set('Authorization', 'Bearer faketoken')

    expect(res.statusCode).toBe(400)
  })

  it('GET /api/quizzes - lấy danh sách theo movie + type', async () => {
    const movie = await Movie.create(sampleMovie)
    await Quiz.create({ movieId: movie._id, quizType: 'reading', questions: [] })
    await Quiz.create({ movieId: movie._id, quizType: 'reading', questions: [] })

    const res = await request(app)
      .get('/api/quizzes')
      .query({ movie_id: String(movie._id), quiz_type: 'reading' })
      .set('Authorization', 'Bearer faketoken')

    expect(res.statusCode).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBe(2)
  })

  it('GET /api/quizzes/unique-movie-type - trả về cặp movie + quizType', async () => {
    const m1 = await Movie.create({ ...sampleMovie, slug: 'm1' })
    const m2 = await Movie.create({ ...sampleMovie, slug: 'm2' })
    await Quiz.create({ movieId: m1._id, quizType: 'reading', questions: [] })
    await Quiz.create({ movieId: m1._id, quizType: 'translation', questions: [] })
    await Quiz.create({ movieId: m2._id, quizType: 'reading', questions: [] })

    const res = await request(app)
      .get('/api/quizzes/unique-movie-type')
      .set('Authorization', 'Bearer faketoken')

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('OK')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThanOrEqual(3)
  })

  it('GET /api/quizzes/summary - trả về tổng số theo movie', async () => {
    const m1 = await Movie.create({ ...sampleMovie, slug: 'sum1' })
    await Quiz.create({ movieId: m1._id, quizType: 'reading', questions: [] })
    await Quiz.create({ movieId: m1._id, quizType: 'reading', questions: [] })
    await Quiz.create({ movieId: m1._id, quizType: 'translation', questions: [] })

    const res = await request(app)
      .get('/api/quizzes/summary')
      .set('Authorization', 'Bearer faketoken')

    expect(res.statusCode).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    const entry = res.body.data.find((e) => e.movieId === String(m1._id))
    expect(entry).toBeDefined()
    expect(entry.quizCounts.reading).toBe(2)
    expect(entry.quizCounts.translation).toBe(1)
  })

  it('PUT /api/quizzes/:id - cập nhật quiz', async () => {
    const movie = await Movie.create(sampleMovie)
    const q = await Quiz.create({ movieId: movie._id, quizType: 'reading', passage: 'old', questions: [] })

    const res = await request(app)
      .put(`/api/quizzes/${q._id}`)
      .set('Authorization', 'Bearer faketoken')
      .send({ passage: 'new passage' })

    expect(res.statusCode).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.data.passage).toBe('new passage')

    const updated = await Quiz.findById(q._id)
    expect(updated.passage).toBe('new passage')
  })

  it('DELETE /api/quizzes/:id - xóa quiz', async () => {
    const movie = await Movie.create(sampleMovie)
    const q = await Quiz.create({ movieId: movie._id, quizType: 'reading', questions: [] })

    const res = await request(app)
      .delete(`/api/quizzes/${q._id}`)
      .set('Authorization', 'Bearer faketoken')

    expect(res.statusCode).toBe(200)
    const check = await Quiz.findById(q._id)
    expect(check).toBeNull()
  })

  it('POST /api/quizzes/genQuiz - tạo quiz bằng AI (mock)', async () => {
    const res = await request(app)
      .post('/api/quizzes/genQuiz')
      .set('Authorization', 'Bearer faketoken')
      .send({ subtitle: 'some subtitle text', quizType: 'reading' })

    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
    expect(res.body.ok).toBe(true)
    expect(res.body.data).toBeDefined()
    expect(res.body.data.generated).toBe(true)
  })
})