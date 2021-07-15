import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import CredsRouter from './routes/creds'
import UsersRouter from './routes/users'
import SessionsRouter from './routes/sessions'
/*import ChatRouter from './routes/chat'
import PublicKeysRouter from './routes/keys'*/

import * as SessionsHandler from './handlers/SessionsHandler'

const app = express();
const port = process.env.PORT || 10000;

app.listen(port, () => console.log(`Started API server on ${port}`));

app.use(cors({
    origin: [/localhost/, "https://ducng.dev:2053", /\.ducng\.dev$/],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/creds", CredsRouter);
app.use("/users", UsersRouter);
app.use("/sessions", SessionsRouter);
/*app.use("/chat", ChatRouter);
app.use("/keys", PublicKeysRouter);*/

setInterval(() =>
{
    SessionsHandler.ClearOldSessions();
}, 60000);

// ERROR HANDLING - START
//----------------------------------------------------------------------------------//
// Handle 404
app.use((req, res) =>
{
    res.status(404).send({ error: 404, msg: 'Page not Found' });
});
//-----------------------------------------------------------------------------------//
// ERROR HANDLING - END