import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
//   secure: true,
// });

cloudinary.config({
    cloud_name: 'dtdgl3ajp',
    api_key: '331735467981966',
    api_secret: '4iq8RwNvVUkxRGJzVe7YAqiZvjA',
    secure:true,
});

export type Image = {
  secure_url: string;
  public_id: string;
};
/** TODO, CHECK IMAGE HANDLER, IF IT IS OBJECT OR STRING FROM 'type Image' */
type UpImage = (img: Image) => Promise<Image>;
type UpImages = (arrImages: Image[]) => Promise<Image[]>;

const regx = /data:image/;
// const regx = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

export const uploadImage: UpImage = async (img) => {
  const isBase64 = regx.test(img.secure_url);
  // if the secure_url is a base64, upload it, if it is a cloudinary url, just return normal values
  if (isBase64) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      img.secure_url,
      {}
    );
    if (img.public_id && img.public_id.length > 0) await deleteImage(img.public_id);
    return { secure_url, public_id };
  } else return img;
};

export const uploadImages: UpImages = async (arrImages) => {
  const sendImg: UpImage = (img) => {
    return new Promise(async (res, rej) => {
      res(await uploadImage(img));
    });
  };
  let images = await Promise.all(arrImages.map((img) => sendImg(img)));

  return images;
};

export const deleteImage = async (public_id: string) => {
  await cloudinary.uploader.destroy(public_id);
  // .then(() => true).catch(() => false)
};

export const deleteImages = async (arrImages: Image[]) => {
  const sendImg = (public_id: string) => {
    return new Promise(async (res, rej) => {
      res(await deleteImage(public_id));
    });
  };
  await Promise.all(arrImages.map((img) => sendImg(img.public_id)));

  return true;
};


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
