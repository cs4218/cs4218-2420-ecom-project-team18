// cart.test.js
import React from "react";
import { render, act } from "@testing-library/react";
import { CartProvider, useCart } from "./cart";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Test component to use the cart hook
const TestComponent = () => {
  const [cart] = useCart();
  return (
    <div data-testid="cart">
      {Array.isArray(cart) ? cart.join(", ") : ""}
    </div>
  );
};

describe("CartProvider", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test("initializes with an empty cart if no cart in localStorage", () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(getByTestId("cart").textContent).toBe("");
  });

  test("initializes with stored cart data from localStorage", () => {
    const storedCart = ["item1", "item2"];
    localStorage.setItem("cart", JSON.stringify(storedCart));

    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(getByTestId("cart").textContent).toBe("item1, item2");
  });

  test("updates cart context correctly", () => {
    const TestUpdateComponent = () => {
      const [cart, setCart] = useCart();
      return (
        <div>
          <div data-testid="cart">
            {Array.isArray(cart) ? cart.join(", ") : ""}
          </div>
          <button
            onClick={() => setCart(["newItem"])}
            data-testid="update-btn"
          >
            Update Cart
          </button>
        </div>
      );
    };

    const { getByTestId } = render(
      <CartProvider>
        <TestUpdateComponent />
      </CartProvider>
    );

    // Initial cart is empty
    expect(getByTestId("cart").textContent).toBe("");

    act(() => {
      getByTestId("update-btn").click();
    });

    // Check that the cart has been updated
    expect(getByTestId("cart").textContent).toBe("newItem");
  });
});
