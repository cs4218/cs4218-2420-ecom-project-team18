import { jest } from "@jest/globals";
import { 
    createProductController, 
    deleteProductController,
    updateProductController,
    getProductController,
    getSingleProductController,
    productPhotoController,
    productFiltersController,
    productCountController,
    productListController,
    searchProductController } from "./productController";
import productModel from "../models/productModel";
import mongoose from "mongoose";

jest.mock("../models/productModel.js");

describe("Create Product Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      fields: {
        name: 'product',
        description: 'product description',
        price: "100",
        category: "123",
        quantity: "10",
        shipping: true,
      },

      files: {
        photo: null,
      },
      
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("product model is saved successfully", async () => {

    productModel.prototype.save = jest.fn()

    await createProductController(req, res);
    expect(productModel.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Created Successfully",
        products: expect.objectContaining({
            description: "product description",
            name: "product",
            price: 100,
            quantity: 10,
            shipping: true,
            slug: "product",
          }),
  })
  });

  test("save product fails with no name, description, price, category, quantity", async () => {
    req = {
        fields: {
          name: null,
          description: null,
          price: null,
          category: null,
          quantity: null,
          shipping: true,
        },
        files: {
          photo: null,
        },
        
      };
    productModel.prototype.save = jest.fn()

    await createProductController(req, res);
    expect(productModel.prototype.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    
  });

  test("delete product successfully", async () => {
    const pid = new mongoose.Types.ObjectId();
    req = {
      params: {
        pid,
      }
    };
    const findByIdAndDeleteMock = jest.spyOn(productModel, 'findByIdAndDelete');
    findByIdAndDeleteMock.mockImplementation((pid) => ({
        _id: pid,
        select: jest.fn(),
      })); 
    

    await deleteProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Deleted successfully",

  })
    
  });

  test("Error when delete product", async () => {
    const pid = new mongoose.Types.ObjectId();
    req = {
      params: {
        pid,
      }
    };
    const findByIdAndDeleteMock = jest.spyOn(productModel, 'findByIdAndDelete');
    findByIdAndDeleteMock.mockImplementation((pid) => ({
        _id: pid,
        select: jest.fn().mockImplementation((photo) => {
            throw new Error("Product not found");
          }),
      })); 
    

    await deleteProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while deleting product",
        error: expect.objectContaining({}),
  })
    
  });

  test("product model is updated successfully", async () => {


    const findByIdAndUpdate = jest.spyOn(productModel, 'findByIdAndUpdate');
    findByIdAndUpdate.mockImplementation((pid, field, nw) => ({
        ...field,
        save: jest.fn(),
      }));

    const pid = new mongoose.Types.ObjectId();
    req = {
        params: {
            pid,
          },
        fields: {
          name: 'productupdate',
          description: 'product description update',
          price: "1",
          category: "12",
          quantity: "5",
          shipping: false,
        },
  
        files: {
          photo: null,
        },
        
      };
    await updateProductController(req, res);
    expect(productModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Updated Successfully",
        products: expect.objectContaining({
            description: "product description update",
            name: "productupdate",
            price: "1",
            quantity: "5",
            shipping: false,
            slug: "productupdate",
            category: "12",
          }),
  })
  });

  test("Update product fails with no name, description, price, category, quantity", async () => {


    const findByIdAndUpdate = jest.spyOn(productModel, 'findByIdAndUpdate');
    findByIdAndUpdate.mockImplementation((pid, field, nw) => ({
        ...field,
        save: jest.fn(),
      }));

    const pid = new mongoose.Types.ObjectId();
    req = {
        params: {
            pid,
          },
        fields: {
          name: null,
          description: null,
          price: null,
          category: null,
          quantity: null,
          shipping: false,
        },
  
        files: {
          photo: null,
        },
        
      };
    await updateProductController(req, res);
    expect(productModel.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);

  });

  test("save product fails with -1 price, quantity", async () => {
    req = {
        fields: {
          name: "testProduct",
          description: "testDescription",
          price: "-1",
          category: "123",
          quantity: "-1",
          shipping: true,
        },
        files: {
          photo: null,
        },
        
      };
    productModel.prototype.save = jest.fn()

    await createProductController(req, res);
    expect(productModel.prototype.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    
  });

  test("save product successfully with price, quantity value of 0", async () => {
    req = {
        fields: {
          name: "testProduct",
          description: "testDescription",
          price: "0",
          category: "123",
          quantity: "0",
          shipping: true,
        },
        files: {
          photo: null,
        },
        
      };
    productModel.prototype.save = jest.fn()

    await createProductController(req, res);
    expect(productModel.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Created Successfully",
        products: expect.objectContaining({
            description: "testDescription",
            name: "testProduct",
            price: 0,
            quantity: 0,
            shipping: true,
            slug: "testProduct",
          }),
  })
    
  });

  test("update product model fails with price, quantity value of -1", async () => {


    const findByIdAndUpdate = jest.spyOn(productModel, 'findByIdAndUpdate');
    findByIdAndUpdate.mockImplementation((pid, field, nw) => ({
        ...field,
        save: jest.fn(),
      }));

    const pid = new mongoose.Types.ObjectId();
    req = {
        params: {
            pid,
          },
        fields: {
          name: 'productupdate',
          description: 'product description update',
          price: "-1",
          category: "12",
          quantity: "-1",
          shipping: false,
        },
  
        files: {
          photo: null,
        },
        
      };
    await updateProductController(req, res);
    expect(productModel.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });


  test("update product model successfully with price, quantity value of 0", async () => {


    const findByIdAndUpdate = jest.spyOn(productModel, 'findByIdAndUpdate');
    findByIdAndUpdate.mockImplementation((pid, field, nw) => ({
        ...field,
        save: jest.fn(),
      }));

    const pid = new mongoose.Types.ObjectId();
    req = {
        params: {
            pid,
          },
        fields: {
          name: 'productupdate',
          description: 'product description update',
          price: "0",
          category: "12",
          quantity: "0",
          shipping: false,
        },
  
        files: {
          photo: null,
        },
        
      };
    await updateProductController(req, res);
    expect(productModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Updated Successfully",
        products: expect.objectContaining({
            description: "product description update",
            name: "productupdate",
            price: "0",
            quantity: "0",
            shipping: false,
            slug: "productupdate",
            category: "12",
          }),
  })
  });

});

