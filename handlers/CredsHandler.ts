import crypto from "crypto"
import client from './DatabaseHandler'
import { CheckCredsValid, GenerateRandomString } from "../utilities"
import User from "../models/User";
import CallbackResult from "../models/CallbackResult";
import { MongoServerError } from "mongodb";

const passwordSaltLength = 32;
const passwordKeyLength = 64;
const passwordCPUCost = 1024;
const passwordOutputEncoding = "hex";

/**
 * Add a new user to database
 * @param username 
 * @param password 
 * @returns a status code. 201: successfully created
 * 406: Invalid username or password
 * 409: Duplicate username
 * 500: Failed
 */
export async function CreateUser(username: string, password: string): Promise<CallbackResult> {
    let statusCode = 500;

    if (CheckCredsValid(username, password)) {
        let passSalt = GenerateRandomString(passwordSaltLength);
        let encPassword = crypto.scryptSync(password, passSalt, passwordKeyLength, { N: passwordCPUCost }).toString(passwordOutputEncoding);

        try {
            await client.connect();
            const db = client.db();

            const user: User = {
                Username: username,
                Password: encPassword,
                PasswordSalt: passSalt,
                DateRegistered: Math.floor(Date.now() / 1000)
            }

            let result = await db.collection("Users").insertOne(user);
            if (result.acknowledged) {
                statusCode = 201;
            }
        }
        catch (e) {
            let error = <MongoServerError>e;

            switch (error.code) {
                // E11000 - Duplicate entry
                case 11000:
                    statusCode = 409;
                    break;
                // E121 - Validation unsatified
                case 121:
                    statusCode = 406;
                    break;
                default:
                    break;
            }
        }
    }
    else {
        statusCode = 406;
    }

    return { status: statusCode };
}

export async function CheckCredential(username: string, password: string): Promise<CallbackResult> {
    let statusCode = 500;

    if (CheckCredsValid(username, password)) {
        try {
            await client.connect();
            const db = client.db();

            let result = await db.collection("Users").findOne({ Username: username });
            if (result) {
                let encPassword = crypto.scryptSync(password, result.PasswordSalt, passwordKeyLength, { N: passwordCPUCost }).toString(passwordOutputEncoding);

                if (crypto.timingSafeEqual(Buffer.from(encPassword), Buffer.from(result.Password))) {
                    statusCode = 200;
                }
                else {
                    statusCode = 404;
                }
            }
            else {
                statusCode = 404;
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    else {
        statusCode = 406;
    }

    return { status: statusCode };
}