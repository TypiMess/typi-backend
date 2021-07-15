import express from 'express'
import * as SessionsHandler from '../handlers/SessionsHandler'
import FriendsRouter from './friends/friends'
import config from '../config'

const router = express.Router();

router.use("/friends", FriendsRouter);

router.get("/me", function (req, res)
{
    SessionsHandler.GetUserFromSession(req.cookies[config.COOKIE_SESSION_ID]).then(data => {
        res.status(data.status).send(data.User);
    });
});

export default router;