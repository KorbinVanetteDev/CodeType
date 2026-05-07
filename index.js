import express from "express";

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use(express.static("favicons"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route
app.get("/", (req, res) => {
    res.render("index");
});

//server start
app.listen(8080);