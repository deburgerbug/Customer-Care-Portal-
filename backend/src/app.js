import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import customerRoutes from "./routes/customer.routes.js"
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import ticketRoutes from "./routes/ticket.routes.js"
import departmentRoutes from "./routes/department.routes.js"
import { errorMiddleware } from './middleware/error.middleware.js'
import { allowedOrigin } from "./config/env.js"
import { requestLogger } from "./middleware/requestLogger.middleware.js"
const app = express()
app.use(helmet())
app.use(requestLogger)
app.use(express.json())
app.use(cors({
    origin: allowedOrigin,
    optionsSuccessStatus: 200
}))

app.get("/check",(req,res)=>{
    res.json({
        message: "Checking server connection "
    })
})

app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/departments", departmentRoutes)
app.use("/customers", customerRoutes)
app.use("/tickets", ticketRoutes)
app.use(errorMiddleware)
export default app;