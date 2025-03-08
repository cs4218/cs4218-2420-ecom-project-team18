import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import Profile from "./Profile";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import useCategory from "../../hooks/useCategory";
import { useSearch } from "../../context/search";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";

// Mock `axios` and `toast`
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../../context/cart", () => ({
    useCart: jest.fn(() => [[]]),
}));
jest.mock("../../hooks/useCategory", () => ({
__esModule: true,
default: jest.fn(() => []),
}));
jest.mock("../../context/search", () => ({
__esModule: true,
useSearch: jest.fn(() => [{ keyword: "", results: [] }, jest.fn()]),
}));
jest.mock("../../components/Layout", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="mock-layout">{children}</div>,
}));

describe("Profile Component", () => {
  const mockUser = {
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "1234567890",
    address: "123 Main St",
  };

  let mockSetAuth;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSetAuth = jest.fn();
    
    useAuth.mockReturnValue([{ user: mockUser, token: "test-token" }, mockSetAuth]);
  });

  test("renders Profile component with user data", async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    expect(screen.getByText(/user profile/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Name")).toHaveValue(mockUser.name);
    expect(screen.getByPlaceholderText("Enter Your Email")).toHaveValue(mockUser.email);
    expect(screen.getByPlaceholderText("Enter Your Phone")).toHaveValue(mockUser.phone);
    expect(screen.getByPlaceholderText("Enter Your Address")).toHaveValue(mockUser.address);
  });

  test("updates form state when user types", async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText("Enter Your Name");
    const phoneInput = screen.getByPlaceholderText("Enter Your Phone");
    const addressInput = screen.getByPlaceholderText("Enter Your Address");
    const passwordInput = screen.getByPlaceholderText("Enter Your Password (Optional)");

    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    fireEvent.change(phoneInput, { target: { value: "9876543210" } });
    fireEvent.change(addressInput, { target: { value: "456 Elm St" } });
    fireEvent.change(passwordInput, { target: { value: "newpassword" } });

    expect(nameInput).toHaveValue("Jane Doe");
    expect(phoneInput).toHaveValue("9876543210");
    expect(addressInput).toHaveValue("456 Elm St");
    expect(passwordInput).toHaveValue("newpassword");
  });

  test("submits form successfully and updates user data", async () => {
    const updatedUser = {
      name: "Jane Doe",
      email: "johndoe@example.com",
      phone: "9876543210",
      address: "456 Elm St",
    };

    axios.put.mockResolvedValueOnce({ data: { updatedUser } });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), { target: { value: "456 Elm St" } });

    fireEvent.click(screen.getByRole("button", { name: /update/i }));

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
      name: "Jane Doe",
      email: "johndoe@example.com",
      phone: "9876543210",
      address: "456 Elm St",
    }));

    expect(mockSetAuth).toHaveBeenCalledWith(expect.objectContaining({ user: updatedUser }));
    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
  });

  test("submits form with password and updates user data", async () => {
    const updatedUser = {
      name: "Jane Doe",
      email: "johndoe@example.com",
      phone: "9876543210",
      address: "456 Elm St",
    };

    axios.put.mockResolvedValueOnce({ data: { updatedUser } });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Your Password (Optional)"), { target: { value: "newpassword" } });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
      name: "John Doe",
      email: "johndoe@example.com",
      phone: "1234567890",
      address: "123 Main St",
      password: "newpassword",
    }));

    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
  });

  test("shows error toast when API call fails", async () => {
    axios.put.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /update/i }));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });
});
