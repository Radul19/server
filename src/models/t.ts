
import { Schema, model, SchemaTypes } from 'mongoose'
const objId = SchemaTypes.ObjectId

// const wodRes = new Schema({
//     amount_type: { type: String, required: true },
//     time: Number,
//     tiebrake: Number,
//     penalty: Number,
//     amount: {
//         type: SchemaTypes.Decimal128,
//         defautl: 0,
//         get: getDec
//     },
//     id: false,
// }, { toJSON: { getters: true } })

const TeamSchema = new Schema({
    name: String,
    category_id: String,
    event_id: String,
    box: String,
    wods: []
},
    {
        toJSON: { getters: true },
        timestamps: true,
    }
);

function getDec(value:any) {
    if (typeof value !== 'undefined') {
        return parseFloat(value.toString());
    }
    return value;
};

export default model('Team', TeamSchema)