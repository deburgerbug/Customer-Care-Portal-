import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;


const userSchema = new Schema(
  {
    name: {type: String,required: [true, "Name is required"],trim: true,minlength: [2, "Name must contain at least 2 characters"],maxlength: [30, "Name cannot exceed 100 characters"],},
    email: {type: String,required: [true, "Email is required"],unique: true,trim: true,lowercase: true, maxlength: 254,match: [ /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address",],},
    password: {type: String,required: [true, "Password is required"],select: false,minlength: [8, "Password must contain at least 8 characters"],},
    status: {type: String,enum: ["ACTIVE", "BLOCKED"],default: "ACTIVE",required: true,},
    phone: {type: String,required: [true, "Phone number is required"],trim: true,match: [/^\+[1-9]\d{7,14}$/,"Phone must use international format, e.g. +919876543210",],},
    isAdmin: {type: Boolean,default: false,required: true,},},
    
    { timestamps: true }
);

// Hash a new or modified password before saving.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// Use this method during login endpoint.
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ email: 1 }, { unique: true });

const walletSchema = new Schema({
    user: {type: Schema.Types.ObjectId,ref: "WalletUser",required: true,index: true},
    walletName: {type: String,required: [true, "Wallet name is required"],trim: true, minlength: [2, "Wallet name must contain at least 2 characters"], maxlength: [50, "Wallet name cannot exceed 50 characters"]},
    currency: {type: String,enum: ["INR", "USD", "EUR"],default: "INR",immutable: true,required: true,},
    balanceMinor: {type: Number,default: 0,min: [0, "Balance cannot be negative"],max: [100000000, "Maximum wallet balance exceeded"],validate: {validator: Number.isSafeInteger,message: "Balance must be a safe integer in minor units",},required: true},

    status: {type: String,enum: ["ACTIVE", "FROZEN", "CLOSED"],default: "ACTIVE",required: true,},
},

  { timestamps: true }
);

walletSchema.index({ user: 1, createdAt: -1 });



const transactionSchema = new Schema({
    transactionRef: {type: String,required: true,unique: true,immutable: true,},
    type: {type: String,enum: ["DEPOSIT", "WITHDRAWAL", "TRANSFER"],required: true,immutable: true},
    fromWallet: {type: Schema.Types.ObjectId,ref: "Wallet",default: null,immutable: true},
    toWallet: {type: Schema.Types.ObjectId,ref: "Wallet",default: null,immutable: true},
    initiatedBy: {type: Schema.Types.ObjectId,ref: "WalletUser",required: true,immutable: true,},
    amountMinor: {type: Number,required: true, min: [1, "Amount must be at least one minor unit"],max: [10000000, "Transaction amount exceeds the limit"], validate: {validator: Number.isSafeInteger,message: "Amount must be a safe integer in minor units",},immutable: true,},
    currency: {type: String,enum: ["INR", "USD", "EUR"],required: true,immutable: true },
    status: {type: String,enum: ["PENDING", "COMPLETED", "FAILED"],default: "PENDING",required: true},

    description: {type: String,trim: true, maxlength: [200, "Description cannot exceed 200 characters"],default: "" },
    idempotencyKey: {type: String,maxlength: 128,immutable: true},
},

  { timestamps: true }
);

transactionSchema.index({ transactionRef: 1 }, { unique: true });

transactionSchema.index({ fromWallet: 1, createdAt: -1 });
transactionSchema.index({ toWallet: 1, createdAt: -1 });

transactionSchema.index(
  { initiatedBy: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $type: "string" },
    },
  }
);
