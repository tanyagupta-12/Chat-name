import cors from "cors";
import express from "express"
import "dotenv/config"
import http from "http"
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import {Server} from "socket.io";
import e from "cors";

const app = express();
const server = http.createServer(app);

app.use(express.json({limit : "4mb"}));
app.use(cors());

export const io = new Server(server,{
    cors : {origin : "*" }
})
export const userSocketMap = {};
io.on("connection",(socket) =>{
 const userId = socket.handshake.query.userId;
  console.log("User Connected",userId);

  if(userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers",Object.keys(userSocketMap));
  socket.on("disconnect",() =>{
    console.log("User Disconnected",userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers",Object.keys(userSocketMap))
  })
})
app.get("/", (req, res) => {
  res.send("Chat Backend is Running 🚀");
});
app.get("/api/status",(req,res) => res.send("Server is live"));
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)

await connectDB();

if(process.env.NODE_ENV !== "production"){
const PORT = process.env.PORT  || 5000;
server.listen(PORT,() => console.log ("Server is running on PORT :" + PORT));
}
export default server;