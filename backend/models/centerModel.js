import mongoose from "mongoose";

const centerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: String,
    zipcode: String,
    phone: String,
    type: {
      type: String,
      enum: ["recycle", "repair", "both"],
      default: "both",
    },
    location: {
      // Optional: latitude & longitude
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

const Center = mongoose.model("Center", centerSchema);
export default Center;
