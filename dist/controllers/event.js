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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUpdating = exports.updateTeams = exports.updateResults = exports.updateWods = exports.deleteEvent = exports.updateEvent = exports.createEvent = void 0;
const uploadImages_1 = require("../helpers/uploadImages");
const eventSchema_1 = __importDefault(require("../models/eventSchema"));
const wodSchema_1 = __importDefault(require("../models/wodSchema"));
const mongoose_1 = require("mongoose");
const debug = true;
// EVENTS
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // if (debug) console.log('#createEvent')
    try {
        const { name, since, dues, until, place, accesible, secure_url: s_url, categories, partners: pimages, register_time, manual_teams, } = req.body;
        const { secure_url, public_id } = yield (0, uploadImages_1.uploadImage)({
            secure_url: s_url,
            public_id: "_",
        });
        const partners = yield (0, uploadImages_1.uploadImages)(pimages);
        yield eventSchema_1.default.create({
            name,
            since,
            until,
            place,
            dues,
            secure_url,
            public_id,
            accesible,
            categories,
            partners,
            register_time,
            manual_teams,
        });
        // res.send(result)
        const results = yield eventSchema_1.default.find();
        res.send(results);
        // console.log(req.body)
        // res.status(400).json({ msg: 'test' })
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ msg: error.message });
    }
});
exports.createEvent = createEvent;
const updateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // if (debug) console.log('#updateEvent')
    try {
        const { _id, name, since, until, dues, place, accesible, categories, secure_url: s_url, public_id: p_id, partners: pimages, manual_teams, register_time, } = req.body;
        const evnt = yield eventSchema_1.default.findById(_id);
        if (evnt === null || evnt === undefined)
            return res.status(400).json({ msg: "Evento no encontrado" });
        let bool = false;
        categories.forEach((c) => {
            var _a, _b;
            c._id = new mongoose_1.Types.ObjectId(c._id);
            //@ts-ignore
            // const i = evnt.categories.findIndex(categ => categ._id.toString() === c._id)
            const categ = evnt.categories.find((categ) => categ._id === c._id);
            //@ts-ignore
            if (categ && (categ === null || categ === void 0 ? void 0 : categ.teams.length) !== ((_a = c.teams) === null || _a === void 0 ? void 0 : _a.length))
                bool = true;
            //@ts-ignore
            else if (categ && (categ === null || categ === void 0 ? void 0 : categ.teams.length) === ((_b = c.teams) === null || _b === void 0 ? void 0 : _b.length))
                //@ts-ignore
                c.teams = [...categ.teams];
        });
        if (bool)
            return res.status(400).json({
                msg: "Se ha registrado un equipo nuevo mientras, refrescar la pagina solucionara el problema.",
            });
        const { secure_url, public_id } = yield (0, uploadImages_1.uploadImage)({
            secure_url: s_url,
            public_id: p_id,
        });
        const partners = yield (0, uploadImages_1.uploadImages)(pimages);
        // console.log(categories)
        evnt.name = name;
        evnt.since = since;
        evnt.until = until;
        evnt.dues = dues;
        evnt.partners = partners;
        evnt.place = place;
        evnt.accesible = accesible;
        //@ts-ignore
        evnt.categories = categories;
        evnt.secure_url = secure_url;
        evnt.public_id = public_id;
        evnt.register_time = register_time;
        evnt.manual_teams = manual_teams;
        yield evnt.save();
        const results = yield eventSchema_1.default.find();
        res.send(results);
        // console.log(req.body)
        // res.status(400).json({ msg: 'test' })
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ msg: (_a = error.message) !== null && _a !== void 0 ? _a : JSON.stringify(error) });
    }
});
exports.updateEvent = updateEvent;
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // if (debug) console.log('#deleteEvent')
    try {
        const { _id, public_id, partners } = req.body;
        const result = yield eventSchema_1.default.deleteOne({ _id: _id });
        if (result.deletedCount > 0) {
            yield (0, uploadImages_1.deleteImage)(public_id);
            yield (0, uploadImages_1.deleteImages)(partners);
            return res.send(result);
        }
        else
            return res.status(404).json({ msg: "Evento no encontrado" });
    }
    catch (error) {
        res.status(400).json({ msg: error.message });
    }
    res.send("ok");
});
exports.deleteEvent = deleteEvent;
/// WODS
const updateWods = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // if (debug) console.log('#namehere')
    try {
        const { wods, toDelete, categories } = req.body;
        const updWod = (wod) => __awaiter(void 0, void 0, void 0, function* () {
            const query = wod._id
                ? { _id: wod._id }
                : { category_id: wod.category_id, _id: new mongoose_1.Types.ObjectId() };
            const { _id } = wod, data = __rest(wod, ["_id"]);
            return yield wodSchema_1.default.findOneAndUpdate(query, Object.assign(Object.assign({}, data), { $set: { results: [] } }), { new: true, upsert: true }).lean();
        });
        const delWods = () => __awaiter(void 0, void 0, void 0, function* () {
            if (toDelete.length > 0) {
                return yield wodSchema_1.default.deleteMany({ _id: { $in: toDelete } });
            }
        });
        const result = yield Promise.all([
            ...wods.map((w) => updWod(w)),
            delWods(),
        ]);
        const findWods = yield wodSchema_1.default.find({
            category_id: { $in: categories },
        });
        res.send(findWods);
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ msg: error.message });
    }
});
exports.updateWods = updateWods;
const updateResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // if(debug) console.log('#namehere')
    try {
        const { wod_id, results, categories } = req.body;
        const notExist = results.some((team_res) => !team_res.team_id);
        if (notExist)
            return res.status(404).json({ msg: "Uno de los equipos no existe" });
        const w = yield wodSchema_1.default.findOneAndUpdate({ _id: wod_id }, {
            $set: { results },
        }, { new: true });
        const wods = yield wodSchema_1.default.find({ category_id: { $in: categories } });
        // console.log(wods);
        res.send(wods);
    }
    catch (error) {
        res.status(400).json({ msg: error.message });
    }
});
exports.updateResults = updateResults;
const updateTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (debug)
        console.log("#updateTeams");
    try {
        const { teams, category_id } = req.body;
        let aux = [...teams];
        aux.forEach((team, i) => {
            // if(team._id ==='_') aux[i]._id===undefined
            // if(team.captain ==='_') aux[i].captain===undefined
            if (team._id === "_")
                team._id = undefined;
            if (team.captain === "_")
                team.captain = undefined;
        });
        yield eventSchema_1.default.findOneAndUpdate({ "categories._id": category_id }, {
            "categories.$.teams": aux,
        });
        const results = yield eventSchema_1.default.find();
        res.send(results);
    }
    catch (error) {
        res.status(400).json({ msg: error.message });
    }
});
exports.updateTeams = updateTeams;
const toggleUpdating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (debug)
        console.log("#toggleUpdating");
    try {
        const { category_id, state } = req.body;
        const evn = yield eventSchema_1.default.findOneAndUpdate({ "categories._id": category_id }, {
            "categories.$.updating": state,
        }, { new: true });
        // console.log(evn);
        if (evn) {
            res.send("ok");
        }
        else {
            res.status(400).json({ msg: "Evento no encontrado" });
        }
    }
    catch (error) {
        res.status(400).json({ msg: error.message });
    }
});
exports.toggleUpdating = toggleUpdating;
// export const migration: RequestHandler = async (req, res) => {
//   if (debug) console.log("#migration");
//   try {
//     const user = await User.find();
//     res.send(user);
//   } catch (error: any) {
//     res.status(400).json({ msg: error.message });
//   }
// };
// export const namehere:RequestHandler = async (req,res)=>{
//     if(debug) console.log('#namehere')
//     try {
//         res.send('ok')
//     } catch (error:any) {
//         res.status(400).json({ msg: error.message })
//     }
//
// export const namehere:RequestHandler = async (req,res)=>{
//     if(debug) console.log('#namehere')
//     try {
//         res.send('ok')
//     } catch (error:any) {
//         res.status(400).json({ msg: error.message })
//     }
//
// }
//# sourceMappingURL=event.js.map