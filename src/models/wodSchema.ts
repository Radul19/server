import { Schema, model, SchemaTypes } from 'mongoose'
// const objId = SchemaTypes.ObjectId

const wodRes = new Schema({
    team_id: { type: String, required: true },
    users: { type: [String], required: true },
    amount_type: { type: String },
    time: Number,
    tiebrake: Number,
    penalty: Number,
    amount: {
        type: SchemaTypes.Decimal128,
        defautl: 0,
        get: getDec,
    },
}, { toJSON: { getters: true }, id: false })

const WodSchema = new Schema({
    name: { type: String, required: true },
    time_cap: Number,
    amount_cap: Number,
    amount_type: { type: String, required: true },
    wod_type: { type: String, enum: ['AMRAP', 'FORTIME', "RM", "CIRCUITO"], required: true },
    results: { type: [wodRes], default: [] },
    category_id: { type: String, required: true },
    description: { type: String, required: true },
    index: { type: Number, required: true },
}, { toJSON: { getters: true }, id: false })


function getDec(value: number) {
    if (typeof value !== 'undefined') {
        return parseFloat(value.toString());
    }
    return value;
};

export default model('Wod', WodSchema)

