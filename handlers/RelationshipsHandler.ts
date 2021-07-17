import { MongoServerError, ObjectId } from 'mongodb';
import CallbackResult, { CR_SUCCESS } from '../models/CallbackResult';
import User from '../models/User';
import { CheckUsernameValid } from '../utilities';
import client from './DatabaseHandler'
import { GetUserFromUsername } from './UsersHandler';

const RelationshipStatus = {
    Friends: 'Friends',
    Pending: 'Pending',
    Blocked: 'Blocked'
}

/**
 * Get a list of accepted friends
 * @param userID current user's ID object
 * @returns an array of users who are friends, can be an empty array
 * @returns a status code
 * 200: Success
 */
export async function GetAcceptedFriends(userID: ObjectId): Promise<CallbackResult & { Friends: User[] }> {
    let statusCode = 500;
    let listFriends: User[] = [];

    try {
        await client.connect();
        const db = client.db();

        let relationship_results = db.collection("Relationships").find({
            $or: [
                { User1: userID },
                { User2: userID }
            ],
            Status: RelationshipStatus.Friends
        });
        
        if ((await relationship_results.count()) > 0) {
            let friendsIds: ObjectId[] = [];

            await relationship_results.forEach(result => {
                const friendId = userID.equals(result.User1) ? result.User2 : result.User1;
                friendsIds.push(friendId);
            });

            let friends = await db.collection("Users").find({ _id: { $in: friendsIds } }, { projection: { _id: 0, Username: 1 } });
            listFriends = (await friends.toArray()).map(f => { return { Username: f.Username } });
        }

        statusCode = 200;
    }
    catch (e) {
        console.error(e);
    }

    return { status: statusCode, Friends: listFriends }
}

/**
 * Get a list of pending friend requests
 * @param userID Current user ID object
 * @returns a status code and an array of {@link User}s.
 * 200: Success
 */
export async function GetFriendRequests(userID: ObjectId): Promise<CallbackResult & { Friends: User[] }> {
    let statusCode = 500;
    let listFriendRequests: User[] = [];

    try {
        await client.connect();
        const db = client.db();

        let relationship_results = db.collection("Relationships").find({
            $or: [
                { User1: userID },
                { User2: userID }
            ],
            TargetUser: userID,
            Status: RelationshipStatus.Pending
        });

        if ((await relationship_results.count()) > 0) {
            let friendsIds: ObjectId[] = [];

            await relationship_results.forEach(result => {
                const friendId = userID.equals(result.User1) ? result.User2 : result.User1;
                friendsIds.push(friendId);
            });

            let friendRequests = await db.collection("Users").find({ _id: { $in: friendsIds } }, { projection: { _id: 0, Username: 1 } });
            listFriendRequests = (await friendRequests.toArray()).map(f => { return { Username: f.Username } });
        }

        statusCode = 200;
    }
    catch (e) {
        console.error(e);
    }

    return { status: statusCode, Friends: listFriendRequests }
}

/**
 * Send a friend request to a target user using their username
 * @param userID 
 * @param targetUsername 
 * @returns a status code
 * 201: Sent a friend request
 * 403: No permission to add as friend
 * 404: User with username not found
 * 406: Input to database failed validation
 * 409: The target user is already a friend/sent a request
 */
export async function AddFriend(userID: ObjectId, targetUsername: string): Promise<CallbackResult> {
    let statusCode = 500;

    try {
        await client.connect();
        const db = client.db();

        let users_result = await GetUserFromUsername(targetUsername);
        if (CR_SUCCESS(users_result.status)) {
            const sortedUserIDs = [userID, users_result.User!.UserID!].sort((a, b) => a.toHexString() > b.toHexString() ? 1 : -1);

            let currentRelationship_result = await db.collection("Relationships").findOne({
                User1: sortedUserIDs[0],
                User2: sortedUserIDs[1],
            });

            if (!currentRelationship_result) {
                let result = await db.collection("Relationships").insertOne({
                    User1: sortedUserIDs[0],
                    User2: sortedUserIDs[1],
                    TargetUser: users_result.User!.UserID!,
                    Status: RelationshipStatus.Pending
                });

                if (result.acknowledged) {
                    statusCode = 201;
                }
            }
            else {
                if (userID.equals(currentRelationship_result.TargetUser) && currentRelationship_result.Status === RelationshipStatus.Blocked) {
                    statusCode = 403;
                }
                else {
                    statusCode = 409;
                }
            }
        }
        else {
            statusCode = users_result.status;
        }
    }
    catch (e) {
        let error = e as MongoServerError;

        switch (error.code) {
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