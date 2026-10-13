import app from "./app.js"
import { connectDB } from "./config/db.js"
import { seedAdminAccount } from "./utils/seeder.js"
import {env} from "./config/env.js"

await connectDB();
await seedAdminAccount();

app.listen(env.PORT, ()=>{
    console.log(`Server listening on port ${env.PORT}`)
});
