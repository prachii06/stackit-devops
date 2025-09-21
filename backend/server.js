import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js";
import answerRoutes from "./routes/answer.route.js"
// import notificationRoutes from "./routes/notification.route.js"
import questionRoutes from "./routes/question.route.js"
import userRoutes from "./routes/user.route.js"
import voteRoutes from "./routes/vote.route.js"

dotenv.config();
const app = express();


app.use(express.json());
app.use(cors());

//auth
app.use('/auth', authRoutes)

//questions
app.use('/question', questionRoutes);

//answer Routes
app.use('/ans', answerRoutes)
//userRoutes

app.use('/user', userRoutes)
// vote routes
app.use('/vote', voteRoutes)

app.get('/', (req, res) => {
    res.send('StackIt backend server running')
})

app.listen(process.env.PORT, () => {
    console.log(`server up at this port : ${process.env.PORT}`)
})