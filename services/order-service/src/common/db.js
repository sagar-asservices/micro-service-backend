import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    console.log("📊✅ Connected to ORDER database");
  } catch (error) {
    console.error("📊❌ Error while connecting to db", error);
  }
};

export default connectDB;