describe("Product/Single Product/Photo Controller Test", () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        fields: {
          name: 'product',
          description: 'product description',
          price: "100",
          category: "123",
          quantity: "10",
          shipping: true,
        },
  
        files: {
          photo: null,
        },
        
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });

    test("successful retrieval of all products", async () => {
        const find = jest.spyOn(productModel, 'find');
        const pid = new mongoose.Types.ObjectId();
      
        req = {
          params: {},
          query: {},
        };
      
        const mockProducts = [{
          _id: pid,
          name: "product",
          description: "product description",
          price: "100",
          quantity: "10",
          category: "123",
          shipping: true,
        }];
      
        find.mockImplementation(() => ({
          populate: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockProducts),
        }));
      
      
        await getProductController(req, res);
      
        // Assertions
        expect(productModel.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
              success: true,
              counTotal: mockProducts.length,
              message: "ALlProducts ",
              products: expect.arrayContaining([
                expect.objectContaining({
                  _id: pid,
                  name: "product",
                  description: "product description",
                  price: "100",
                  quantity: "10",
                  category: "123",
                  shipping: true,
                }),
              ]),
            })
        );
    });

    test("handles error when retrieving products", async () => {
        // Mock productModel.find() to throw an error
        const find = jest.spyOn(productModel, "find");
        find.mockImplementation(() => {
          throw new Error("Database connection failed");
        });
      
        req = { params: {}, query: {} };
      
        await getProductController(req, res);
      
        // Assertions
        expect(productModel.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Erorr in getting products",
            error: "Database connection failed",
          })
        );
      });

      test("successful retrieval of a single product", async () => {
        const findOne = jest.spyOn(productModel, "findOne");
        const slug = "test-product";
        const mockProduct = {
          _id: new mongoose.Types.ObjectId(),
          name: "Test Product",
          description: "Test description",
          price: 100,
          quantity: 5,
          category: "123",
          shipping: true,
          slug: slug,
        };
      
        req = { params: { slug } };
      
        findOne.mockImplementation(() => ({
          select: jest.fn().mockReturnThis(),
          populate: jest.fn().mockResolvedValue(mockProduct),
        }));
      
        await getSingleProductController(req, res);
      
        // Assertions
        expect(productModel.findOne).toHaveBeenCalledWith({ slug });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: "Single Product Fetched",
            product: expect.objectContaining({
              _id: mockProduct._id,
              name: "Test Product",
              description: "Test description",
              price: 100,
              quantity: 5,
              category: "123",
              shipping: true,
              slug: slug,
            }),
          })
        );
      });

      test("handles error while getting a single product", async () => {
        const findOne = jest.spyOn(productModel, "findOne");
        const slug = "non-existent-product";
      
        // Mock an error throw
        findOne.mockImplementation(() => {
          throw new Error("Product not found");
        });
      
        req = { params: { slug } };
      
        // Call the controller
        await getSingleProductController(req, res);
      
        // Assertions
        expect(productModel.findOne).toHaveBeenCalledWith({ slug });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Eror while getitng single product",
            error: expect.objectContaining({
              message: "Product not found",  // Expecting the full Error object
            }),
          })
        );
      });

      test("successful retrieval of product photo", async () => {
        const findById = jest.spyOn(productModel, "findById");
        const pid = new mongoose.Types.ObjectId();
      
        // Mock the case where the product is found and has a photo
        const mockProduct = {
          _id: pid,
          photo: {
            data: Buffer.from("some photo data"),
            contentType: "image/jpeg"
          }
        };
      
        // Mock the query chain
        findById.mockReturnValue({
          select: jest.fn().mockResolvedValue(mockProduct),
        });
      
        req = { params: { pid } };
      
        // Mock the response
        res = {
          set: jest.fn(),
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
        };
      
        // Call the controller
        await productPhotoController(req, res);
      
        // Assertions
        expect(productModel.findById).toHaveBeenCalledWith(pid);
        expect(res.set).toHaveBeenCalledWith("Content-type", "image/jpeg");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(mockProduct.photo.data);
      });

      test("should handle error while getting product photo", async () => {
        const findById = jest.spyOn(productModel, "findById");
        const pid = new mongoose.Types.ObjectId();
    
        // Mock the case where an error is thrown
        const errorMessage = "Product not found";
        const error = new Error(errorMessage);
        findById.mockImplementation(() => {
            throw new Error(errorMessage);
        });
    
        req = { params: { pid } };
    
        // Mock the response
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    
        // Call the controller
        await productPhotoController(req, res);
    
        // Assertions
        expect(productModel.findById).toHaveBeenCalledWith(pid);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Erorr while getting photo",
            error: error,  // Ensure the message is sent and not the whole error object
        });
    });

});

