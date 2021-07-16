import { ObjectId } from 'mongodb';
import CallbackResult from '../models/CallbackResult';
import User from '../models/User';
import client from './DatabaseHandler'

export async function GetAcceptedFriends(userID: ObjectId): Promise<CallbackResult & { Friends: User[] }>
{
    let statusCode = 500;
    let listFriends: User[] = [];
    
    try
    {
        await client.connect();
        const db = client.db();
        
        let user_result = await db.collection("Users").findOne({ _id: userID });
        if (user_result)
        {
            if (user_result.Friends)
            {
                let friends = await db.collection("Users").find({ _id: { $in: user_result.Friends }, Friends: userID }, { projection: { _id: 0, Username: 1 } });
                listFriends = (await friends.toArray()).map(f => { return { Username: f.Username }});
            }
            
            statusCode = 200;
        }
        else
        {
            statusCode = 401;
        }
    }
    catch (e)
    {
        console.error(e);
    }
    
    return { status: statusCode, Friends: listFriends }
}

/**
 * Get a list of pending friend requests
 * @param userID Current user ID object
 * @returns a status code and an array of {@link User}s.
 * 200: Success
 * 401: Cannot get current user.
 */
export async function GetFriendRequests(userID: ObjectId): Promise<CallbackResult & { Friends: User[] }>
{
    let statusCode = 500;
    let listFriends: User[] = [];
    
    try
    {
        await client.connect();
        const db = client.db();
        
        let user_result = await db.collection("Users").findOne({ _id: userID });
        if (user_result)
        {
            if (user_result.Friends)
            {
                let friends = await db.collection("Users").find({ _id: { $nin: user_result.Friends }, Friends: userID }, { projection: { _id: 0, Username: 1 } });
                listFriends = (await friends.toArray()).map(f => { return { Username: f.Username }});
            }
            
            statusCode = 200;
        }
        else
        {
            statusCode = 401;
        }
    }
    catch (e)
    {
        console.error(e);
    }
    
    return { status: statusCode, Friends: listFriends }
}

/**
 * 
 * @param {Number} UserID Sender user ID
 * @param {String} targetUsername Target Username
 * @param {Function} callback Callback function
 */
export function AddFriend(userID: ObjectId, targetUsername: string)
{
    
}

export function UpdateRelationship(userID: ObjectId, targetUsername: string, relationship: string)
{
    
}