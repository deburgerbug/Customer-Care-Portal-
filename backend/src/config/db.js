import mongoose from 'mongoose'
import { env } from './env.js';

dns.setServers(['1.1.1.1', '8.8.8.8' ]);

await mongoose.connect(env.MONGO_URI, {
    family:4
});