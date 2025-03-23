import { expect, jest } from "@jest/globals";

import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel";
import { GiHeartStake } from "react-icons/gi";
jest.mock("../models/userModel.js");
jest.mock("jsonwebtoken");
jest.mock("../models/orderModel");
jest.unstable_mockModule("../helpers/authHelper.js", () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));

const { comparePassword, hashPassword } = await import(
  "../helpers/authHelper.js"
);

const {
  registerController,
  loginController,
  forgotPasswordController,
  testController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} = await import("./authController");

describe("Register Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  test("returns error if name is missing", async () => {
    req.body = {
      email: "test@example.com",
      password: "password",
      phone: "123",
      address: "Addr",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  test("returns error if email is missing", async () => {
    req.body = {
      name: "Foo",
      password: "password",
      phone: "123",
      address: "Addr",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
  });

  test("returns error if password is missing", async () => {
    req.body = {
      name: "Foo",
      email: "email",
      phone: "123",
      address: "Addr",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
  });

  test("returns error if phone is missing", async () => {
    req.body = {
      name: "Foo",
      password: "password",
      email: "123",
      address: "Addr",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
  });
  test("returns error if address is missing", async () => {
    req.body = {
      name: "Foo",
      password: "password",
      phone: "123",
      email: "email",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
  });
  test("returns error if answer is missing", async () => {
    req.body = {
      name: "Foo",
      password: "password",
      phone: "123",
      address: "Addr",
      email: "email",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
  });

  test("returns error if user already exists", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({});
    req.body = {
      name: "Foo",
      email: "existing@example.com",
      password: "pwd",
      phone: "123",
      address: "Addr",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already Register please login",
    });
  });

  test("registers new user successfully", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null);
    let userObject = {
      id: "123",
      name: "Foo",
      email: "new@example.com",
      phone: "123",
      address: "Addr",
      password: "hashedPwd",
      answer: "Ans",
    };
    jest.spyOn(userModel.prototype, "save").mockResolvedValue(userObject);

    req.body = {
      name: "Foo",
      email: "new@example.com",
      password: "pwd",
      phone: "123",
      address: "Addr",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "User Register Successfully",
      user: userObject,
    });
  });

  test("returns error if there's an unexpected server error", async () => {
    let err = new Error("Database Error");
    userModel.findOne = jest.fn().mockImplementation(() => {
      throw err;
    });
    req.body = {
      name: "Test",
      email: "test@example.com",
      password: "pass",
      phone: "123",
      address: "Addr",
      answer: "Ans",
    };
    console.log = jest.fn().mockImplementation();
    await registerController(req, res);
    expect(console.log).toHaveBeenCalledWith(err);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("Login Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  test("returns error if email is missing", async () => {
    req.body = { password: "pass" };
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns error if password is missing", async () => {
    req.body = { email: "test@example.com" };
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns error if user not found", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null);
    req.body = { email: "nope@example.com", password: "pass" };
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("logs in successfully if credentials are correct", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({
      password: "hashedPassword",
    });
    req.body = { email: "test@example.com", password: "pass" };
    comparePassword.mockResolvedValue(true);
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("cannot log in successfully if credentials are not correct", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({
      password: "hashedPassword",
    });
    req.body = { email: "test@example.com", password: "pass" };
    comparePassword.mockResolvedValue(false);
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("handles unexpected DB error gracefully", async () => {
    let err = new Error("DB error");
    userModel.findOne = jest.fn().mockImplementationOnce(() => {
      throw err;
    });
    req.body = { email: "test@example.com", password: "pass" };
    console.log = jest.fn().mockImplementation();
    await loginController(req, res);

    expect(console.log).toHaveBeenCalledWith(err);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("Forgot Password Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        email: "test@example.com",
        answer: "someAnswer",
        newPassword: "1234",
      },
    };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  test("fails if newPassword is missing", async () => {
    req.body.newPassword = "";
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("fails if answer is missing", async () => {
    req.body.answer = "";
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("fails if email is missing", async () => {
    req.body.email = "";
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("fails if no user is found", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(undefined);
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("successfully resets", async () => {
    req.body.newPassword = "brandNewPassword";
    req.body.answer = "someAnswer";
    userModel.findOne = jest.fn().mockResolvedValue({
      email: "test@example.com",
      answer: "someAnswer",
      password: "oldPassword",
    });
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      email: "test@example.com",
      answer: req.body.answer,
      password: req.body.newPassword,
    });
    hashPassword.mockImplementation((password) => password + "hash");
    await forgotPasswordController(req, res);
    expect(userModel.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
      answer: req.body.answer,
    });
    expect(hashPassword).toHaveBeenCalledWith("brandNewPassword");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("handles unexpected DB error gracefully", async () => {
    let err = new Error("DB error");
    userModel.findOne = jest.fn().mockImplementationOnce(() => {
      throw err;
    });
    console.log = jest.fn().mockImplementation();

    await forgotPasswordController(req, res);
    expect(console.log).toHaveBeenCalledWith(err);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("Test Controller Tests", () => {
  test("does not throw error", () => {
    expect(() => testController({}, { send: jest.fn() })).not.toThrow();
  });
});

describe("Update Profile Controller Tests", () => {
  let req, res, user;

  beforeEach(() => {
    jest.clearAllMocks();

    user = {
      _id: "user123",
      name: "John Doe",
      email: "john@example.com",
      password: "hashedpassword",
      address: "123 Street",
      phone: "1234567890",
    };

    req = {
      user: { _id: "user123" },
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    userModel.findById = jest.fn().mockResolvedValue(user);
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      ...user,
      name: "Updated Name",
    });
  });

  test("Successfully updates the profile", async () => {
    req.body = { name: "Updated Name" };

    await updateProfileController(req, res);

    expect(userModel.findById).toHaveBeenCalledWith("user123");
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "user123",
      expect.objectContaining({ name: "Updated Name" }),
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Profile Updated SUccessfully",
        updatedUser: expect.objectContaining({ name: "Updated Name" }),
      })
    );
  });

  test("Fails when password is too short", async () => {
    req.body.password = "123"; // Invalid password

    await updateProfileController(req, res);

    expect(res.json).toHaveBeenCalledWith({
      error: "Passsword is required and 6 character long",
    });
    expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test("Fails when no user is found", async () => {
    userModel.findById = jest.fn().mockResolvedValue(null); // No user found

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("Handles unexpected database errors gracefully", async () => {
    let error = new Error("Database error");
    userModel.findById = jest.fn().mockImplementationOnce(() => {
      throw error;
    });

    console.log = jest.fn();

    await updateProfileController(req, res);

    expect(console.log).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error WHile Update profile",
      })
    );
  });
});

describe("Order Controllers", () => {
  let req, res, orders;

  beforeEach(() => {
    jest.clearAllMocks();

    orders = [
      {
        _id: "order123",
        products: [{ _id: "product123", name: "Product A" }],
        buyer: { _id: "user123", name: "John Doe" },
        status: "Pending",
        createdAt: new Date(),
      },
    ];

    req = {
      user: { _id: "user123" },
      params: { orderId: "order123" },
      body: { status: "Shipped" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    orderModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
    });

    orderModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      _id: "order123",
      status: "Shipped",
    });
  });

  // Test getOrdersController
  describe("getOrdersController", () => {
    test("Successfully retrieves user orders", async () => {
      const mockPopulate = jest.fn();

      mockPopulate.mockImplementation((arg1, arg2) => {
        if (arg1 === "products" && arg2 === "-photo") {
          return mockQuery;
        }
        if (arg1 === "buyer" && arg2 === "name") {
          return orders;
        }
      });

      const mockQuery = {
        populate: mockPopulate,
      };

      orderModel.find.mockReturnValue(mockQuery);
      await getOrdersController(req, res);

      expect(orderModel.find).toHaveBeenCalledWith({ buyer: "user123" });
      expect(mockPopulate).toHaveBeenNthCalledWith(1, "products", "-photo");
      expect(mockPopulate).toHaveBeenNthCalledWith(2, "buyer", "name");
      expect(res.json).toHaveBeenCalledWith(orders);
    });

    test("Handles errors properly", async () => {
      let err = new Error("Database error");
      orderModel.find.mockImplementationOnce(() => {
        throw err;
      });

      console.log = jest.fn();
      await getOrdersController(req, res);

      expect(console.log).toHaveBeenCalledWith(err);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error While Getting Orders",
        })
      );
    });
  });

  // Test getAllOrdersController
  describe("getAllOrdersController", () => {
    test("Successfully retrieves all orders", async () => {
      orderModel.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(orders),
      });

      await getAllOrdersController(req, res);

      expect(orderModel.find).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith(orders);
    });

    test("Handles errors properly", async () => {
      let err = new Error("Database error");
      orderModel.find.mockImplementationOnce(() => {
        throw err;
      });

      console.log = jest.fn();
      await getAllOrdersController(req, res);

      expect(console.log).toHaveBeenCalledWith(err);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error While Getting Orders",
        })
      );
    });
  });

  // Test orderStatusController
  describe("orderStatusController", () => {
    test("Successfully updates order status", async () => {
      await orderStatusController(req, res);

      expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "order123",
        { status: "Shipped" },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith({
        _id: "order123",
        status: "Shipped",
      });
    });

    test("Handles errors properly", async () => {
      let err = new Error("Database error");
      orderModel.findByIdAndUpdate = jest.fn().mockImplementationOnce(() => {
        throw err;
      });

      console.log = jest.fn();
      await orderStatusController(req, res);

      expect(console.log).toHaveBeenCalledWith(err);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error While Updating Order",
        })
      );
    });
  });
});
