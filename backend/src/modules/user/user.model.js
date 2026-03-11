import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },

    name: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 50
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^\S+@\S+\.\S+$/
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },

    phone: String,

    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zip: String
    },

    role: {
        type: String,
        enum: ["user", "staff", "admin"],
        default: "user"
    }

}, { timestamps: true });

userSchema.pre("validate", function () {
    if (!this.name && this.username) {
        this.name = this.username;
    }
});

userSchema.pre("save", async function (next) {

    if (!this.isModified("password"))
        return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);