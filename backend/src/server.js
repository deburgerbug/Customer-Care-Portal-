import 'dotenv/config'
import app from "./app.js"
import { connectDB } from "./config/db.js" 

const port = process.env.PORT || 3000

await connectDB();

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`)
});
