import express from 'express'
import * as SessionsHandler from '../../handlers/SessionsHandler'
import * as RelationshipsHandler from "../../handlers/RelationshipsHandler"
import config from '../../config'
import { CR_SUCCESS } from '../../models/CallbackResult';

const router = express.Router();

router.get("/", function (req, res)
{
    SessionsHandler.GetSession(req.cookies[config.COOKIE_SESSION_ID]).then(session_result =>
    {
        if (CR_SUCCESS(session_result.status))
        {
            RelationshipsHandler.GetAcceptedFriends(session_result.Session!.UserID).then(friends_result => {
                if (CR_SUCCESS(friends_result.status))
                {
                    res.status(friends_result.status).send(friends_result.Friends);
                }
                else
                {
                    res.status(friends_result.status).send();
                }
            });
        }
        else
        {
            res.status(401).send();
        }
    });
});

router.get("/requests", function (req, res)
{
    SessionsHandler.GetSession(req.cookies[config.COOKIE_SESSION_ID]).then(session_result =>
    {
        if (CR_SUCCESS(session_result.status))
        {
            RelationshipsHandler.GetFriendRequests(session_result.Session!.UserID).then(friends_result => {
                if (CR_SUCCESS(friends_result.status))
                {
                    res.status(friends_result.status).send(friends_result.Friends);
                }
                else
                {
                    res.status(friends_result.status).send();
                }
            });
        }
        else
        {
            res.status(401).send();
        }
    });
});

router.post("/add/{TargetUsername}", function (req, res)
{
    SessionsHandler.GetSession(req.cookies[config.COOKIE_SESSION_ID]).then(session_result =>
    {
        
    });
});

router.put("/updateRelationship", function (req, res)
{
    SessionsHandler.GetSession(req.cookies[config.COOKIE_SESSION_ID]).then(session_result =>
    {
        
    })
});

export default router;