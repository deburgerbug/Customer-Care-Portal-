import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ["primary", "secondary"], required: true },
        address: { type: String, required: true, trim: true },
        pincode: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
    },
    { _id: true }
)

const communicationSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ["primary", "secondary"], required: true },
        countryCode: { type: String, required: true, trim: true },
        mobile: {
            type: String,
            required: true,
            trim: true,
            validate: { //validate Phone no.digits
                validator: function (v) {
                    const code = (this.countryCode || "").trim();
                    if (code === "+91") {
                        return /^\d{10}$/.test(v);
                    }
                    return /^\d{6,15}$/.test(v);
                },
                message: function () {
                    const code = (this.countryCode || "").trim();
                    return code === "+91"
                        ? "Mobile number for India (+91) must be exactly 10 digits"
                        : "Mobile number must be between 6 and 15 digits";
                }
            }
        },
        email: { type: String, required: true, trim: true, lowercase: true },
    },
    { _id: true }
)

//customer Schema
const customerSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        gender: { type: String, enum: ["Male", "Female", "Prefer Not to say"], trim: true },
        dob: { type: Date, required: true },

        addresses: {
            type: [addressSchema],
            required: true,
            validate: {
                validator: (addresses) => addresses.length >= 1,
                message: "At least one address is required"
            }
        },
        communications: {
            type: [communicationSchema],
            required: true,
            validate: {
                validator: (communications) => communications.length >= 1,
                message: "At least one communication record is required"
            },
        },
    },
    {
        timestamps: true
    }
);

const Customer = mongoose.model("Customer", customerSchema)
export default Customer