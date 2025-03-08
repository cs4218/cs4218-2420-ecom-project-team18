import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { BrowserRouter } from "react-router-dom"; 
import SearchInput from "./SearchInput";
import { useSearch } from "../../context/search";

// Mock `useSearch`
jest.mock("../../context/search", () => ({
  useSearch: jest.fn(),
}));

describe("SearchInput Component", () => {
  let setValues;
  let values;

  beforeEach(() => {
    setValues = jest.fn();
    values = { keyword: "", results: [] };

    useSearch.mockReturnValue([values, setValues]);
  });

  it("renders search input and button", () => {
    const { getByRole, getByPlaceholderText } = render(
      <BrowserRouter> 
        <SearchInput />
      </BrowserRouter>
    );

    expect(getByRole("button", { name: /search/i })).toBeInTheDocument();
    expect(getByPlaceholderText("Search")).toBeInTheDocument();
    expect(getByPlaceholderText("Search").value).toBe("");
  });

  it("updates input value on change", async () => {
    const { getByPlaceholderText } = render(
      <BrowserRouter> 
        <SearchInput />
      </BrowserRouter>
    );

    const input = getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "Laptop" } });

    await waitFor(() => {
      expect(setValues).toHaveBeenCalledWith({ keyword: "Laptop", results: [] });
    });
  });

  it("calls handleSubmit when submit is pressed", async () => {
    const { getByRole, getByPlaceholderText } = render(
      <BrowserRouter> 
        <SearchInput />
      </BrowserRouter>
    );

    const input = getByPlaceholderText("Search");
    const searchButton = getByRole("button", { name: /search/i });

    fireEvent.change(input, { target: { value: "Laptop" } });
    await waitFor(() => fireEvent.click(searchButton));

    expect(setValues).toHaveBeenCalledWith({ keyword: "Laptop", results: [] });
  });
});
