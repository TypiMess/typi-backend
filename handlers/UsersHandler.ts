import CallbackResult from "../models/CallbackResult";
import User from "../models/User";
import { CheckUsernameValid } from "../utilities";
import client from './DatabaseHandler'

/**
 * Get user's info from username. Case-insensitive
 * @param username the Username to find
 * @returns an {@link User} object containing all user's info from database
 * @returns a status code:
 * 200: OK
 * 404: User with specified username is not found
 * 406: Username is invalid
 */
export async function GetUserFromUsername(username: string): Promise<CallbackResult & { User?: User }> {
    let statusCode = 500;
    let user: User | undefined;

    if (CheckUsernameValid(username)) {
        try {
            await client.connect();
            const db = client.db();

            let result = await db.collection("Users").findOne({ Username: new RegExp(`^${username}$`, 'i') });
            if (result) {
                statusCode = 200;
                Object.assign(user, result);
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

    return { status: statusCode, User: user }
}