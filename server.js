const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

// Middleware untuk parsing body dari POST request
app.use(express.urlencoded({ extended: true }));

// Middleware untuk menyajikan file statis seperti gambar, CSS, dll.
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'beranda')));
app.use(express.static(path.join(__dirname, 'about')));

// Setup express-session untuk manajemen sesi
app.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

let users = [];  

// Route ke halaman beranda jika sudah login
app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        serveFile(res, 'beranda.html', 'text/html');
    } else {
        res.redirect('/login');
    }
});

// Route untuk halaman login
app.get('/login', (req, res) => {
    serveFile(res, 'login.html', 'text/html');
});

// Route untuk menangani form login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        req.session.loggedIn = true;   
        req.session.username = username;
        res.redirect('/');
    } else {
        res.status(401).send('<h1>Login Failed. Invalid username or password.</h1><a href="/login">Try Again</a>');
    }
});

// Route untuk logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Route untuk halaman register
app.get('/register', (req, res) => {
    serveFile(res, 'register.html', 'text/html');
});

// Route untuk menangani form register
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    users.push({ username, password });
    res.redirect('/login');
});

// Route untuk halaman HLS streaming
app.get('/index', (req, res) => {
    if (req.session.loggedIn) {
        serveFile(res, 'index.html', 'text/html');
    } else {
        res.redirect('/login');
    }
});

// Route untuk halaman DASH streaming
app.get('/dash', (req, res) => {
    if (req.session.loggedIn) {
        serveFile(res, 'dash.html', 'text/html');
    } else {
        res.redirect('/login');
    }
});

// Route untuk halaman About Us
app.get('/about', (req, res) => {
    if (req.session.loggedIn) {
        serveFile(res, 'about.html', 'text/html');
    } else {
        res.redirect('/login');
    }
});

// Route untuk menyajikan file CSS dan file statis lainnya
app.get('*.css', (req, res) => {
    const cssPath = path.join(__dirname, req.url);
    res.sendFile(cssPath);
});

// Fungsi untuk menyajikan file statis
const serveFile = (res, filePath, contentType) => {
    const fullPath = path.join(__dirname, filePath);
    fs.readFile(fullPath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
};

// Server listen pada port 8080
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});