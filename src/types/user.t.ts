export type UserType = {
    _id:string,
    name: string,
    email: string,
    shirt: string,
    birth: number,
    card_id: string,
    phone: string,
    genre: "Masculino" | "Femenino" ,
    location: {
        country: string,
        state: string,
        city: string,
    },
    box: string,
}
