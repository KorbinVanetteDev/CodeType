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

function getPfp(username) {
    // Extract Initials
    const initials = escapeAvatarText(
        username
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0,2)
            .map(part => part[0])
            .join("")
            .toUpperCase() || "?"
    );

    let hash = 0;
    for(let i=0; i<username.length; i++) {
        hash = (hash * 31 + username.charCodeAt(i)) >>> 0;
    }

    const hue = hash % 360;

    // Create SVG
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" rx="50" fill="hsl(${hue} 35% 50%)"/>
        <text x="50" y="57" text-anchor="middle" font-family="Merriweather, serif" 
              font-size="36" font-weight="700" fill="#fff">${initials}</text>
    </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
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