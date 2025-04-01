var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


/* Register users */
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const [existingUser] = await pool.query('SELECT * FROM usuarios WHERE usuario = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query('INSERT INTO usuarios (usuario, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role]);
    
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: 'Error al crear el usuario' });
    }

    res.status(201).json({ message: 'Usuario creado exitosamente' });

  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario', message: error.message });
  }
});

router.post('/login', async (req, res) => {

  try {
    const { username, password } = req.body;

    const [user] = await pool.query('SELECT * FROM usuarios WHERE usuario = ?', [username]);
    if (user.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ userId: user[0].cod_usuario, role: user[0].role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Inicio de sesión exitoso', token });

  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión', message: error.message });
  }
}
);


module.exports = router;
