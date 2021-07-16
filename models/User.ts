import { ObjectId } from "mongodb";

export default interface User
{
    UserID?: ObjectId
    Username: string,
    Password?: string,
    PasswordSalt?: string,
    DateRegistered?: number
}