import mongoose from "mongoose"

const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
        unique: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default mongoose.model("Department", departmentSchema);