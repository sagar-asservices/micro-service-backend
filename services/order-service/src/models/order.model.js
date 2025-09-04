import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user"
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      require: true
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Failed"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

const orderModel = mongoose.model("order", orderSchema);
export default orderModel;
