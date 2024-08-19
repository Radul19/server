
import { Types } from 'mongoose'

export type ResultType = {
    _id: string | Types.ObjectId,
    team_id: string,
    users: [string],
    time: number,
    tiebrake: number,
    penalty: number,
    amount: number, // decimal
}

export type WodType = {
    _id: string | Types.ObjectId,
    name: string,
    time_cap?: number,
    amount_cap?: number,
    amount_type: "Lbs" | "Puntos" | "Reps",
    wod_type: "AMRAP" | 'FORTIME' | "RM" | "CIRCUITO",
    results: ResultType[],
    category_id: string
    description: string
    index: number
}

export type TeamType = {
    _id: string | Types.ObjectId,
    users: string[],
    name: string,
    captain: string,
    // shirt:string,
}

export type CategoryType = {
    _id: string | Types.ObjectId,
    teams: TeamType[],
    name: string,
    price: boolean,
    updating: boolean,
    slots: boolean,
    filter?: {
        male?: number,
        female?: number,
        age_min?: number,
        age_max?: number
        amount?: number,
        limit?: number,
    },
    wods: WodType[],
}


export type EventType = {
    _id: string | Types.ObjectId,
    name: string,
    since: string,
    dues: number,
    until: string,
    place: string,
    secure_url: string,
    public_id: string
    accesible: boolean,
    partners: [{ secure_url: string, public_id: string }],
    categories: CategoryType[]
    manual_teams:boolean,
    register_time:{since:string,until:string},
}

