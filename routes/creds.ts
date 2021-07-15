import express from 'express'
import * as SessionsHandler from '../handlers/SessionsHandler'
import config from '../config'

const router = express.Router();

router.post("/register", function (req, res)
{
    
    {
        SessionsHandler.CreateSession(req.body.username, (sessionID) =>
        {
            if (sessionID)
            {
                res.cookie(COOKIE_SESSION_ID, sessionID, {secure: true, domain: req.body.sender, httpOnly: true})
                .status(201)
                .send({ status: true, msg: "Successfully registered user " + req.body.username + "!" });
                
                console.log("User " + req.body.username + " created.");
            }
            else
            {
                res.status(500).send();
            }
        });
    }
});

router.post("/login", function (req, res)
{
    if (CheckCredsValid(req.body.username, req.body.password))
    {
        let sql = "SELECT Password, PasswordSalt FROM Users WHERE Username = ?";
        MySQL.query(sql, [req.body.username], function (err, result)
        {
            if (err)
            {
                console.error(err);
                res.status(500).send();
            }
            else
            {
                if (result.length > 0 )
                {
                    let encPassword = crypto.scryptSync(req.body.password, result[0].PasswordSalt, passwordKeyLength, {N: passwordCPUCost}).toString(passwordOutputEncoding);
                    
                    if (crypto.timingSafeEqual(Buffer.from(encPassword), Buffer.from(result[0].Password)))
                    {
                        SessionsHandler.CreateSession(req.body.username, (sessionID) =>
                        {
                            if (sessionID)
                            {
                                res.cookie(COOKIE_SESSION_ID, sessionID, {secure: true, domain: req.body.sender, httpOnly: true })
                                .status(200)
                                .send({ status: true, msg: "Logged in successfully!" });
                            }
                            else
                            {
                                res.status(500).send();
                            }
                        });
                    }
                    else
                    {
                        res.status(404).send();
                    }
                }
                else
                {
                    res.status(404).send();
                }
            }
        });
    }
    else
    {
        res.status(404).send();
    }
});

router.delete("/logout", function (req, res)
{
    MySQL.query("DELETE FROM `Sessions` WHERE SessionID = ?", [req.cookies[config.COOKIE_SESSION_ID]], (err) =>
    {
        if (err)
        {
            console.error(err);
            res.status(500).send();
        }
        else
        {
            res.status(200).send();
        }
    })
});

router.get("/getPublicKeys", (req, res) => {
    
});

export default router;