import client from './DatabaseHandler'
import Session from '../models/Session';
import CallbackResult from '../models/CallbackResult';
import User from '../models/User';
import { ObjectId } from 'mongodb';
import config from '../config';

/**
 * Create a new session in database
 * @param username username to create new session
 * @return a status code will be returned
 */
export async function CreateSession(username: string): Promise<CallbackResult & { sessionID?: string }> {
    let statusCode = 500;
    let sessionID: ObjectId | undefined;

    try {
        await client.connect();
        const db = client.db();

        let userExists = await db.collection("Users").findOne({ Username: username });

        if (userExists) {
            let expireTime = Math.floor(Date.now() / 1000) + config.SESSION_EXPIRE_TIME;
            let session: Session = {
                UserID: userExists._id,
                ExpireTime: expireTime
            }

            let result = await db.collection("Sessions").insertOne(session);

            if (result.acknowledged) {
                statusCode = 201;
                sessionID = result.insertedId
            }
        }
        else {
            statusCode = 404;
        }
    }
    catch (e) {
        console.error(e);
    }

    return { status: statusCode, sessionID: sessionID?.toHexString() }
}

export async function GetSession(sessionID: string): Promise<CallbackResult & { Session?: Session }> {
    let statusCode = 500;
    let session: Session | undefined;

    try {
        await client.connect();
        const db = client.db();

        let result = await db.collection("Sessions").findOne({ _id: new ObjectId(sessionID) });
        if (result) {
            statusCode = 200;
            session = {
                UserID: result.UserID,
                ExpireTime: result.ExpireTime
            };
        }
        else {
            statusCode = 404;
        }
    }
    catch (e) {
        console.error(e);
    }

    return { status: statusCode, Session: session };
}

/**
 * Get user info from given session ID
 * @param sessionID the session ID to get user
 * @returns a status code with {@link User} object contains user info
 */
export async function GetUserFromSession(sessionID: string): Promise<CallbackResult & { User?: User }> {
    let statusCode = 500;
    let user: User | undefined;

    let session_result = await GetSession(sessionID);
    if (session_result === 200) {
        try {
            await client.connect();
            const db = client.db();

            let user_result = await db.collection("User").findOne({ _id: session_result.Session?.UserID });
            if (user_result) {
                statusCode = 200;
                user = {
                    Username: user_result.Username
                };
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
        statusCode = session_result.status;
    }

    return { status: statusCode, User: user };
}

/**
 * Extend TTL of given session ID by 15 minutes (from current time)
 * @param sessionID Session ID to extend
 * @returns a status code
 */
export async function KeepAlive(sessionID: string): Promise<CallbackResult> {
    let statusCode = 500;

    try {
        await client.connect();
        const db = client.db();

        let expireTime = Math.floor(Date.now() / 1000) + config.SESSION_EXPIRE_TIME;

        let result = await db.collection("Sessions").findOneAndUpdate({ _id: new ObjectId(sessionID) }, { ExpireTime: expireTime });
        if (result) {
            statusCode = 200;
        }
        else {
            statusCode = 404;
        }
    }
    catch (e) {
        console.error(e);
    }

    return { status: statusCode };
}

export async function RemoveSession(sessionID: string): Promise<CallbackResult> {
    let statusCode = 500;

    try {
        await client.connect();
        const db = client.db();

        let result = await db.collection("Sessions").deleteOne({ _id: new ObjectId(sessionID) });
        statusCode = result.deletedCount > 0 ? 200 : 404;
    }
    catch (e) {
        console.error(e);
    }

    return { status: statusCode };
}

/**
 * Clear expired sessions from db
 */
export async function ClearOldSessions() {
    try {
        await client.connect();
        const db = client.db();

        await db.collection("Sessions").deleteMany({
            ExpireTime: {
                $lt: Math.floor(Date.now() / 1000)
            }
        });
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await client.close();
    }
}