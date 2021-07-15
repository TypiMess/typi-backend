import express from 'express'
import * as SessionsHandler from '../handlers/SessionsHandler'
import config from '../config'

const router = express.Router();

router.get("/verify", function (req, res)
{
    SessionsHandler.GetSession(req.cookies[config.COOKIE_SESSION_ID]).then(data =>
    {
        res.status(data.status).send();
    });
});

router.put("/keepAlive", function (req, res)
{
    SessionsHandler.KeepAlive(req.cookies[config.COOKIE_SESSION_ID]).then(data => {
        res.status(data.status).send();
    });
});

router.delete("/logout", function (req, res) {
    SessionsHandler.RemoveSession(req.cookies[config.COOKIE_SESSION_ID]).then(session_result => {
        res.status(session_result.status).send();
    })
});

export default router;