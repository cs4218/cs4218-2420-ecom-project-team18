import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Contact from "./Contact";
import Layout from "./components/Layout";

jest.mock("./../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

describe("Contact Component", () => {
  it("renders contact us title", () => {
    render(<Contact />);
    const title = screen.getByText(/CONTACT US/i);
    expect(title).toBeInTheDocument();
  });

  it("renders contact image", () => {
    render(<Contact />);
    const image = screen.getByAltText(/contactus/i);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/contactus.jpeg");
  });

  it("renders email, phone, and support details", () => {
    render(<Contact />);
    
    const email = screen.getByText(/www.help@ecommerceapp.com/i);
    const phone = screen.getByText(/012-3456789/i);
    const support = screen.getByText(/1800-0000-0000 \(toll free\)/i);

    expect(email).toBeInTheDocument();
    expect(phone).toBeInTheDocument();
    expect(support).toBeInTheDocument();
  });

  it("renders paragraph text", () => {
    render(<Contact />);
    const paragraph = screen.getByText(/For any query or info about product, feel free to call anytime/i);
    expect(paragraph).toBeInTheDocument();
  });
});
