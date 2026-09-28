import 'dotenv/config'
import app from "./app.js"
import { connectDB } from "./config/db.js"
import { seedAdminAccount } from "./utils/seeder.js"

const port = process.env.PORT || 3000

await connectDB();
await seedAdminAccount();

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`)
});
