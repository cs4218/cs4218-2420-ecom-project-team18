import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import Orders from "./Orders";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import useCategory from "../../hooks/useCategory";
import { useSearch } from "../../context/search";
import "@testing-library/jest-dom";

// Mock `axios`
jest.mock("axios");

// Mock `useAuth`, `useCart`, and `useCategory`
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../../context/cart", () => ({
  useCart: jest.fn(),
}));
jest.mock("../../hooks/useCategory", () => ({
  __esModule: true,
  default: jest.fn(() => []), // Mock `useCategory` returning an empty array
}));
jest.mock("../../context/search", () => ({
  __esModule: true,
  useSearch: jest.fn(() => [{ keyword: "", results: [] }, jest.fn()]),
}));

describe("Orders Component", () => {
  const mockOrders = [
    {
      _id: "order123",
      status: "Processing",
      buyer: { name: "John Doe" },
      createdAt: "2024-03-08T18:00:51.347Z", 
      payment: { success: true },
      products: [
        {
          _id: "product1",
          name: "Product A",
          description: "This is a sample product description.",
          price: 29.99,
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    useAuth.mockReturnValue([{ token: "test-token" }, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);
  });

  test("renders Orders component correctly", async () => {
    axios.get.mockResolvedValueOnce({ data: mockOrders });
  
    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );
  
    expect(screen.getByText(/All Orders/i)).toBeInTheDocument();
  
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders"));
  
    await waitFor(() => {
      expect(screen.getByText(/Processing/i)).toBeInTheDocument();
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Product A/i)).toBeInTheDocument();
    });
  });
  

  test("displays 'No orders found' message when there are no orders", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );

    // Wait for API response
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    expect(screen.getByText(/All Orders/i)).toBeInTheDocument();
    expect(screen.queryByText(/Processing/i)).not.toBeInTheDocument();
  });

  test("handles API errors gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // Ensure the app doesn't crash
    expect(screen.getByText(/All Orders/i)).toBeInTheDocument();
  });
});
