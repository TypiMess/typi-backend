

/**
 * Get Messages from/to an user
 * @param userID User ID of user
 * @param targetID User ID of receiver
 * @param callback Callback function to return results
 */
export function GetMessages(userID: number, targetID: number, callback: Function)
{
    let sql = "SELECT * FROM `Messages` WHERE (Sender = ? AND Receiver = ?) OR (Receiver = ? AND Sender = ?) ORDER BY MessageID DESC LIMIT 40";
    MySQL.query(sql, [userID, targetID, userID, targetID], function (err, results)
    {
        if (err)
        {
            console.error(err);
            callback({ status: false });
        }
        else
        {
            callback({ status: true, messages: results });
        }
    });
}

/**
 * Send a message
 * @param {Number} senderID User ID of sender
 * @param {Number} receiverID User ID of receiver
 * @param {Object} encryptedData Encrypted message data. Contains encrypted message, key for sender, key for receiver and iv
 * @param {Function} callback Callback function
 */
 export function SendMessage(senderID, receiverID, encryptedData, callback)
{
    if (senderID && receiverID && encryptedData)
    {
        let user1 = senderID < receiverID ? senderID : receiverID;
        let user2 = user1 != senderID ? senderID : receiverID;

        let sql = "INSERT INTO `Messages` (Sender, Receiver, Content, KeySender, KeyReceiver, IV, AuthTag, SendTime) SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT Status FROM `Relationships` WHERE User1 = ? AND User2 = ?) = 'Friends'";
        let time = Math.floor(Date.now() / 1000);
        MySQL.query(sql, [senderID, receiverID, encryptedData.message, encryptedData.keySender, encryptedData.keyReceiver, encryptedData.iv, encryptedData.authTag, time, user1, user2], function (err)
        {
            if (err)
            {
                console.error(err);
                callback({ status: false });
            }
            else
            {
                callback({ status: true });
            }
        });
    }
    else
    {
        callback({ status: false });
    }
}
