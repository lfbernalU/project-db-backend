var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
var pool = require('../config/database');


const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const tokenWithoutBearer = token.replace('Bearer ', '');
        const verified = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
}


/* GET products */
router.get('/', authenticateToken, async function(req, res) {
    try {

        let userId = req.user && req.user.userId ? req.user.userId : res.status(500).json({ error: 'Error retrieving products' });

        let role = req.user.role

        if (role === 'administrador') {

            const [products] = await pool.query('SELECT * FROM productos');
            res.json({ products: products });

        } else {

            const [products] = await pool.query('SELECT * FROM productos WHERE id_usuario = ?', [userId]);
            res.json({ userId: userId, products: products });
        }


    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/* POST product */
router.post('/', authenticateToken, async function(req, res) {

    try {
        const { cod_producto, descripcion, precio_unitario } = req.body;

        if (!cod_producto || !descripcion || !precio_unitario) {
            return res.status(400).json({ message: 'Faltan datos para crear el producto' });
        }

        let userId = req.user && req.user.userId ? req.user.userId : res.status(500).json({ error: 'Error retrieving products' });

        const [result] = await pool.query('INSERT INTO productos (cod_producto, descripcion, precio_unitario, id_usuario) VALUES (?, ?, ?, ?)', [cod_producto, descripcion, precio_unitario, userId]);

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: 'Error al crear el producto' });
        }

        res.status(201).json({ message: 'Producto creado exitosamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
  