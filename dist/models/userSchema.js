"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    shirt: { type: String, required: true },
    birth: { type: String, required: true },
    password: { type: String, required: true },
    card_id: { type: String, required: true },
    phone: { type: String, required: true },
    genre: { type: String, enum: ['Masculino', 'Femenino'], required: true },
    location: {
        country: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
    },
    box: String,
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('User', UserSchema);
//# sourceMappingURL=userSchema.js.map