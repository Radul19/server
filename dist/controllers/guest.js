"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestEvent = exports.cleanDupl = exports.searchTeam = exports.toggleUpdating = exports.getWods = exports.getEventPlusWods = exports.getEventsPlusTeams = exports.getEvents = exports.test = void 0;
const eventSchema_1 = __importDefault(require("../models/eventSchema"));
const t_1 = __importDefault(require("../models/t"));
const dotenv_1 = __importDefault(require("dotenv"));
const wodSchema_1 = __importDefault(require("../models/wodSchema"));
dotenv_1.default.config();
const debug = false;
const test = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (debug)
        console.log('#test');
    // const result = await Event.find({ _id: "6656396c8f027cee3e114e68", 'categories.teams': { $exists: true, $type: 'array', $ne: [] } })
    res.send('version 2.0.5');
    // res.send('NOREP ONLINE')
    // res.send(process.env.MONGODB_URI_TEST)
});
exports.test = test;
const getEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (debug)
        console.log('#getEvents');
    try {
        const events = yield eventSchema_1.default.find().lean();
        res.send(events);
    }
    catch (error) {
        res.status(400).json({ msg: error.message });
    }
});
exports.getEvents = getEvents;
const getEventsPlusTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (debug)
        console.log('#getEventsPlusTeams');
    try {
        const events = yield eventSchema_1.default.find();
        const teams = yield t_1.default.find();
        let data = [events, teams];
        res.send(data);
    }
    catch (error) {
        res.status(400).json({ msg: error.message });
    }
});
exports.getEventsPlusTeams = getEventsPlusTeams;
// export const getStart = async (req,res)=>{
//     if(debug) console.log('#getStart')
//     try {
//         const events = await Event.find()
//         let data = [events,+moment()]
//         res.send(data)
//     } catch (error:any) {
//         res.status(400).json({ msg: error.message })
//     }
// }
const getEventPlusWods = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (debug)
        console.log('#getEventPlusWods');
    try {
        const { _id } = req.query;
        const events = yield eventSchema_1.default.find().lean();
        // console.log(events)
        const event = events.find(ev => ev._id.toString() === _id);
        if (event === undefined)
            res.status(404).json({ msg: "Evento no encontrado" });
        else {
            let categories = event.categories.map(c => c._id);
            const wods = yield wodSchema_1.default.find({ category_id: { '$in': categories } });
            // let data = [events, +moment()]
            res.send({ events, wods });
        }
        // res.send("ok")
    }
    catch (error) {
        res.status(400).json({ msg: error.message });
    }
});
exports.getEventPlusWods = getEventPlusWods;
const getWods = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (debug)
        console.log('#getWods');
    try {
        const { categories } = req.body;
        const wods = yield wodSchema_1.default.find({ category_id: { '$in': categories } });
        res.send(wods);
        // res.send("ok")
    }
    catch (error) {
        res.status(400).json({ msg: error.message });
    }
});
exports.getWods = getWods;
const toggleUpdating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (debug)
        console.log('#toggleUpdating');
    try {
        const { event_id, state } = req.body;
        const result = yield eventSchema_1.default.findOneAndUpdate({ _id: event_id }, { $set: { updating: state } });
        res.send(result);
    }
    catch (error) {
        res.status(400).json({ msg: error.message });
    }
});
exports.toggleUpdating = toggleUpdating;
const searchTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (debug)
        console.log('#loginAdmin');
    try {
        const { searchName } = req.body;
        const result = yield t_1.default.find({
            name: new RegExp(searchName, "i")
        });
        res.send(result);
    }
    catch (error) {
        res.status(400).json({ msg: error.message });
    }
});
exports.searchTeam = searchTeam;
const cleanDupl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (debug)
        console.log('#cleanDupl');
    // res.send('ok')
    try {
        const result = yield t_1.default.find();
        result.forEach(teamx => {
            result.forEach((t) => __awaiter(void 0, void 0, void 0, function* () {
                //@ts0ignore
                if (teamx.name === t.name && teamx.category_id === t.category_id && teamx.event_id === t.event_id) {
                    if (teamx.createdAt < t.createdAt) {
                        yield t_1.default.deleteOne({ _id: t._id });
                    }
                }
            }));
        });
        res.send('ok');
    }
    catch (error) {
        res.status(400).json({ msg: error.message });
    }
});
exports.cleanDupl = cleanDupl;
const getLatestEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (debug)
        console.log('#getLatestEvent');
    try {
        const result = yield eventSchema_1.default.find({}).sort({ updatedAt: -1 }).limit(1);
        res.send(result[0]);
    }
    catch (error) {
        res.status(400).json({ msg: error.message });
    }
});
exports.getLatestEvent = getLatestEvent;
// export const namehere = async (req,res)=>{
//     if(debug) console.log('#namehere')
//     try {
//         res.send('ok')
//     } catch (error:any) {
//         res.status(400).json({ msg: error.message })
//     }
//
// }
//# sourceMappingURL=guest.js.map