describe("Product Filters Controller Tests", () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should filter products based on checked and radio filters", async () => {
        const mockProducts = [{ name: "Product1" }, { name: "Product2" }];
        const checked = ["category1", "category2"];
        const radio = [10, 100];

        req.body = { checked, radio };

        // Mock the productModel.find to return mock products
        productModel.find = jest.fn().mockResolvedValue(mockProducts);

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            category: checked,
            price: { $gte: radio[0], $lte: radio[1] },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: mockProducts,
        });
    });

    test("should filter products based on checked filter only", async () => {
        const mockProducts = [{ name: "Product1" }];
        const checked = ["category1", "category2"];

        req.body = { checked, radio: [] }; // No radio filter

        // Mock the productModel.find to return mock products
        productModel.find = jest.fn().mockResolvedValue(mockProducts);

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({ category: checked });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: mockProducts,
        });
    });

    test("should filter products based on radio filter only", async () => {
        const mockProducts = [{ name: "Product1" }];
        const radio = [10, 100];

        req.body = { checked: [], radio }; // No checked filter

        // Mock the productModel.find to return mock products
        productModel.find = jest.fn().mockResolvedValue(mockProducts);

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            price: { $gte: radio[0], $lte: radio[1] },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: mockProducts,
        });
    });

    test("should return all products when no filters are provided", async () => {
        const mockProducts = [{ name: "Product1" }, { name: "Product2" }];

        req.body = { checked: [], radio: [] }; // No filters

        // Mock the productModel.find to return mock products
        productModel.find = jest.fn().mockResolvedValue(mockProducts);

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: mockProducts,
        });
    });

    test("should handle error while getting filtered products", async () => {
        const errorMessage = "Error while fetching products";
        const error = new Error(errorMessage);
        req.body = { checked: ["category1"], radio: [10, 100] };

        // Mock the productModel.find to throw an error
        productModel.find = jest.fn().mockRejectedValue(new Error(errorMessage));

        await productFiltersController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error WHile Filtering Products",
            error: error,
        });
    });

});

