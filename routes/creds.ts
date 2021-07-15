import express from 'express'
import * as SessionsHandler from '../handlers/SessionsHandler'
import * as CredsHandler from '../handlers/CredsHandler'
import config from '../config'
import { CR_SUCCESS } from '../models/CallbackResult';

const router = express.Router();

router.post("/register", function (req, res) {
    CredsHandler.CreateUser(req.body.Username, req.body.Password).then(data => {
        if (CR_SUCCESS(data.status)) {
            SessionsHandler.CreateSession(req.body.username).then(session_result => {
                if (CR_SUCCESS(session_result.status)) {
                    res.cookie(config.COOKIE_SESSION_ID, session_result.sessionID, { secure: true, domain: req.body.sender, httpOnly: true })
                        .status(201)
                        .send();

                    console.info(`[CREDS] User ${req.body.username} created.`);
                }
                else {
                    // for some reason SessionsHandler cannot find user just created, it returns 404.
                    // We return 500 instead to indicate server error
                    res.status(500).send();
                }
            });
        }
        else {
            res.status(data.status).send();
        }
    });
});

router.post("/login", function (req, res) {
    CredsHandler.CheckCredential(req.body.Username, req.body.Password).then(creds_result => {
        if (CR_SUCCESS(creds_result.status)) {
            SessionsHandler.CreateSession(req.body.Username).then(session_result => {
                if (CR_SUCCESS(session_result.status)) {
                    res.cookie(config.COOKIE_SESSION_ID, session_result.sessionID, { secure: true, domain: req.body.sender, httpOnly: true })
                        .status(200)
                        .send();
                }
                else {
                    // For some reason cannot find user after checking. Returning 500 to indicate server error
                    res.status(500).send();
                }
            });
        }
        else {
            res.status(creds_result.status).send();
        }
    })
});

router.get("/getPublicKeys", (req, res) => {

});

export default router;