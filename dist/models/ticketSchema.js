"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const objId = mongoose_1.SchemaTypes.ObjectId;
const TicketSchema = new mongoose_1.Schema({
    event: { type: String, required: true },
    category: { type: String, required: true },
    category_id: { type: String, required: true },
    users: { type: [objId], ref: "User", required: true },
    phone: { type: String, required: true },
    name: { type: String, required: true },
    dues: { type: [{
                secure_url: { type: String, required: true },
                public_id: { type: String, required: true },
                transf: { type: String, required: true },
                payDues: { type: Number, required: true },
            }], required: true },
    duesLimit: { type: Number, required: true },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('Ticket', TicketSchema);
//# sourceMappingURL=ticketSchema.js.map