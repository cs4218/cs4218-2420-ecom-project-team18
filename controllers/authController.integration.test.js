import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";

// Replace with actual model imports:
import userModel from "../models/userModel";
import authRoutes from "../routes/authRoute";
import orderModel from "../models/orderModel";

dotenv.config();

let mongoServer;
let app;
let token;

describe("Auth Controller Integration Tests", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    app = express();
    app.use(express.json());
    app.use("/auth", authRoutes);

    // Mock admin verification if needed:
    const findById = jest.spyOn(userModel, "findById");
    findById.mockImplementation(() => ({ role: 1 }));

    // Sign a test token if needed:
    const mockUser = { id: "12345", role: 1 };
    token = jwt.sign(mockUser, process.env.JWT_SECRET, { expiresIn: "1h" });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });

  test("should log in with valid credentials", async () => {
    // Add a user first:
    let pw = await hashPassword("password");
    let testUser = {
      email: "test@example.com",
      password: pw,
      phone: "123",
      address: "Addr",
      answer: "Ans",
      name: "name",
    };
    (await userModel.create(testUser)).save();

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "password" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("should reject invalid email", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "wronguser", password: "wrongpass" });
    expect(res.statusCode).toBe(404);
  });

  test("should reject invalid password", async () => {
    let pw = await hashPassword("password");
    let testUser = {
      email: "test@example.com",
      password: pw,
      phone: "123",
      address: "Addr",
      answer: "Ans",
      name: "name",
    };
    (await userModel.create(testUser)).save();
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "wrongpass" });
    expect(res.statusCode).toBe(401);
  });

  test("should register a new user", async () => {
    let testUser = {
      email: "test@example.com",
      password: "password",
      phone: "123",
      address: "Addr",
      answer: "Ans",
      name: "name",
    };
    const res = await request(app).post("/auth/register").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("user");
  });

  test("should not register an already registered user", async () => {
    let testUser = {
      email: "test@example.com",
      password: "password",
      phone: "123",
      address: "Addr",
      answer: "Ans",
      name: "name",
    };
    (await userModel.create(testUser)).save();
    const res = await request(app).post("/auth/register").send(testUser);
    expect(res.statusCode).toBe(409);
  });
});

describe("Forget Password Controller Integration Tests", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    app = express();
    app.use(express.json());
    app.use("/auth", authRoutes);

    // Mock admin verification if needed:
    const findById = jest.spyOn(userModel, "findById");
    findById.mockImplementation(() => ({ role: 1 }));

    // Sign a test token if needed:
    const mockUser = { id: "12345", role: 1 };
    token = jwt.sign(mockUser, process.env.JWT_SECRET, { expiresIn: "1h" });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });
  test("should update password if correct answer is given", async () => {
    // Arrange
    let pw = await hashPassword("oldpassword");
    let user = {
      email: "reset@example.com",
      password: pw,
      phone: "123",
      address: "Addr",
      answer: "test",
      name: "ResetUser",
    };
    (await userModel.create(user)).save();

    // Act
    const newPassword = "newPw";
    const res = await request(app).post("/auth/forgot-password").send({
      email: "reset@example.com",
      answer: "test",
      newPassword: newPassword,
    });

    // Assert
    expect(res.statusCode).toBe(200);
    let savedUser = await userModel.findOne({ email: user.email });
    let isPasswordUpdated = await comparePassword(
      newPassword,
      savedUser.password
    );
    expect(isPasswordUpdated).toBe(true);
  });

  test("should not update password if wrong answer is given", async () => {
    // Arrange
    let pw = await hashPassword("oldpassword");
    let user = {
      email: "reset@example.com",
      password: pw,
      phone: "123",
      address: "Addr",
      answer: "test",
      name: "ResetUser",
    };
    (await userModel.create(user)).save();

    // Act
    const newPassword = "newPw";
    const res = await request(app).post("/auth/forgot-password").send({
      email: "reset@example.com",
      answer: "wrongAnswer",
      newPassword: newPassword,
    });

    // Assert
    expect(res.statusCode).toBe(404);
    let savedUser = await userModel.findOne({ email: user.email });
    let isPasswordUpdated = await comparePassword(
      newPassword,
      savedUser.password
    );
    expect(isPasswordUpdated).toBe(false);
  });
  test("should return 404 for invalid user email", async () => {
    // Arrange & Act
    const res = await request(app).post("/auth/forgot-password").send({
      email: "doesnotexist@example.com",
      answer: "randomAnswer",
      newPassword: "newPassword",
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});

describe("Profile and Order Controller Integration Tests", () => {
  let mongoServer;
  let app;
  let userToken;
  let adminToken;
  let userId;
  let orderId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    app = express();
    app.use(express.json());
    app.use("/auth", authRoutes);

    // Mock isAdmin and requireSignIn
    jest.spyOn(userModel, "findById").mockImplementation(async (id) => {
      if (id === "admin123") return { _id: id, role: 1 };
      return { _id: id, role: 0 };
    });

    const productSchema = new mongoose.Schema({
      name: String,
      price: Number,
      photo: {
        type: Buffer,
        default: Buffer.from("test"),
      },
    });

    if (!mongoose.models.Product) {
      mongoose.model("Product", productSchema);
    }
  });

  beforeEach(async () => {
    // Clear collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }

    const user = await userModel.create({
      name: "Profile User",
      email: "profileuser@example.com",
      password: await hashPassword("password123"),
      phone: "1234567890",
      address: "123 Street",
      answer: "blue",
      role: 0,
    });

    userId = user._id;
    userToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET);

    adminToken = jwt.sign({ _id: "admin123" }, process.env.JWT_SECRET);

    const Product = mongoose.model("Product");
    const product = await Product.create({ name: "Test Product", price: 99 });

    const order = await orderModel.create({
      products: [product._id],
      buyer: user._id,
      payment: {},
      status: "Processing",
    });

    orderId = order._id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  test("should update user profile successfully", async () => {
    const res = await request(app)
      .put("/auth/profile")
      .set("Authorization", userToken)
      .send({
        name: "Updated User",
        phone: "1112223333",
        address: "New Address",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.updatedUser.name).toBe("Updated User");
  });

  test("should return error for short password", async () => {
    const res = await request(app)
      .put("/auth/profile")
      .set("Authorization", userToken)
      .send({ password: "123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.error).toBe("Passsword is required and 6 character long");
  });

  test("should get orders for a user", async () => {
    const res = await request(app)
      .get("/auth/orders")
      .set("Authorization", userToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].status).toBe("Processing");
  });

  test("should get all orders as admin", async () => {
    const res = await request(app)
      .get("/auth/all-orders")
      .set("Authorization", adminToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("should update order status", async () => {
    const res = await request(app)
      .put(`/auth/order-status/${orderId}`)
      .set("Authorization", adminToken)
      .send({ status: "Shipped" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("Shipped");
  });
});
