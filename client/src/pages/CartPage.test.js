// CartPage.test.js
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import CartPage from "./CartPage";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// --- Mock localStorage ---
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: true });

// --- Mocks for context, navigation, axios, toast, and DropIn ---
jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
}));
// Mock the DropIn component to immediately provide an instance with a fake requestPaymentMethod
jest.mock("braintree-web-drop-in-react", () => {
  const React = require("react"); // Import React here
  return function DropIn(props) {
    React.useEffect(() => {
      if (props.onInstance) {
        props.onInstance({
          requestPaymentMethod: jest.fn().mockResolvedValue({ nonce: "fake-nonce" }),
        });
      }
    }, []); // Run only once on mount
    return <div data-testid="dropin" />;
  };
});

// Mock Layout to simply render its children
jest.mock("./../components/Layout", () => ({ children }) => <div>{children}</div>);

describe("CartPage", () => {
  let mockSetCart;
  let mockNavigate;

  beforeEach(() => {
    // Clear our mocks and localStorage before each test.
    localStorageMock.clear();
    jest.clearAllMocks();
    mockSetCart = jest.fn();
    // Default: guest user and empty cart
    useAuth.mockReturnValue([{ user: null, token: null }, jest.fn()]);
    useCart.mockReturnValue([[], mockSetCart]);
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test("renders empty cart message for guest user", async () => {
    // Simulate token fetching for DropIn (even though it won't be used for guests)
    axios.get.mockResolvedValueOnce({ data: { clientToken: "fake-token" } });

    render(<CartPage />);

    // Expect greeting for guest and message indicating the cart is empty.
    await waitFor(() => {
      expect(screen.getByText(/Your Cart Is Empty/)).toBeInTheDocument();
    });
    expect(screen.getByText("Hello Guest")).toBeInTheDocument();
  });

  test("renders cart items and removes an item", async () => {
    // Simulate a logged-in user.
    useAuth.mockReturnValue([{ user: { name: "John Doe" }, token: "valid-token" }, jest.fn()]);
    // Provide a cart with one product.
    const cartItem = { _id: "1", name: "Test Product", description: "Test Description", price: 100 };
    useCart.mockReturnValue([[cartItem], mockSetCart]);
    axios.get.mockResolvedValueOnce({ data: { clientToken: "fake-token" } });

    render(<CartPage />);

    // Verify product details are rendered.
    expect(screen.getByText("Test Product")).toBeInTheDocument();

    // Click the "Remove" button.
    const removeBtn = screen.getByText("Remove");
    fireEvent.click(removeBtn);

    // removeCartItem creates a new cart (without the removed item) and calls setCart.
    expect(mockSetCart).toHaveBeenCalledWith([]);
    // Also, localStorage should be updated with the new (empty) cart.
    expect(localStorage.setItem).toHaveBeenCalledWith("cart", JSON.stringify([]));
  });

  test("handles payment successfully", async () => {
    // Simulate a logged-in user with an address and a non-empty cart.
    useAuth.mockReturnValue([
      { user: { name: "John Doe", address: "123 Street" }, token: "valid-token" },
      jest.fn(),
    ]);
    const cartItem = { _id: "1", name: "Test Product", description: "Test Description", price: 200 };
    useCart.mockReturnValue([[cartItem], mockSetCart]);

    // Simulate fetching a client token and successful payment post.
    axios.get.mockResolvedValueOnce({ data: { clientToken: "fake-token" } });
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<CartPage />);

    // Wait for DropIn to render, which means clientToken has been set and instance provided.
    await waitFor(() => {
      expect(screen.getByTestId("dropin")).toBeInTheDocument();
    });

    // "Make Payment" button should now be enabled.
    const payBtn = screen.getByText("Make Payment");
    expect(payBtn).toBeInTheDocument();

    // Simulate clicking the payment button.
    await act(async () => {
      fireEvent.click(payBtn);
    });

    // Verify that the payment API was called with the expected payload.
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/product/braintree/payment", {
        nonce: "fake-nonce",
        cart: [cartItem],
      });
    });

    // Payment success should remove the cart.
    expect(localStorage.removeItem).toHaveBeenCalledWith("cart");
    expect(mockSetCart).toHaveBeenCalledWith([]);

    // Navigation to the orders page should occur.
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");

    // A success toast should be displayed.
    expect(toast.success).toHaveBeenCalledWith("Payment Completed Successfully ");
  });
});
