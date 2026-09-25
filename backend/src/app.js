import express from 'express'
import cors from 'cors'
import customerRoutes from "./routes/customer.routes.js"
import authRoutes from "./routes/auth.routes.js"
import { errorMiddleware } from './middleware/error.middleware.js'
const app = express()
app.use(express.json())
app.use(cors())

app.get("/check",(req,res)=>{
    res.json({
        message: "Checking server connection "
    })
})

app.use("/auth", authRoutes)
app.use("/customers", customerRoutes)

app.use(errorMiddleware)
export default app;