import { User } from "../entities/user.entity";

export interface LoginInterface {

    user:User,
    token:string
}