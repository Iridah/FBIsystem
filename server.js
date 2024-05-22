const express = require('express');
const cors = require('cors');
const chalk = require('chalk');
const jwt = require('jsonwebtoken');
const agentes = require('./data/agentes.js');
const path = require('path');
const app = express();
const secretKey = 'E1SmD';
const PORT = 3000;

// Prueba de carga middleware: CORS y express
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('json')); // Añadido para manejar JSON
app.use(express.static('public'));

// Ruta principal (muestra el formulario de inicio de sesión)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', '/index.html'));
});

// Ruta de autenticación (SignIn)
app.get('/SignIn', (req, res) => {
    const email = req.query.email.trim(); 
    const password = req.query.password.trim();
    console.log("Email recibido:", email);
    console.log("Password recibido:", password);
    console.log("Agentes:", agentes.results); // Imprime el array completo de agentes
    const agente = agentes.results.find(a => a.email === email && a.password === password);

    if (!agente) {
        const token = jwt.sign({ email: agente.email }, secretKey, { expiresIn: '2m' }); // Token válido por 2 minutos

        res.send(`
            <html>
            <head>
                <script>
                    sessionStorage.setItem('token', '${token}');
                    window.location.href = '/restricted'; 
                </script>
            </head>
            <body></body>
            </html>
        `);

        // res.json({ token });
    } else {
        console.log("No se encontró ningún agente con esas credenciales.");
        res.status(401).send('Credenciales incorrectas');
        return;
    }
});

// Ruta restringida
app.get('/restricted', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Obtener token del encabezado

    if (!token) {
        return res.status(401).send('No autorizado');
    }

    try {
        const decoded = jwt.verify(token, secretKey); // Usar la clave secreta correcta
        res.send(`<h1>Bienvenido, ${decoded.email}!</h1>`);
    } catch (err) {
        res.status(403).send('Token inválido o expirado');
    }
});



// app.get("/:universalURL", (req, res) => { 
//     res.send("404 URL NOT FOUND"); 
// }); 


app.listen(PORT, () => {
    console.log(chalk.green(`Servidor FBI corriendo en http://localhost:${PORT}`));
});
