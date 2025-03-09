import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import useCategory from "./useCategory";

// Mock axios
jest.mock("axios");

describe("useCategory Hook", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("fetches and returns categories successfully", async () => {
    const mockCategories = [{ _id: "1", name: "Electronics" }, { _id: "2", name: "Books" }];
    axios.get.mockResolvedValueOnce({ data: { category: mockCategories } });

    const { result } = renderHook(() => useCategory());

    // Wait for state update
    await waitFor(() => expect(result.current).toEqual(mockCategories));

    expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
  });

  test("handles API errors gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    const { result } = renderHook(() => useCategory());

    await waitFor(() => expect(result.current).toEqual([]));

    expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
  });
});
