const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const cors = require("cors");
const app = express();

const authRoutes = require("./controllers/auth.controller")
const usersRoutes = require("./controllers/users.controller")
const projectsRoutes = require("./controllers/projects.controller")
const tasksRoutes = require("./controllers/tasks.controller")

const allowedCorsUrl = config.get("allowedCorsUrl");

//set up cors
app.use(express.json());
app.use(cors({
    origin: allowedCorsUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// connect to database
const mongo_url = config.get("mongo-url");
mongoose.set("strictQuery", true);
mongoose.connect(mongo_url)
    .then(() => console.log("Mongo Connecté"))
    .catch((err) => console.log(err));

// set up routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/projects/:projectId/tasks', tasksRoutes);

const port = config.get("port") || 3001;

app.listen(
    port,
    () => console.log(`Server running on http://localhost:${port}`)
);

module.exports = app;