describe("Product Count Controller Tests", () => {
    let req, res;
  
    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });
  
    test("should return the correct product count", async () => {
      const mockTotal = 100; // Mock total count
      // Mock the productModel.estimatedDocumentCount to return the mock total
      productModel.find = jest.fn().mockReturnThis();
      productModel.estimatedDocumentCount = jest.fn().mockResolvedValue(mockTotal);
  
      await productCountController(req, res);
  
      expect(productModel.estimatedDocumentCount).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        total: mockTotal,
      });
    });

    test("should handle error while retrieving product count", async () => {
        const errorMessage = "Error while fetching product count";
        const error = new Error(errorMessage);
        // Mock the productModel.estimatedDocumentCount to throw an error
        productModel.find = jest.fn().mockReturnThis();
        productModel.estimatedDocumentCount = jest.fn().mockRejectedValue(new Error(errorMessage));
    
        await productCountController(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
          message: "Error in product count",
          error: error,
          success: false,
        });
      });

});

describe("productListController", () => {
    let req, res;
  
    beforeEach(() => {
      req = {
        params: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });
  
    test("should return products with pagination", async () => {
      const mockProducts = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Product 1",
          description: "Description 1",
          price: 100,
          quantity: 10,
          category: "Category 1",
          shipping: true,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Product 2",
          description: "Description 2",
          price: 200,
          quantity: 20,
          category: "Category 2",
          shipping: true,
        },
      ]; // Mock product data
      const page = 1;
      const perPage = 6;
  
      // Mock the query chain for productModel
      productModel.find = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockReturnThis();
      productModel.skip = jest.fn().mockReturnThis();
      productModel.limit = jest.fn().mockReturnThis();
      productModel.sort = jest.fn().mockResolvedValue(mockProducts);
  
      // Set the request params with the page number
      req.params.page = page;
  
      await productListController(req, res);
  
      expect(productModel.find).toHaveBeenCalledWith({});
      expect(productModel.skip).toHaveBeenCalledWith((page - 1) * perPage); // Check if skip is called correctly
      expect(productModel.limit).toHaveBeenCalledWith(perPage); // Check if limit is called correctly
      expect(productModel.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: mockProducts,
      });
    });

    test("should handle error during product list retrieval", async () => {
        const errorMessage = "Error fetching product list";
        const error = new Error(errorMessage);
        // Mock the query chain to throw an error
        productModel.find = jest.fn().mockReturnThis();
        productModel.select = jest.fn().mockReturnThis();
        productModel.skip = jest.fn().mockReturnThis();
        productModel.limit = jest.fn().mockReturnThis();
        productModel.sort = jest.fn().mockRejectedValue(new Error(errorMessage));
    
        await productListController(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
          success: false,
          message: "error in per page ctrl",
          error: error,
        });
      });

});

describe("Search Product Controller Tests", () => {
    let req, res;
  
    beforeEach(() => {
      req = {
        params: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
    });
  
    test("should return products that match the search keyword", async () => {
      const keyword = "product";
      const mockProducts = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Product 1",
          description: "Description of product 1",
          price: 100,
          quantity: 10,
          category: "Category 1",
          shipping: true,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Another Product",
          description: "Description of another product",
          price: 150,
          quantity: 20,
          category: "Category 2",
          shipping: true,
        },
      ]; // Mock product data
  
      // Mock the query to return matching products
      productModel.find = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValue(mockProducts);
  
      // Set the request params with the keyword
      req.params.keyword = keyword;
  
      await searchProductController(req, res);
  
      expect(productModel.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      });
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    test("should return an empty array if no products match the search keyword", async () => {
        const keyword = "nonexistentProduct";
        const mockProducts = []; // No matching products
    
        // Mock the query to return no products
        productModel.find = jest.fn().mockReturnThis();
        productModel.select = jest.fn().mockResolvedValue(mockProducts);
    
        // Set the request params with the keyword
        req.params.keyword = keyword;
    
        await searchProductController(req, res);
    
        expect(productModel.find).toHaveBeenCalledWith({
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        });
        expect(res.json).toHaveBeenCalledWith(mockProducts);
      });

      test("should handle error during search", async () => {
        const errorMessage = "Database error";
        const error = new Error(errorMessage);
        // Mock `find` to return an object that supports chaining with `select`
        const mockQuery = { select: jest.fn().mockReturnThis() }; 
        productModel.find = jest.fn().mockReturnValue(mockQuery); // Return the query object with select
        
        // Mock the `find` to reject with an error
        mockQuery.select.mockRejectedValue(new Error(errorMessage));
      
        // Set the request params with the keyword
        req.params.keyword = "product";
      
        await searchProductController(req, res);
      
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
          success: false,
          message: "Error In Search Product API",
          error: error,
        });
      });
      
      

      

});
