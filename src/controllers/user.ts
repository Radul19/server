import {
  deleteImage,
  deleteImages,
  Image,
  uploadImage,
  uploadImages,
} from "../helpers/uploadImages";
import { RequestHandler } from "express";
import User from "../models/userSchema";
import { UserType } from "../types/user.t";
import moment from "moment";
import { CategoryType, EventType, TeamType } from "../types/event.t";
import Event from "../models/eventSchema";
import Wods from "../models/wodSchema";
import { Document } from "mongoose";
import Admin from "../models/adminSchema";
//@ts-ignore
import bcrypt from "bcrypt";
import Ticket from "../models/ticketSchema";
//@ts-ignore
import nodemailer from "nodemailer";

const debug = true;

export const login: RequestHandler = async (req, res) => {
  if (debug) console.log("#login");
  try {
    const { email, pass } = req.body;

    if (email[0] === "@") {
      // const { username, password } = req.body;
      const adm: any = await Admin.findOne({ username: email });
      if (adm) {
        bcrypt.compare(pass, adm.password).then(function (result:any) {
          if (result) {
            res.send({
              username: adm.username,
              _id: adm._id,
            });
          } else {
            res.status(404).json({ msg: "Usuario o contraseña incorrectos" });
          }
        });
      }
    } else {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ msg: "Correo incorrecto" });
      bcrypt.compare(pass, user.password, function (_: any, result: any) {
        if (!result)
          return res.status(401).json({ msg: "Contraseña incorrecta" });
        //@ts-ignore
        const { passsword: _x, ...allData } = user;
        //@ts-ignore
        return res.send(allData._doc);
      });
    }
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

