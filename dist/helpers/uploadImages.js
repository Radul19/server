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
exports.deleteImages = exports.deleteImage = exports.uploadImages = exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
//   secure: true,
// });
cloudinary_1.v2.config({
    cloud_name: 'dtdgl3ajp',
    api_key: '331735467981966',
    api_secret: '4iq8RwNvVUkxRGJzVe7YAqiZvjA',
    secure: true,
});
const regx = /data:image/;
// const regx = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
const uploadImage = (img) => __awaiter(void 0, void 0, void 0, function* () {
    const isBase64 = regx.test(img.secure_url);
    // if the secure_url is a base64, upload it, if it is a cloudinary url, just return normal values
    if (isBase64) {
        const { secure_url, public_id } = yield cloudinary_1.v2.uploader.upload(img.secure_url, {});
        if (img.public_id && img.public_id.length > 0)
            yield (0, exports.deleteImage)(img.public_id);
        return { secure_url, public_id };
    }
    else
        return img;
});
exports.uploadImage = uploadImage;
const uploadImages = (arrImages) => __awaiter(void 0, void 0, void 0, function* () {
    const sendImg = (img) => {
        return new Promise((res, rej) => __awaiter(void 0, void 0, void 0, function* () {
            res(yield (0, exports.uploadImage)(img));
        }));
    };
    let images = yield Promise.all(arrImages.map((img) => sendImg(img)));
    return images;
});
exports.uploadImages = uploadImages;
const deleteImage = (public_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield cloudinary_1.v2.uploader.destroy(public_id);
    // .then(() => true).catch(() => false)
});
exports.deleteImage = deleteImage;
const deleteImages = (arrImages) => __awaiter(void 0, void 0, void 0, function* () {
    const sendImg = (public_id) => {
        return new Promise((res, rej) => __awaiter(void 0, void 0, void 0, function* () {
            res(yield (0, exports.deleteImage)(public_id));
        }));
    };
    yield Promise.all(arrImages.map((img) => sendImg(img.public_id)));
    return true;
});
exports.deleteImages = deleteImages;
/**
 * NOREP 2.0 (en desarrollo)
 *
 * Novedades:
 * -- Inicio de sesion:
 * -- -- Los usuarios y administradores iniciarán sesión desde su respectiva pantalla
 * -- -- Los administradores ahora inician sus usuarios con "@" (para diferenciarlos de los correos de los usuarios normales)
 *
 * -- Registro:
 * -- -- Formulario de registro con sus campos correspondientes
 *
 * -- Creacion de evento:
 * -- -- Filtros para las categorias, asi como campos para el precio en $ y las fechas de inscripcion y cierre de inscripciones
 * -- -- Equipos Manuales: una vez seleccionada la casilla no se puede modificar!!! Esta opcion es para habilitar la tabla vieja (subir los equipos a mano), en caso de estar deshabilitada, las categorias tendran las opciones de filtro y los usuarios podran inscribirse una vez iniciada su sesion.
 *
 * -- Solicitudes:
 * -- -- Una vez iniciada la sesion como administrador se podran ver todos los "Tickets" que hayan creado los usuarios para solicitar unirse a las categorias. En estos tickets esta la fecha del mismo, el nombre de los integrantes, el numero de tlf del capitan, el nro de transferencia y el comprobante del pago. Nota: Una vez aceptada o rechazada la solicitud, la informacion se elimina por completo, aún estoy cuestionando si guardarla como respaldo o no, ya que en caso de hacer un respaldo, mucha informacion se va a guardar en la base de datos y eso es $$$
 *
 * -- -- Tabla
 * -- SI DIOS QUEIRE Y LA VIRGEN YA NO SE DUPLICAN LOS EQUIPOS
 * -- La tabla no fue actualizada mas allá del nuevo esquema para los equipos con multiples integrantes
 *
 * -- Registro al Evento
 * -- -- Escuchar audio
 */
//# sourceMappingURL=uploadImages.js.map