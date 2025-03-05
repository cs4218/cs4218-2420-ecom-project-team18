import { jest } from "@jest/globals";
import { registerController } from "./authController";
import userModel from "../models/userModel.js";
import {
  loginController,
  forgotPasswordController,
  testController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "./authController";
import orderModel from "../models/orderModel.js";

jest.mock("../models/userModel.js");

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
    expect(res.status).toHaveBeenCalledWith(200);
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
      password: "pass",
      comparePassword: jest.fn().mockResolvedValue(true),
    });
    req.body = { email: "test@example.com", password: "pass" };
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
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
        newPassword: "",
      },
    };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  test("fails if newPassword is missing", async () => {
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("fails if answer is missing", async () => {
    req.body.answer = "";
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("Test Controller Tests", () => {
  test("does not throw error", () => {
    expect(() => testController({}, { send: jest.fn() })).not.toThrow();
  });
});
