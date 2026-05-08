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

app.get("/auth", (req, res) => {
    const cookies = parseCookies(req.headers.cookie || "");
    const username = cookies.username;

    if(username) {
        return res.redirect("/");
    }

    res.render("auth", { error: null, activeTab: "login" });
});

app.post("/signup", (req, res) => {
    const username = normalizeUsername(req.body.username);
    const password = String(req.body.password || "");

    //Validation
    if(!username) {
        res.status(400).render("auth", {
            error: "Choose a username.",
            activeTab: "signup"
        });
        return;
    }

    if(!password) {
        res.status(400).render("auth", {
            error: "Choose a password.",
            activeTab: "signup"
        });
        return;
    }

    // Check if the account exists
    if(store.accounts[username]) {
        res.status(409).render("auth", {
            error: "Username already taken.",
            activeTab: "signup"
        });
        return;
    }

    // Create account
    store.accounts[username] = { password };
    saveAccounts();
    setAuthCookie(res, username);
    res.redirect("/");
});

app.post("/login", (req, res) => {
    const username = normalizeUsername(req.body.username);
    const password = String(req.body.password || "");

    if (!username || !password) {
        res.status(400).render("auth", { 
            error: "Enter your username and password.",
            activeTab: "login"
        });
        return;
    }

    const account = store.accounts[username];
    
    // Simple password check
    if (!account || account.password !== password) {
        res.status(401).render("auth", { 
            error: "Incorrect username or password.", 
            activeTab: "login" 
        });
        return;
    }

    setAuthCookie(res, username);
    res.redirect("/");
});

//server start
app.listen(8080);