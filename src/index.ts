import { Server } from './server';
import dotenv from 'dotenv';

dotenv.config();
const MONGO_URL = process.env.MONGO_URL;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SERVER_URL = process.env.SERVER_URL;
const PORT = process.env.PORT;

const server = new Server(CLIENT_ID, CLIENT_SECRET, MONGO_URL, SERVER_URL, PORT as unknown as number);
server.start();
