import { Db, MongoClient } from "mongodb"
import fs from "fs"
import path from "path"

const creds = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "db-typi-creds.json")).toString());
const serverURL = `mongodb://${creds.username}:${creds.password}@localhost:27017/typi?authSource=typi`;
let mongo_client: MongoClient = new MongoClient(serverURL);

export default mongo_client;