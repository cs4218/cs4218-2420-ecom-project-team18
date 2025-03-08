import { jest } from "@jest/globals";
import { 
    createProductController, 
    deleteProductController,
    updateProductController,
    getProductController } from "./productController";
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

describe("Get Product Controller Test", () => {
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
    

});
