import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express from "express";
import categoryModel from "../models/categoryModel";
import userModel from "../models/userModel";
import categoryRoutes from "../routes/categoryRoutes";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

let mongoServer;
let app;
let token;

describe("Create/Update/Delete Category Controller Integration Test", () => {

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);

        app = express();
        app.use(express.json());
        app.use("/api/v1/category", categoryRoutes);

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

    test("should return 201 if create category successful", async () => {
       
        const res = await request(app).post("/api/v1/category/create-category")
        .set("Authorization", `${token}`)
        .set("content-type", "application/json")
        .send({
            name: "Category-test",
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("new category created");
        expect(res.body.category.name).toBe("Category-test");
        expect(res.body.category.slug).toBe("category-test");
    });

    test("should return 500 when error in create", async () => {
        jest.spyOn(categoryModel, "findOne").mockImplementationOnce(() => {
            throw new Error("Database error");
        });

        const res = await request(app).post("/api/v1/category/create-category")
        .set("Authorization", `${token}`)
        .set("content-type", "application/json")
        .send({
          name: "Category-test",
        });

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Error in Category");
        expect(res.body.error).toBeDefined();
    });

    test("should return 200 when category exists", async () => {
        await categoryModel.create({ name: "duplicate-cat", slug: "duplicate-cat" });

        const res = await request(app).post("/api/v1/category/create-category")
        .set("Authorization", `${token}`)
        .set("content-type", "application/json")
        .send({
          name: "duplicate-cat",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Category Already Exisits");
    });

    test("should return 401 when no name", async () => {
    
        const res = await request(app).post("/api/v1/category/create-category")
        .set("Authorization", `${token}`)
        .set("content-type", "application/json")
        .send({});

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Name is required");
    });

    test("should return 200 if update category successful", async () => {
        const customObjectId = new mongoose.Types.ObjectId("671cf647ef5cf60493cce8f5");
        await categoryModel.create({ name: "duplicate-cat", slug: "duplicate-cat", _id: customObjectId });

        const res = await request(app).put("/api/v1/category/update-category/671cf647ef5cf60493cce8f5")
        .set("Authorization", `${token}`)
        .set("content-type", "application/json")
        .send({
            name: "duplicate-cat-update",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Category Updated Successfully");
        expect(res.body.category.name).toBe("duplicate-cat-update");
        expect(res.body.category.slug).toBe("duplicate-cat-update");
    });

    test("should return 500 if update category error", async () => {
        const customObjectId = new mongoose.Types.ObjectId("671cf647ef5cf60493cce8f5");
        await categoryModel.create({ name: "duplicate-cat", slug: "duplicate-cat", _id: customObjectId });
        jest.spyOn(categoryModel, "findByIdAndUpdate").mockImplementationOnce(() => {
            throw new Error("Database error");
        });
        const res = await request(app).put("/api/v1/category/update-category/671cf647ef5cf60493cce8f5")
        .set("Authorization", `${token}`)
        .set("content-type", "application/json")
        .send({
            name: "duplicate-cat-update",
        });

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Error while updating category");
    });

    test("should return 200 if delete category successful", async () => {
        const customObjectId = new mongoose.Types.ObjectId("671cf647ef5cf60493cce8f5");
        await categoryModel.create({ name: "duplicate-cat", slug: "duplicate-cat", _id: customObjectId });
        
        const res = await request(app).delete("/api/v1/category/delete-category/671cf647ef5cf60493cce8f5")
        .set("Authorization", `${token}`)
        .set("content-type", "application/json")
        .send({});

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Category Deleted Successfully");
    });

    test("should return 500 if delete category error", async () => {
        const customObjectId = new mongoose.Types.ObjectId("671cf647ef5cf60493cce8f5");
        await categoryModel.create({ name: "duplicate-cat", slug: "duplicate-cat", _id: customObjectId });
        jest.spyOn(categoryModel, "findByIdAndDelete").mockImplementationOnce(() => {
            throw new Error("Database error");
        });
        const res = await request(app).delete("/api/v1/category/delete-category/671cf647ef5cf60493cce8f5")
        .set("Authorization", `${token}`)
        .set("content-type", "application/json")
        .send({});

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("error while deleting category");
    });

})