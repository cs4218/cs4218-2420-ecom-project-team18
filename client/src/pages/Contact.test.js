import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Contact from "./Contact";

// Helper function to wrap component with router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Contact Component", () => {
  beforeEach(() => {
    renderWithRouter(<Contact />);
  });

  test("renders Contact Us header", () => {
    const headerElement = screen.getByText(/CONTACT US/i);
    expect(headerElement).toBeInTheDocument();
    expect(headerElement.tagName).toBe("H1");
  });

  test("renders contact information correctly", () => {
    expect(screen.getByText("www.help@ecommerceapp.com")).toBeInTheDocument();
    expect(screen.getByText("012-3456789")).toBeInTheDocument();
    expect(screen.getByText("1800-0000-0000 (toll free)")).toBeInTheDocument();
  });

  test("renders the contact image", () => {
    const image = screen.getByAltText("contactus");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/contactus.jpeg");
  });
});
