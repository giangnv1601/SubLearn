import { jest } from '@jest/globals'

await jest.unstable_mockModule('../../src/services/JwtService.js', () => ({
  JwtService: {
    generateToken: jest.fn(),
    // verifyToken resolves to a simple payload so auth middleware passes
    verifyToken: jest.fn().mockResolvedValue({ id: 'test-user-id' }),
  },
}))

import request from 'supertest'

const { default: app } = await import('../../src/server.js')
const { default: Movie } = await import('../../src/models/movieModel.js')

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

const samplePayload = {
  title: 'Sample Movie',
  slug: 'sample-movie',
  description: 'A test movie',
  thumb_url: 'https://example.com/thumb.jpg',
  poster_url: 'https://example.com/poster.jpg',
  duration: '1h 30m',
  year_released: 2025,
  level: 'medium',
  genre: 'Drama',
  link_m3u8: 'https://example.com/stream.m3u8',
}

describe('API Phim', () => {
  it('POST /api/movies - tạo phim thành công', async () => {
    const res = await request(app).post('/api/movies').send(samplePayload)

    expect(res.statusCode).toBe(201)
    expect(res.body).toBeDefined()
    expect(res.body.title).toBe(samplePayload.title)
    expect(res.body.slug).toBe(samplePayload.slug)

    const inDb = await Movie.findOne({ slug: samplePayload.slug })
    expect(inDb).not.toBeNull()
    expect(inDb.title).toBe(samplePayload.title)
  })

  it('GET /api/movies - trả về danh sách (yêu cầu auth)', async () => {
    // create one
    const created = await Movie.create(samplePayload)

    const res = await request(app)
      .get('/api/movies')
      .set('Authorization', 'Bearer faketoken')

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(1)
    const found = res.body.find((m) => m._id === String(created._id))
    expect(found).toBeDefined()
  })

  it('GET /api/movies/:id - lấy theo id (yêu cầu auth)', async () => {
    const created = await Movie.create(samplePayload)

    const res = await request(app)
      .get(`/api/movies/${created._id}`)
      .set('Authorization', 'Bearer faketoken')

    expect(res.statusCode).toBe(200)
    expect(res.body._id).toBe(String(created._id))
    expect(res.body.title).toBe(samplePayload.title)
  })

  it('GET /api/movies/:id - trả 404 khi không tồn tại', async () => {
    const fakeId = '64b64c0f0000000000000000'
    const res = await request(app)
      .get(`/api/movies/${fakeId}`)
      .set('Authorization', 'Bearer faketoken')

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toBe('Movie not found')
  })

  it('PUT /api/movies/:id - cập nhật phim', async () => {
    const created = await Movie.create(samplePayload)

    const res = await request(app)
      .put(`/api/movies/${created._id}`)
      .send({ ...samplePayload, title: 'Updated Title' })

    expect(res.statusCode).toBe(200)
    expect(res.body.title).toBe('Updated Title')

    const updated = await Movie.findById(created._id)
    expect(updated.title).toBe('Updated Title')
  })

  it('PUT /api/movies/:id - trả 404 khi cập nhật phim không tồn tại', async () => {
    const fakeId = '64b64c0f0000000000000000'
    const res = await request(app)
      .put(`/api/movies/${fakeId}`)
      .send({ title: 'Nope' })

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toBe('Movie not found')
  })

  it('DELETE /api/movies/:id - xóa phim', async () => {
    const created = await Movie.create(samplePayload)

    const res = await request(app).delete(`/api/movies/${created._id}`)

    expect(res.statusCode).toBe(200)
    const check = await Movie.findById(created._id)
    expect(check).toBeNull()
  })

  it('DELETE /api/movies/:id - trả 404 khi xóa phim không tồn tại', async () => {
    const fakeId = '64b64c0f0000000000000000'
    const res = await request(app).delete(`/api/movies/${fakeId}`)

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toBe('Movie not found')
  })
})