export const registerUser: RequestHandler = async (req, res) => {
  if (debug) console.log("#register");
  try {
    const {
      name,
      pass,
      email,
      card_id,
      birth,
      box,
      genre,
      location,
      shirt,
      phone,
    } = req.body;
    console.log("something is wird");
    const ifEmail = await User.find({ email: email });
    if (ifEmail.length > 0)
      return res.status(403).json({ msg: "Correo en uso" });
    const ifCard = await User.find({ card_id: card_id });
    if (ifCard.length > 0)
      return res.status(403).json({ msg: "Cédula en uso" });
    else {
      let password = bcrypt.hashSync(pass, bcrypt.genSaltSync(10));
      const result = await User.create({
        password,
        name,
        email,
        shirt,
        card_id,
        genre,
        location,
        box,
        birth,
        phone,
        // birth: moment(new Date(birth)).unix(),
      });
      const { password: _, ...allData } = result;
      //@ts-ignore
      res.send(allData._doc);
    }
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

export const registerTeam: RequestHandler = async (req, res) => {
  // if(debug) console.log('#namehere')
  try {
    // TO DO:
    // age and gender is validated in front -- CHECK THAT EVENT IS NOT 30 MINS OLDER IN FRONT BEFORE UPDATE
    // PLUS: USE GET TO VERIFY USERS CARDS_ID & GET _ID'S
    const { team, category_id } = req.body;

    const result: (EventType & Document) | null = await Event.findOne({
      "categories._id": category_id,
    });
    if (result === null)
      return res.status(404).json({ msg: "Categoría no encontrada" });
    const cindex = result.categories.findIndex(
      (c) => c._id.toString() === category_id
    );

    if (
      (result.categories[cindex].filter?.limit ?? 999) <=
      result.categories[cindex].teams.length
    ) {
      return res.status(403).json({ msg: "Límite de equipos alcanzado" });
    }

    if (result.categories[cindex].teams.some((t) => t.name === team.name)) {
      return res
        .status(403)
        .json({ msg: `El nombre del equipo ya está en uso` });
    }

    let duplUser: string | undefined = undefined;
    result.categories.forEach((c) => {
      c.teams.forEach((t) => {
        t.users.some((u) => {
          if (team.users.includes(u.toString())) {
            duplUser = u.toString();
            return true;
          }
        });
      });
    });
    if (duplUser) {
      const findUser = await User.findById(duplUser, { name: 1 });
      if (findUser)
        return res.status(403).json({
          msg: `El usuario ${findUser.name} ya se encuentra registrado en el evento`,
        });
      else
        return res.status(403).json({
          msg: `El usuario ${duplUser} ya se encuentra registrado en el evento`,
        });
    }

    result.categories[cindex].teams.push(team);
    await result.save();
    return res.send(result);
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

export const getUserRedcords: RequestHandler = async (req, res) => {
  // if(debug) console.log('#namehere')
  try {
    // const filter = {
    //     example: 1,
    // }
    const results = await Wods.find({ "results.users": req.query._id }, {});
    res.send(results);
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

export const createAdmin: RequestHandler = async (req, res) => {
  if (debug) console.log("#createAdmin");
  try {
    const { username, pass } = req.body;
    bcrypt.hash(pass, 7, async (err:any, hash:any) => {
      // Store hash in your password DB.
      const result = await Admin.create({ username, password: hash });
      res.send(result);
    });
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

export const deleteAdmin: RequestHandler = async (req, res) => {
  if (debug) console.log("#deleteAdmin");
  try {
    const { _id } = req.body;
    const result = await Admin.findOneAndDelete({ _id });
    res.send(result);
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

export const registerTicket: RequestHandler = async (req, res) => {
  if (debug) console.log("#registerTicket");
  try {
    const { users, category_id, inputs, image, phone } = req.body;

    const result: (EventType & Document) | null = await Event.findOne({
      "categories._id": category_id,
    });
    let cindex = undefined;
    if (result === null)
      return res.status(404).json({ msg: "Categoría no encontrada" });
    cindex = result.categories.findIndex(
      (c: any) => c._id.toString() === category_id
    );

    if (
      (result.categories[cindex].filter?.limit ?? 999) <=
      result.categories[cindex].teams.length
    ) {
      return res.status(403).json({ msg: "Límite de equipos alcanzado" });
    }

    if (result.categories[cindex].teams.some((t) => t.name === inputs.name)) {
      return res
        .status(403)
        .json({ msg: `El nombre del equipo ya está en uso` });
    }

    let duplUser: string | undefined = undefined;
    result.categories.forEach((c) => {
      c.teams.forEach((t) => {
        t.users.some((u) => {
          if (users.includes(u.toString())) {
            duplUser = u.toString();
            return true;
          }
        });
      });
    });
    if (duplUser) {
      const findUser = await User.findById(duplUser, { name: 1 });
      if (findUser)
        return res.status(403).json({
          msg: `El usuario ${findUser.name} ya se encuentra registrado en el evento`,
        });
      else
        return res.status(403).json({
          msg: `El usuario ${duplUser} ya se encuentra registrado en el evento`,
        });
    }

    const { secure_url, public_id } = await uploadImage({
      secure_url: image,
      public_id: "_",
    });
    const ev = await Event.findOneAndUpdate(
      {
        "categories._id": category_id,
      },
      { $inc: { "categories.$.slots": 1 } },
      { new: true }
    );
    if (ev) {
      await Ticket.create({
        event: result.name,
        category: result.categories[cindex].name,
        category_id: result.categories[cindex]._id,
        users,
        captain: users[0],
        phone,
        name: inputs.name,
        dues: [
          {
            // secure_url: "asd",
            // public_id: "asd",
            secure_url,
            public_id,
            transf: inputs.transf,
            payDues: inputs.payDues,
          },
        ],
        duesLimit: ev.dues,
      });

      // this is to save
      // result.categories[cindex].teams.push(users);
      // await result.save();

      return res.send({ msg: "Solicitud enviada con exito!" });
    } else res.status(404).json({ msg: "Evento no encontrado" });
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

export const checkUsers: RequestHandler = async (req, res) => {
  if (debug) console.log("#checkUser");
  try {
    const { captain, card_2, card_3, card_4, category } = req.body;
    let auxFem = 0;
    let auxMal = 0;
    let am = category.filter?.age_min;
    let amax = category.filter?.age_max;

    let age_max = amax
      ? new Date(
          `${2024 - amax}-${new Date().getMonth()}-${new Date().getDay()}`
        )
      : undefined;
    let age_min = am
      ? new Date(`${2024 - am}-${new Date().getMonth()}-${new Date().getDay()}`)
      : undefined;

    let users_id = [captain._id];

    if (captain) {
      if (category.filter?.male || category.filter?.female) {
        if (captain.genre === "Masculino") auxMal += 1;
        else auxFem += 1;
      }
      if (age_min && new Date(captain.birth) > age_min) {
        return res.status(403).json({
          msg: `Usuario ${captain.name} no cumple con la edad necesaria para participar.`,
        });
      } else if (age_max && new Date(captain.birth) < age_max) {
        return res.status(403).json({
          msg: `Usuario ${captain.name} excede la edad necesaria para participar.`,
        });
      }
    }

    if (card_2) {
      const fu2 = await User.findOne({ card_id: card_2 });
      if (fu2) {
        users_id.push(fu2._id.toString());
        if (category.filter?.male || category.filter?.female) {
          if (fu2.genre === "Masculino") auxMal += 1;
          else auxFem += 1;
        }
        if (age_min && new Date(fu2.birth) > age_min) {
          return res.status(403).json({
            msg: `Usuario ${fu2.name} no cumple con la edad necesaria para participar.`,
          });
        } else if (age_max && new Date(fu2.birth) < age_max) {
          return res.status(403).json({
            msg: `Usuario ${fu2.name} excede la edad necesaria para participar.`,
          });
        }
      } else {
        return res
          .status(403)
          .json({ msg: `Usuario con C.I: ${card_2} no encontrado.` });
      }
    }
    if (card_3) {
      const fu3 = await User.findOne({ card_id: card_2 });
      if (fu3) {
        users_id.push(fu3._id.toString());
        if (category.filter?.male || category.filter?.female) {
          if (fu3.genre === "Masculino") auxMal += 1;
          else auxFem += 1;
        }
        if (age_min && new Date(fu3.birth) > age_min) {
          return res.status(403).json({
            msg: `Usuario ${fu3.name} no cumple con la edad necesaria para participar.`,
          });
        } else if (age_max && new Date(fu3.birth) < age_max) {
          return res.status(403).json({
            msg: `Usuario ${fu3.name} excede la edad necesaria para participar.`,
          });
        }
      } else {
        return res
          .status(403)
          .json({ msg: `Usuario con C.I: ${card_3} no encontrado.` });
      }
    }
    if (card_4) {
      const fu4 = await User.findOne({ card_id: card_2 });
      if (fu4) {
        users_id.push(fu4._id.toString());
        if (category.filter?.male || category.filter?.female) {
          if (fu4.genre === "Masculino") auxMal += 1;
          else auxFem += 1;
        }
        if (age_min && new Date(fu4.birth) > age_min) {
          return res.status(403).json({
            msg: `Usuario ${fu4.name} no cumple con la edad necesaria para participar.`,
          });
        } else if (age_max && new Date(fu4.birth) < age_max) {
          return res.status(403).json({
            msg: `Usuario ${fu4.name} excede la edad necesaria para participar.`,
          });
        }
      } else {
        return res
          .status(403)
          .json({ msg: `Usuario con C.I: ${card_4} no encontrado.` });
      }
    }

    if (category.filter?.male && auxMal > category.filter?.male) {
      return res
        .status(403)
        .json({ msg: `Exceso de participantes masculinos en el equipo.` });
    } else if (category.filter?.female && auxFem > category.filter?.female) {
      return res
        .status(403)
        .json({ msg: `Exceso de participantes femeninos en el equipo.` });
    } else {
      res.send(users_id);
    }
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

export const getTickets: RequestHandler = async (req, res) => {
  if (debug) console.log("#getTickets");
  try {
    const results = await Ticket.find().populate("users", "name");
    res.send(results);
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

export const pushTicket: RequestHandler = async (req, res) => {
  if (debug) console.log("#pushTicket");
  try {
    const { captain_id, transf, payDues, img } = req.body;
    const ticket = await Ticket.findOne({ users: captain_id });
    if (ticket) {
      const { secure_url, public_id } = await uploadImage({
        secure_url: img,
        public_id: "_",
      });
      // console.log(secure_url, public_id);
      ticket.dues.push({
        secure_url,
        public_id,
        transf,
        payDues,
      });
      await ticket.save();
      res.send("ok");
    } else {
      res.status(404).json({ msg: "No se ha encontrado un pago anterior." });
    }
    // res.send("ok");
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

// var transporter = nodemailer.createTransport({
//   service: "yahoo",
//   auth: {
//     user: "norep.code@yahoo.com",
//     pass: "Crossfit2024",
//   },
// });

// var mailOptions = {
//   from: 'youremail@gmail.com',
//   to: 'myfriend@yahoo.com',
//   subject: 'Sending Email using Node.js',
//   text: 'That was easy!'
// };

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });

export const approveTicket: RequestHandler = async (req, res) => {
  if (debug) console.log("#approveTicket");
  try {
    // let mailOptions = {
    //   from: "youremail@gmail.com",
    //   to: "myfriend@yahoo.com",
    //   subject: "Sending Email using Node.js",
    //   text: "That was easy!",
    // };
    const { ticket } = req.body;
    // console.log(ticket);
    const event = await Event.findOneAndUpdate(
      { "categories._id": ticket.category_id },
      {
        $push: {
          "categories.$.teams": {
            users: ticket.users,
            captain: ticket.users[0],
            name: ticket.name,
          },
        },
      }
    );
    if (event) {
      // await deleteImage(ticket.public_id);
      await Ticket.findOneAndDelete({ _id: ticket._id });
      const results = await Ticket.find();
      
      let transporter = nodemailer.createTransport({
        service: "yahoo",
        auth: {
          user: "norep.code@yahoo.com",
          pass: "lgippxsozkcbrovy",
        },
      });
  
      
      // const ticket = { users: "66b68416b5a9026a6d13cb4d" };
      // const users = await User.find({_id: { '$in': ticket.users }})
      const users = await User.find({ _id: { $in: ticket.users } }, { email: 1 });
  
      users.forEach((user) => {
        let mailOptions = {
          from: "norep.code@yahoo.com",
          to: user.email,
          subject: "Sending Email using Node.js",
          html: emailMsg(ticket.name,ticket.event,ticket.category,event._id.toString()),
          
        };
        transporter.sendMail(mailOptions, (error: any, info: any) => {
          if (error) {
            // res.send(error);
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      });
      
      res.send(results);
    } else res.status(404).json({ msg: "Evento no encontrado." });
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};
export const rejectTicket: RequestHandler = async (req, res) => {
  if (debug) console.log("#rejectTicket");
  try {
    const { ticket } = req.body;
    const result = await Ticket.findOneAndDelete({ _id: ticket._id });
    if (result) {
      // await deleteImage(ticket.public_id);
      const results = await Ticket.find();
      res.send(results);
    } else res.status(404).json({ msg: "Ticket no encontrado." });
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};

export const sendEmail: RequestHandler = async (req, res) => {
  if (debug) console.log("#sendEmail");
  try {
    let transporter = nodemailer.createTransport({
      //lgippxsozkcbrovy
      service: "yahoo",
      auth: {
        user: "norep.code@yahoo.com",
        pass: "lgippxsozkcbrovy",
      },
    });

    
    const ticket = { users: "66b68416b5a9026a6d13cb4d" };
    // const users = await User.find({_id: { '$in': ticket.users }})
    const users = await User.find({ _id: { $in: ticket.users } }, { email: 1 });

    users.forEach((user) => {
      let mailOptions = {
        from: "norep.code@yahoo.com",
        to: user.email,
        subject: "Sending Email using Node.js",
        html: emailMsg('team','event','category','_id'),
        
      };
      transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
          // res.send(error);
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    });
    // console.log(users);

    res.send(users);
    // await transporter.sendMail(mailOptions, (error:any, info:any)=> {
    //   if (error) {
    //     res.send(error);
    //   } else {
    //     res.send("Email sent: " + info.response)
    //   }
    // });
  } catch (error: any) {
    res.status(400).json({ msg: error.message });
  }
};
// export const namehere:RequestHandler = async (req,res)=>{
//     if(debug) console.log('#namehere')
//     try {
//         res.send('ok')
//     } catch (error:any) {
//         res.status(400).json({ msg: error.message })
//     }
//
// }


const emailMsg = (team:string,event:string,category:string,event_id:string)=>{
  return `<body>
    <div style="width:500px;padding:2em;box-sizing:border-box">
      <h1 style="font-family: sans-serif; font-weight: 600;font-style: normal;color: black;" >${team.toUpperCase()}</h1>
      <p style="font-family: sans-serif; color: black;margin: 0;" >Ha sido aprobado para participar en el evento :</p>
      <h1 style="text-decoration: underline #F1FF48 10px;font-family:  sans-serif;font-weight: 600;font-style: normal;color: black;" >${event.toUpperCase()}</h1>
      <h2 style="font-size: 1.5em;text-decoration: underline #F1FF48 10px;font-family:  sans-serif;font-weight: 600;font-style: normal;color: black;" >${category.toUpperCase()}</h2>
      <div style="height: 32px;" ></div>
      <a style="color: black;font-style: normal;font-weight: 600;font-family:  sans-serif;background-color: #F1FF48;border: 1px solid #191919;font-size: 1.3em;padding: .5em 1em;color: #191919;cursor: pointer;text-decoration: none;" href="/" >IR AL EVENTO</a>
    </div>
  </body>
  `
}