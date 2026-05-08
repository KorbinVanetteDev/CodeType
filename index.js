import express from "express";

const app = express();
const store = {
    users: {},
    accounts: {},
    pfps: {}
}

function parseCookies(header) {
    return Object.fromEntries(
        header
            .split(";")
            .map(cookie => cookie.trim())
            .filter(Boolean)
            .map(cookie => {
                const index = cookie.indexOf("=");
                if ( index === -1) return [cookie, ""];
                return [
                    decodeURIComponent(cookie.slice(0, index)),
                    decodeURIComponent(cookie.slice(index + 1))
                ];
            })
    );
}

function setAuthCookie(res, username) {
    res.setHeader(
        "Set-Cookie",
        `username=${encodeURIComponent(username)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
    );
}

function clearAuthCookie(res) {
    res.setHeader("Set-Cookie", "username=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
}

function normalizeUsername(username) {
    return String(username || "").trim();
}

function escapeAvatarText(text) {
    return text.replace(/[<>&"]/g, "");
}

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