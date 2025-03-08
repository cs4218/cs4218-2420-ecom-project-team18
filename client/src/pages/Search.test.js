import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { BrowserRouter } from "react-router-dom";
import Search from "./Search";
import { useSearch } from "../context/search";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";

// Mock `useSearch`
jest.mock("../context/search", () => ({
  useSearch: jest.fn(),
}));
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [[]]),
}));
jest.mock("../hooks/useCategory", () => ({
__esModule: true,
default: jest.fn(() => []),
}));

describe("Search Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([{ user: { name: "Test User" }, token: "test-token" }, jest.fn()]);
  });

  it("renders Search component correctly", () => {
    useSearch.mockReturnValue([{ results: [] }]); // No products

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    expect(screen.getByText(/Search Resuts/i)).toBeInTheDocument();
  });

  it("displays 'No Products Found' when there are no results", () => {
    useSearch.mockReturnValue([{ results: [] }]); // No products

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    expect(screen.getByText(/No Products Found/i)).toBeInTheDocument();
  });

  it("renders products correctly when results exist", () => {
    const mockProducts = [
      {
        _id: "product1",
        name: "Laptop",
        description: "A high-performance laptop",
        price: 999.99,
      },
    ];

    useSearch.mockReturnValue([{ results: mockProducts }]);

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    expect(screen.getByText(/Found 1/i)).toBeInTheDocument();
    expect(screen.getByText("Laptop")).toBeInTheDocument();
    expect(screen.getByText(/\$ 999.99/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /More Details/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ADD TO CART/i })).toBeInTheDocument();
  });
});
