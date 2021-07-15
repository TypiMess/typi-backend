import crypto from "crypto"
import client from './DatabaseHandler'
import { CheckCredsValid, GenerateRandomString } from "../utilities"
import User from "../models/User";
import CallbackResult from "../models/CallbackResult";

const passwordSaltLength = 32;
const passwordKeyLength = 64;
const passwordCPUCost = 1024;
const passwordOutputEncoding = "hex";

export async function CreateUser(username: string, password: string) : Promise<CallbackResult>
{
    let statusCode = 500;
    
    if (CheckCredsValid(username, password))
    {
        let passSalt = GenerateRandomString(passwordSaltLength);
        let encPassword = crypto.scryptSync(password, passSalt, passwordKeyLength, {N: passwordCPUCost}).toString(passwordOutputEncoding);
        
        try
        {
            await client.connect();
            const db = client.db();
            
            const user: User = {
                Username: username,
                Password: encPassword,
                PasswordSalt: passSalt
            }
            
            let result = await db.collection("Users").insertOne(user);
            if (result.acknowledged)
            {
                statusCode = 201;
            }
        }
        finally
        {
            await client.close();
        }
    }
    
    return { status: statusCode };
}