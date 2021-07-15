import { ObjectId } from "mongodb";

export default interface Session
{
    UserID: ObjectId,
    ExpireTime: number
}