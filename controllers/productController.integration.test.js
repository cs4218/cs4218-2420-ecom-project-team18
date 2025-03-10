import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express from "express";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel";
import productRoutes from "../routes/productRoutes";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

let mongoServer;
let app;
let token;

describe("Create/Update/Delete Product Controller Integration Test", () => {

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);

        app = express();
        app.use(express.json());
        app.use("/api/v1/product", productRoutes);

        const findById = jest.spyOn(userModel, 'findById'); //Skip admin verification
        findById.mockImplementation(() => ({
            role: 1
          }));
        const mockUser = { id: "12323", role: 1};     
        token = jwt.sign(mockUser, process.env.JWT_SECRET, { expiresIn: "1h" });
    });
    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
        
    });
    afterEach(async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
          const collection = collections[key];
          await collection.deleteMany();
        }
    });

    test("should return 201 if create product successful", async () => {

        const res = await request(app).post("/api/v1/product/create-product")
        .set("Authorization", `${token}`)
        .field('name', 'product')
        .field('description', 'product description')
        .field('price', '100')
        .field('category', "67b5e29f6e7cd43245697f36")
        .field('quantity', '10')
        .field('shipping', 'true')

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Product Created Successfully");
        expect(res.body.products.name).toBe("product");
        expect(res.body.products.description).toBe("product description");
        expect(res.body.products.price).toBe(100);
        expect(res.body.products.category).toBe("67b5e29f6e7cd43245697f36");
        expect(res.body.products.quantity).toBe(10);
        expect(res.body.products.shipping).toBe(true);
    });

    test("should return 500 when error in create", async () => {

        jest.spyOn(productModel.prototype, "save").mockImplementationOnce(() => {
            throw new Error("Database error");
        });

        const res = await request(app).post("/api/v1/product/create-product")
        .set("Authorization", `${token}`)
        .field('name', 'product')
        .field('description', 'product description')
        .field('price', '100')
        .field('category', "67b5e29f6e7cd43245697f36")
        .field('quantity', '10')
        .field('shipping', 'true');

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Error in creating product");
        expect(res.body.error).toBeDefined();
    });


    test("should return 201 if update product successful", async () => {
        const customObjectId = new mongoose.Types.ObjectId("671cf647ef5cf60493cce8f5");
        await productModel.create({ 
            name: "product-name", 
            slug: "product-name", 
            _id: customObjectId,
            description: "product-description",
            price: 10,
            category: "67b5e29f6e7cd43245697f36",
            quantity: 23,
            shipping: false
        });

        const res = await request(app).put("/api/v1/product/update-product/671cf647ef5cf60493cce8f5")
        .set("Authorization", `${token}`)
        .field('name', 'product-update')
        .field('description', 'product description update')
        .field('price', '100')
        .field('category', "67b5e29f6e7cd43245697f36")
        .field('quantity', '10')
        .field('shipping', 'true');

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Product Updated Successfully");
        expect(res.body.products.name).toBe("product-update");
        expect(res.body.products.slug).toBe("product-update");
        expect(res.body.products.description).toBe("product description update");
        expect(res.body.products.price).toBe(100);
        expect(res.body.products.category).toBe("67b5e29f6e7cd43245697f36");
        expect(res.body.products.quantity).toBe(10);
        expect(res.body.products.shipping).toBe(true);
        
    });

    test("should return 500 if update product error", async () => {
        const customObjectId = new mongoose.Types.ObjectId("671cf647ef5cf60493cce8f5");
        await productModel.create({ 
            name: "product-name", 
            slug: "product-name", 
            _id: customObjectId,
            description: "product-description",
            price: 10,
            category: "67b5e29f6e7cd43245697f36",
            quantity: 23,
            shipping: false
        });

        jest.spyOn(productModel, "findByIdAndUpdate").mockImplementationOnce(() => {
            throw new Error("Database error");
        });

        const res = await request(app).put("/api/v1/product/update-product/671cf647ef5cf60493cce8f5")
        .set("Authorization", `${token}`)
        .field('name', 'product-update')
        .field('description', 'product description update')
        .field('price', '100')
        .field('category', "67b5e29f6e7cd43245697f36")
        .field('quantity', '10')
        .field('shipping', 'true');

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Error in update product");
        
    });

   
    test("should return 200 if delete product successful", async () => {
        const customObjectId = new mongoose.Types.ObjectId("671cf647ef5cf60493cce8f5");
        await productModel.create({ 
            name: "product-name", 
            slug: "product-name", 
            _id: customObjectId,
            description: "product-description",
            price: 10,
            category: "67b5e29f6e7cd43245697f36",
            quantity: 23,
            shipping: false
        });

        const res = await request(app).delete("/api/v1/product/delete-product/671cf647ef5cf60493cce8f5")
        .set("Authorization", `${token}`)

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Product Deleted successfully");
    });

    test("should return 500 if delete product error", async () => {
        jest.spyOn(productModel, "findByIdAndDelete").mockImplementationOnce(() => {
            throw new Error("Database error");
        });
       const customObjectId = new mongoose.Types.ObjectId("671cf647ef5cf60493cce8f5");
        await productModel.create({ 
            name: "product-name", 
            slug: "product-name", 
            _id: customObjectId,
            description: "product-description",
            price: 10,
            category: "67b5e29f6e7cd43245697f36",
            quantity: 23,
            shipping: false
        });

        const res = await request(app).delete("/api/v1/product/delete-product/671cf647ef5cf60493cce8f5")
        .set("Authorization", `${token}`)

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Error while deleting product");
    });
    

})