import { jest } from "@jest/globals";
import { 
    createProductController, 
    deleteProductController,
    updateProductController } from "./productController";
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
        price: 100,
        category: "123",
        quantity: 10,
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
          price: 1,
          category: "12",
          quantity: 5,
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
            price: 1,
            quantity: 5,
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

})
