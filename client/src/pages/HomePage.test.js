import React from "react";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import HomePage from "./HomePage";
import "@testing-library/jest-dom";

// Mocking dependencies
jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../context/cart", () => ({ useCart: jest.fn() }));
jest.mock("react-router-dom", () => {
    const actualModule = jest.requireActual("react-router-dom");
    return {
        ...actualModule,
        useNavigate: jest.fn(),
    };
});

jest.mock("../components/Layout", () => ({ children }) => <div>{children}</div>);

beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    useNavigate.mockReturnValue(jest.fn());
});

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
});

describe("HomePage Tests", () => {
    test("renders page with product section", async () => {
        useCart.mockReturnValue([[], jest.fn()]);

        axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
        axios.get.mockResolvedValueOnce({ data: { total: 0 } });

        render(<HomePage />);

        expect(screen.getByText(/all products/i)).toBeInTheDocument();
    });

    test("displays products correctly", async () => {
        const testProducts = [{ _id: "1", name: "Desk", price: 120, description: "Wooden desk." }];

        axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
        axios.get.mockResolvedValueOnce({ data: { total: 1 } });
        axios.get.mockResolvedValueOnce({ data: { products: testProducts } });

        render(<HomePage />);

        await waitFor(() => {
            expect(screen.getByText("Desk")).toBeInTheDocument();
        });
    });

    test("adds an item to the cart", async () => {
        const testItem = { _id: "2", name: "Lamp", price: 45, description: "Bright LED lamp." };
        useCart.mockReturnValue([[], jest.fn()]);

        axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
        axios.get.mockResolvedValueOnce({ data: { total: 1 } });
        axios.get.mockResolvedValueOnce({ data: { products: [testItem] } });

        render(<HomePage />);
        await waitFor(() => expect(screen.getByText("Lamp")).toBeInTheDocument());
        fireEvent.click(screen.getByText(/add to cart/i));

        expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });

    test("filters products by category", async () => {
        const categories = [{ _id: "1", name: "Office" }, { _id: "2", name: "Kitchen" }];
        axios.get.mockResolvedValueOnce({ data: { success: true, category: categories } });
        axios.get.mockResolvedValueOnce({ data: { total: 0 } });

        render(<HomePage />);
        await waitFor(() => expect(screen.getByText("Office")).toBeInTheDocument());
        fireEvent.click(screen.getByLabelText("Office"));
        expect(screen.getByLabelText("Office")).toBeChecked();
    });

    test("resets filters correctly", async () => {
        const reloadMock = jest.fn();
        Object.defineProperty(window, "location", {
            value: { reload: reloadMock },
            writable: true,
        });

        axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
        axios.get.mockResolvedValueOnce({ data: { total: 0 } });

        render(<HomePage />);
        fireEvent.click(screen.getByText(/reset filters/i));
        expect(reloadMock).toHaveBeenCalledTimes(1);
    });
});