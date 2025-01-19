import pg from "pg";
import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import postRoutes from "./routes/post.js";
import authRoutes from "./routes/auth.js";
import 'dotenv/config'

const app =express();
app.use(cors());
app.use(bodyParser.json({limit:"30mb",extended:true}));
app.use(bodyParser.urlencoded({limit:"30mb",extended:true}));


const CONNECTION_URL = process.env.CONNECTION_URL ;

const db = new pg.Client(CONNECTION_URL);
const PORT = process.env.PORT ;


db.connect()
.then(()=>app.listen(PORT, ()=>{console.log(`listening to port ${PORT}`)}))
.catch((err)=>{console.log("Error has Occurred server failed to Connect to the postgreSQL database",err)});

app.use('/posts', postRoutes);
app.use('/auth', authRoutes);
export default db;

