const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/vkit", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected Successfully");
}).catch((err) => {
    console.error("MongoDB Connection Error:", err);
});

const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model("User", userSchema);
