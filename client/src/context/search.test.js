import React from "react";
import { render, act } from "@testing-library/react";
import { SearchProvider, useSearch } from "./search";

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

// Test component to use the hook
const TestComponent = () => {
  const [search] = useSearch();
  return <div data-testid="keyword">{search.keyword || "No Keyword"}</div>;
};

describe("SearchProvider", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test("initializes with default search state", () => {
    const { getByTestId } = render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    expect(getByTestId("keyword").textContent).toBe("No Keyword");
  });

  test("updates search context correctly", () => {
    const TestUpdateComponent = () => {
      const [search, setSearch] = useSearch();

      const updateSearch = () => {
        setSearch({ keyword: "React", results: ["Hooks", "Context"] });
      };

      return (
        <div>
          <div data-testid="keyword">{search.keyword || "No Keyword"}</div>
          <button onClick={updateSearch} data-testid="update-btn">
            Update
          </button>
        </div>
      );
    };

    const { getByTestId } = render(
      <SearchProvider>
        <TestUpdateComponent />
      </SearchProvider>
    );

    // Initial state
    expect(getByTestId("keyword").textContent).toBe("No Keyword");

    // Trigger search update
    act(() => {
      getByTestId("update-btn").click();
    });

    // Check updated state
    expect(getByTestId("keyword").textContent).toBe("React");
  });
});
