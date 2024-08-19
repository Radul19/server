import {
  deleteImage,
  deleteImages,
  Image,
  uploadImage,
  uploadImages,
} from "../helpers/uploadImages";
import { RequestHandler } from "express";
import Event from "../models/eventSchema";
import Wod from "../models/wodSchema";
import User from "../models/wodSchema";
// import moment from "moment";
import { EventType, ResultType, WodType } from "../types/event.t";
import { Types } from "mongoose";
const debug = true;
// EVENTS
export const createEvent: RequestHandler = async (req, res) => {
  // if (debug) console.log('#createEvent')
  try {
    const {
      name,
      since,
      dues,
      until,
      place,
      accesible,
      secure_url: s_url,
      categories,
      partners: pimages,
      register_time,
      manual_teams,
    } = req.body;
    const { secure_url, public_id } = await uploadImage({
      secure_url: s_url,
      public_id: "_",
    });
    const partners = await uploadImages(pimages);
    await Event.create({
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

    const results = await Event.find();
    res.send(results);
    // console.log(req.body)
    // res.status(400).json({ msg: 'test' })
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ msg: error.message });
  }
};

export const updateEvent: RequestHandler = async (req, res) => {
  // if (debug) console.log('#updateEvent')
  try {
    const {
      _id,
      name,
      since,
      until,
      dues,
      place,
      accesible,
      categories,
      secure_url: s_url,
      public_id: p_id,
      partners: pimages,
      manual_teams,
      register_time,
    } = req.body;

    const evnt = await Event.findById(_id);
    if (evnt === null || evnt === undefined)
      return res.status(400).json({ msg: "Evento no encontrado" });
    let bool = false;
    categories.forEach((c:any) => {
      c._id = new Types.ObjectId(c._id);
      //@ts-ignore
      // const i = evnt.categories.findIndex(categ => categ._id.toString() === c._id)
      const categ = evnt.categories.find((categ) => categ._id === c._id);
      //@ts-ignore
      if (categ && categ?.teams.length !== c.teams?.length) bool = true;
      //@ts-ignore
      else if (categ && categ?.teams.length === c.teams?.length)
        //@ts-ignore
        c.teams = [...categ.teams];
    });
    if (bool)
      return res.status(400).json({
        msg: "Se ha registrado un equipo nuevo mientras, refrescar la pagina solucionara el problema.",
      });
    const { secure_url, public_id } = await uploadImage({
      secure_url: s_url,
      public_id: p_id,
    });
    const partners = await uploadImages(pimages);
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
    await evnt.save();
    const results = await Event.find();
    res.send(results);

    // console.log(req.body)
    // res.status(400).json({ msg: 'test' })
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ msg: error.message ?? JSON.stringify(error) });
  }
};

export const deleteEvent: RequestHandler = async (req, res) => {
  // if (debug) console.log('#deleteEvent')
  try {
    const { _id, public_id, partners } = req.body;
    const result = await Event.deleteOne({ _id: _id });
    if (result.deletedCount > 0) {
      await deleteImage(public_id);
      await deleteImages(partners);
      return res.send(result);
    } else return res.status(404).json({ msg: "Evento no encontrado" });
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
  res.send("ok");
};

/// WODS
export const updateWods: RequestHandler = async (req, res) => {
  // if (debug) console.log('#namehere')
  try {
    const { wods, toDelete, categories } = req.body;
    const updWod = async (wod: WodType) => {
      const query = wod._id
        ? { _id: wod._id }
        : { category_id: wod.category_id, _id: new Types.ObjectId() };
      const { _id, ...data } = wod;
      return await Wod.findOneAndUpdate(
        query,
        { ...data, $set: { results: [] } },
        { new: true, upsert: true }
      ).lean();
    };
    const delWods = async () => {
      if (toDelete.length > 0) {
        return await Wod.deleteMany({ _id: { $in: toDelete } });
      }
    };
    const result = await Promise.all([
      ...wods.map((w:any) => updWod(w)),
      delWods(),
    ]);
    const findWods = await Wod.find({
      category_id: { $in: categories },
    });
    res.send(findWods);
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ msg: error.message });
  }
};


export const updateResults: RequestHandler = async (req, res) => {
  // if(debug) console.log('#namehere')
  try {
    const { wod_id, results, categories } = req.body;

    const notExist = results.some((team_res:any) => !team_res.team_id);
    if (notExist)
      return res.status(404).json({ msg: "Uno de los equipos no existe" });

    const w = await Wod.findOneAndUpdate(
      { _id: wod_id },
      {
        $set: { results },
      },
      { new: true }
    );
    const wods = await Wod.find({ category_id: { $in: categories } });
    // console.log(wods);
    res.send(wods);
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

export const updateTeams: RequestHandler = async (req, res) => {
  if (debug) console.log("#updateTeams");
  try {
    const { teams, category_id } = req.body;
    let aux = [...teams];
    aux.forEach((team: any, i) => {
      // if(team._id ==='_') aux[i]._id===undefined
      // if(team.captain ==='_') aux[i].captain===undefined
      if (team._id === "_") team._id = undefined;
      if (team.captain === "_") team.captain = undefined;
    });
    await Event.findOneAndUpdate(
      { "categories._id": category_id },
      {
        "categories.$.teams": aux,
      }
    );
    const results = await Event.find();
    res.send(results);
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

export const toggleUpdating: RequestHandler = async (req, res) => {
  if (debug) console.log("#toggleUpdating");
  try {
    const { category_id, state } = req.body;
    const evn = await Event.findOneAndUpdate(
      { "categories._id": category_id },
      {
        "categories.$.updating": state,
      },
      { new: true }
    );
    // console.log(evn);
    if (evn) {
      res.send("ok");
    } else {
      res.status(400).json({ msg: "Evento no encontrado" });
    }
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

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
