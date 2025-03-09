import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Categories from "./Categories";
import '@testing-library/jest-dom';
import useCategory from "../hooks/useCategory";

// Mock the custom hook so we can control its return value in tests.
jest.mock("../hooks/useCategory");

// Optionally, mock the Layout component to simplify testing.
jest.mock("../components/Layout", () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));

describe("Categories component", () => {
  test("renders all categories with links", () => {
    // Arrange: Provide fake categories from the hook.
    const fakeCategories = [
      { _id: "1", name: "Electronics", slug: "electronics" },
      { _id: "2", name: "Fashion", slug: "fashion" },
    ];
    useCategory.mockReturnValue(fakeCategories);

    // Act: Render the component wrapped in MemoryRouter.
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    // Assert: The Layout title is rendered.
    expect(screen.getByText("All Categories")).toBeInTheDocument();

    // Assert: Each category is rendered with a correct link.
    fakeCategories.forEach((cat) => {
      const categoryLink = screen.getByText(cat.name);
      expect(categoryLink).toBeInTheDocument();
      expect(categoryLink.closest("a")).toHaveAttribute(
        "href",
        `/category/${cat.slug}`
      );
    });
  });

  test("renders empty state when no categories available", () => {
    // Arrange: Return an empty array from the hook.
    useCategory.mockReturnValue([]);

    // Act: Render the component wrapped in MemoryRouter.
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    // Assert: The title is still rendered.
    expect(screen.getByText("All Categories")).toBeInTheDocument();

    // Assert: No category links should be rendered.
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
