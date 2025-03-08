import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Order from "../models/orderModel.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await Order.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Order Model Tests", () => {
  let orderData;

  beforeEach(() => {
    orderData = {
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "Credit Card", amount: 100 },
      buyer: new mongoose.Types.ObjectId(),
      status: "Processing",
    };
  });

  test("should create an order with valid data", async () => {
    const order = new Order(orderData);
    const savedOrder = await order.save();

    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.products.length).toBe(1);
    expect(savedOrder.payment.method).toBe("Credit Card");
    expect(savedOrder.status).toBe("Processing");
    expect(savedOrder.createdAt).toBeDefined();
    expect(savedOrder.updatedAt).toBeDefined();
  });

  test("should use default status when not provided", async () => {
    delete orderData.status;
    const order = new Order(orderData);
    const savedOrder = await order.save();

    expect(savedOrder.status).toBe("Not Process");
  });

  test("should reject invalid status values", async () => {
    orderData.status = "InvalidStatus";
    const invalidOrder = new Order(orderData);

    await expect(invalidOrder.save()).rejects.toThrowError(/not a valid enum value/);
  });

  test("should require at least one product", async () => {
    orderData.products = []; 

    const invalidOrder = new Order(orderData);

    await expect(invalidOrder.save()).rejects.toThrowError(/At least one product is required/);
  });

  test("should require a buyer field", async () => {
    delete orderData.buyer; 

    const invalidOrder = new Order(orderData);

    await expect(invalidOrder.save()).rejects.toThrowError(/validation failed/);
  });

  test("should auto-generate timestamps", async () => {
    const order = new Order(orderData);
    const savedOrder = await order.save();

    expect(savedOrder.createdAt).toBeDefined();
    expect(savedOrder.updatedAt).toBeDefined();
    expect(savedOrder.createdAt).toEqual(savedOrder.updatedAt);
  });
});
