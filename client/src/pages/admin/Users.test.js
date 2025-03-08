import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import Users from "./Users";
import "@testing-library/jest-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import useCategory from "../../hooks/useCategory";
import { useSearch } from "../../context/search";

// Mock axios
jest.mock("axios");
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

describe("Users Component", () => {
  const mockUsers = [
    {
      _id: "user123",
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      address: "123 Main St, NY",
      role: 0,
    },
    {
      _id: "admin456",
      name: "Jane Admin",
      email: "admin@example.com",
      phone: "9876543210",
      address: "456 Elm St, CA",
      role: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Users component and fetches users correctly", async () => {
    axios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
  
    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );
  
    // Ensure API is called
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/get-users"));
  
    // Debugging: Ensure API call is actually returning the correct data
    console.log("Mock Users:", mockUsers);
  
    // 🔹 Instead of directly checking for "John Doe", ensure users table is rendered first
    await waitFor(() => {
      expect(screen.getByText(/All Users/i)).toBeInTheDocument();
    });
  
    // 🔹 Search more flexibly for "John Doe" by checking table rows instead
    await waitFor(() => {
      const userRow = screen.getByText((content, element) =>
        element.tagName.toLowerCase() === "td" && content.includes("John Doe")
      );
      expect(userRow).toBeInTheDocument();
    });
  
    expect(screen.getByText(/admin@example.com/i)).toBeInTheDocument();
  });

  test("displays 'No users found' when API returns empty list", async () => {
    axios.get.mockResolvedValueOnce({ data: { users: [] } });

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    expect(screen.getByText(/No users found/i)).toBeInTheDocument();
  });

  test("handles API errors gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // Ensure the component renders without crashing
    expect(screen.getByText(/All Users/i)).toBeInTheDocument();
  });
});
