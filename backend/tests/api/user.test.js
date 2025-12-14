import { jest } from '@jest/globals'

await jest.unstable_mockModule('../../src/services/JwtService.js', () => ({
  JwtService: {
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
  },
}));

await jest.unstable_mockModule('../../src/services/CloudinaryService.js', () => ({
  CloudinaryService: {
    streamUpload: jest.fn(),
  },
}));

import request from "supertest";
import bcrypt from "bcrypt";

const { default: app } = await import("../../src/server.js");
const { default: User } = await import("../../src/models/userModel.js");

const {
  connectTestDB,
  disconnectTestDB,
  clearDB,
} = await import("../setupTestDB.js");

const { JwtService } = await import("../../src/services/JwtService.js");

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

afterEach(async () => {
  await clearDB();
  jest.clearAllMocks();
});


// 1. REGISTER
describe("POST /api/users/register", () => {
  it("Đăng ký thành công khi dữ liệu hợp lệ", async () => {
    const payload = {
      email: "test@example.com",
      password: "123456",
      fullname: "Test User",
    };

    const res = await request(app).post("/api/users/register").send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Registration successful");
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(payload.email.toLowerCase());
    expect(res.body.user).not.toHaveProperty("password");

    const userInDb = await User.findOne({ email: payload.email });
    expect(userInDb).not.toBeNull();
    // password đã được hash (không trùng plain text)
    expect(userInDb.password).not.toBe(payload.password);
  });

  it("Trả 400 nếu thiếu email/password/fullname", async () => {
    const res = await request(app).post("/api/users/register").send({
      email: "a@a.com",
      //thiếu password & fullname
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it("Trả 409 nếu email đã tồn tại", async () => {
    await User.create({
      email: "dup@example.com",
      password: "123456",
      fullname: "Old User",
    });

    const res = await request(app).post("/api/users/register").send({
      email: "dup@example.com",
      password: "abcdef",
      fullname: "New User",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Email already exists");
  });
});

// 2. LOGIN
describe("POST /api/users/login", () => {
  it("Đăng nhập thành công với email & password đúng", async () => {
    const plainPassword = "123456";
    const hashed = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      email: "login@example.com",
      password: hashed,
      fullname: "Login User",
      role: "client",
    });

    // Mock JwtService.generateToken
    JwtService.generateToken
      .mockResolvedValueOnce("access-token-mock") // cho accessToken
      .mockResolvedValueOnce("refresh-token-mock"); // cho refreshToken

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "login@example.com", password: plainPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(String(user._id));
    expect(res.body.email).toBe(user.email);
    expect(res.body.role).toBe(user.role);
    expect(res.body.accessToken).toBe("access-token-mock");
    expect(res.body.refreshToken).toBe("refresh-token-mock");
    expect(JwtService.generateToken).toHaveBeenCalledTimes(2);
  });

  it("Trả 401 nếu email không tồn tại", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "notfound@example.com", password: "123456" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("Trả 401 nếu mật khẩu sai", async () => {
    const hashed = await bcrypt.hash("correct", 10);

    await User.create({
      email: "user@example.com",
      password: hashed,
      fullname: "User",
    });

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "user@example.com", password: "wrong" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });
});
