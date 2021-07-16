import { MongoServerError, ObjectId } from 'mongodb';
import CallbackResult, { CR_SUCCESS } from '../models/CallbackResult';
import User from '../models/User';
import { CheckUsernameValid } from '../utilities';
import client from './DatabaseHandler'
import { GetUserFromUsername } from './UsersHandler';

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
            let friends = await db.collection("Users").find({ _id: { $nin: user_result.Friends ?? [] }, Friends: userID }, { projection: { _id: 0, Username: 1 } });
            listFriends = (await friends.toArray()).map(f => { return { Username: f.Username }});
            
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
 * @param userID 
 * @param targetUsername 
 * @returns a status code
 * 201: Sent a friend request
 * 403: No permission to add as friend
 * 404: User with username not found
 * 406: Username is invalid
 */
export async function AddFriend(userID: ObjectId, targetUsername: string): Promise<CallbackResult>
{
    let statusCode = 500;
    
    try
    {
        await client.connect();
        const db = client.db();
        
        let users_result = await GetUserFromUsername(targetUsername);
        if (CR_SUCCESS(users_result.status))
        {
            const sortedUserIDs = [ userID, users_result.User!.UserID! ].sort((a, b) => a.toHexString() > b.toHexString() ? 1 : -1);
            
            let result = await db.collection("Relationships").insertOne({
                User1: sortedUserIDs[0],
                User2: sortedUserIDs[1],
                TargetUser: users_result.User!.UserID!,
                Status: 'Pending'
            });
            
            if (result.acknowledged)
            {
                statusCode = 201;
            }
        }
        else
        {
            statusCode = users_result.status;
        }
    }
    catch (e)
    {
        let error = e as MongoServerError;

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
                console.error(e);
                break;
        }
    }
    
    return { status: statusCode }
}

export function UpdateRelationship(userID: ObjectId, targetUsername: string, relationship: string)
{
    
}