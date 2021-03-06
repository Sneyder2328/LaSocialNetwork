import express from 'express';
import bodyParser from 'body-parser';
import compression from "compression";
import cors from "cors";
import router from './modules/app';
import {corsOptions} from './middlewares/cors';
import {genUUID} from "./utils/utils";
import http from "http";
import socketIO from 'socket.io';
import {handleSocket} from "./modules/websockets/socketsHandler";

export const app = express();
export const server = http.createServer(app);
export const io: socketIO.Server = socketIO(server);
const port = process.env.PORT || 3030;

handleSocket(io)
app.use(compression()); // compress all responses
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/', router);

server.listen(port, () => {
    console.log(`Server started on port ${port}`, genUUID());
});