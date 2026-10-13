import express from "express"
import { getDept } from "../controller/department"
const router = express.Router()

router.get("/department", getDept)