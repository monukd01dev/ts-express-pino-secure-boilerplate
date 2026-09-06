import express from "express";
import { healthController } from "../../controllers";
const v1Router = express.Router();

v1Router.get('/health',healthController.healthCheck)


export default v1Router