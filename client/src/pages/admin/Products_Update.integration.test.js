import React from "react";
import { fireEvent, render, waitFor, screen} from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route} from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Products from "./Products";
import UpdateProduct from "./UpdateProduct";
// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("antd", () => {
  const actualAntd = jest.requireActual("antd");
  const MockSelect = ({
    children,
    onChange,
    "data-testid": testId,
    defaultValue,
  }) => (
    <select
      data-testid={testId}
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );

  MockSelect.Option = ({ children, value }) => (
    <option value={value}>{children}</option>
  );

  return {
    ...actualAntd,
    Select: MockSelect,
  };
});

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => [{ _id: "1", name: "pen", slug: "pen", __v: 0 }]));

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };


describe("Products Pages and Update Product integration", () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
    axios.get.mockImplementation( (url) => {
      if (url === "/api/v1/product/get-product") {
      return Promise.resolve({
        data: {
          success: true,
          counTotal: 6,
          message: "ALlProducts ",
          products: [
        {
            "_id": "1",
            "name": "productname1",
            "slug": "productname1",
            "description": "product1 description",
            "price": 54.99,
            "category": "History",
            "quantity": 200,
            "shipping": true,
            "createdAt": "2024-09-06T17:57:19.992Z",
            "updatedAt": "2024-09-06T17:57:19.992Z",
            "__v": 0
        },
        {
            "_id": "2",
            "name": "productname2",
            "slug": "productname2",
            "description": "product2 description",
            "price": 4.99,
            "category": "Fiction",
            "quantity": 200,
            "shipping": true,
            "createdAt": "2024-09-06T17:57:19.992Z",
            "updatedAt": "2025-02-25T08:24:07.496Z",
            "__v": 0
        }
        ],
      }
  })
  }

  if (url === "/api/v1/product/get-product/productname1") {
    return Promise.resolve({
      data: {
        success: true,
        message: "Single Product Fetched",
        product: 
      {
          "_id": "1",
          "name": "productname1",
          "slug": "productname1",
          "description": "product1 description",
          "price": 54.99,
          "category": {
            "_id": "67b5e28c6e7cd43245697f32",
            "name": "History",
            "slug": "history",
            "__v": 0
        },
          "quantity": 200,
          "shipping": true,
          "createdAt": "2024-09-06T17:57:19.992Z",
          "updatedAt": "2024-09-06T17:57:19.992Z",
          "__v": 0
      }
    }
    })
  }

  if (url === "/api/v1/category/get-category") {
    return Promise.resolve({
      data: {
        success: true,
        message: "All Categories List",
        category:[
        {
          "_id": "67b5e28c6e7cd43245697f32",
          "name": "History",
          "slug": "history",
          "__v": 0
      },
      {
        "_id": "67b5e28c6e7cd43245697f33",
        "name": "Fiction",
        "slug": "fiction",
        "__v": 0
    },

    ]
    }
    })
  }
  })
    
  });

  it("Should navigate to Update Product page when product is clicked", async () => {
    
    const {getByDisplayValue, getByRole, getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin/product"]}>
        <Routes>
          <Route path="/dashboard/admin/product" element={<Products />} />
          <Route path="/dashboard/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );    
    await waitFor(() => {
    expect(getByText(/productname1/i)).toBeInTheDocument();
    expect(getByText(/product1 description/i)).toBeInTheDocument();
    expect(getByText(/productname2/i)).toBeInTheDocument();
    expect(getByText(/product2 description/i)).toBeInTheDocument();
  });
  
  fireEvent.click(getByText(/productname1/i));

  await waitFor(() => {
    expect(getByDisplayValue('productname1')).toBeInTheDocument();
  });

  expect(getByRole("button", { name: /update product/i })).toBeInTheDocument();
  expect(getByDisplayValue('200')).toBeInTheDocument();
  expect(getByText('Yes')).toBeInTheDocument();
  expect(getByDisplayValue(/54.99/i)).toBeInTheDocument();
  expect(getByRole("button", { name: /delete product/i })).toBeInTheDocument();
  
})

  it("Should navigate to Update Product page when product is clicked and update successfully", async () => {
    axios.put.mockResolvedValue({
      data: {
        success: true,
        message: "Product Updated Successfully",
      },
    }); 
    const {getByDisplayValue, getByRole, getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
        <Routes>
          <Route path="/dashboard/admin/products" element={<Products />} />
          <Route path="/dashboard/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );    
    await waitFor(() => {
    expect(getByText(/productname1/i)).toBeInTheDocument();
    expect(getByText(/product1 description/i)).toBeInTheDocument();
    expect(getByText(/productname2/i)).toBeInTheDocument();
    expect(getByText(/product2 description/i)).toBeInTheDocument();
  });

  fireEvent.click(getByText(/productname1/i));

  await waitFor(() => {
    expect(getByDisplayValue('productname1')).toBeInTheDocument();
  });

  expect(getByRole("button", { name: /update product/i })).toBeInTheDocument();
  expect(getByDisplayValue('200')).toBeInTheDocument();
  expect(getByText('Yes')).toBeInTheDocument();
  expect(getByDisplayValue(/54.99/i)).toBeInTheDocument();
  expect(getByRole("button", { name: /delete product/i })).toBeInTheDocument();

   fireEvent.change(getByPlaceholderText("write a name"), {
            target: { value: "product1updated" },
      });
  
      fireEvent.change(getByPlaceholderText("write a description"), {
          target: { value: "product 1 description updated" },
    });
  
      fireEvent.change(getByPlaceholderText("write a Price"), {
          target: { value: "10" },
      });
  
      fireEvent.change(getByPlaceholderText("write a quantity"), {
          target: { value: "15" },
      });

      fireEvent.click(getByRole("button", { name: /update product/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
        expect(getByText(/productname2/i)).toBeInTheDocument(); // Ensure navigate back to products page
        expect(getByText(/product2 description/i)).toBeInTheDocument();
      });

  })

  it("Should navigate to Update Product page when product is clicked and delete successfully", async () => {
    window.prompt = jest.fn().mockReturnValue(true);
    axios.delete.mockResolvedValue({
      data: {
        success: true,
        message: "Product Deleted Successfully",
      },
    }); 
    const {getByDisplayValue, getByRole, getByText} = render(
      <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
        <Routes>
          <Route path="/dashboard/admin/products" element={<Products />} />
          <Route path="/dashboard/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );    
    await waitFor(() => {
    expect(getByText(/productname1/i)).toBeInTheDocument();
    expect(getByText(/product1 description/i)).toBeInTheDocument();
    expect(getByText(/productname2/i)).toBeInTheDocument();
    expect(getByText(/product2 description/i)).toBeInTheDocument();
  });

  fireEvent.click(getByText(/productname1/i));

  await waitFor(() => {
    expect(getByDisplayValue('productname1')).toBeInTheDocument();
  });

  expect(getByRole("button", { name: /update product/i })).toBeInTheDocument();
  expect(getByDisplayValue('200')).toBeInTheDocument();
  expect(getByText('Yes')).toBeInTheDocument();
  expect(getByDisplayValue(/54.99/i)).toBeInTheDocument();
  expect(getByRole("button", { name: /delete product/i })).toBeInTheDocument();

   fireEvent.click(getByRole("button", { name: /delete product/i }));
   await waitFor(() => {
           expect(window.prompt).toHaveBeenCalledWith(
             "Are You Sure want to delete this product ? "
           );
    });
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Product Deleted Successfully");
        expect(getByText(/productname2/i)).toBeInTheDocument(); // Ensure navigate back to products page
        expect(getByText(/product2 description/i)).toBeInTheDocument();
      });

  })
})