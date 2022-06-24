//importar dependencias
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const mysql = require('mysql');
const cors = require('cors');
const { aplication } = require('express');
// variables de entorno
dotenv.config();

//conexion a la base de dato
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

//llamando la conexion
connection.connect(() => {
    console.log('Conectado a mysql');
});

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

//rutas
//ver todos los usuarios
app.post("/users/:id", (req, res) => {
    const parametros = [req.params.id];
    connection.query('select *from users where id=?', parametros, function (error, rows, fields) {
        console.log(parametros)
        if (error) {
            res.status(500).json(Error);
        } else {
            res.status(200).json(rows);
        }
    });
});

//Agregar una nueva venta
app.post("/nuevaventa", (req, res) => {
    const { id_producto, id_cliente, cantidad, total, id_factura } = req.body;
    const values = [id_producto, id_cliente, cantidad, total, id_factura];
    connection.query("INSERT INTO ventas ( id_producto, id_cliente, cantidad, total, id_factura) VALUES (?, ?, ?, ?,? )", values, req, res)


})

//Agregar Nuevo Producto funcionando
app.post('/addNewProd', (req, res) => {
    const { codebar, idCategoria, nombre, descripcion, stock, precio_compra, precio_venta, descuento, id_sucu } = req.body;
    const values = [[codebar, idCategoria, nombre, descripcion, stock, precio_compra, precio_venta, descuento, id_sucu]];
    console.log("los datos de nuevo producto son: ", values)
    
    connection.query('INSERT INTO productos (codebar, idCategoria, nombre, descripcion, stock, precio_compra, precio_venta, descuento, id_sucu) VALUES ? ', [values], function (error, rows, fields) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send({ "status": "succes", "message": "Producto Agregado" });
        }

    })
})

// //TEST IN ADD CATEGORY
// app.post('/add/test', (req, res) => {
//     // const {nomCategoria}  = req.body;
//     // const values = [nomCategoria];

//     var records = [
//         ['Miley'],
//         ['Jobin'],
//         ['Amy']
//       ];
//     console.log("los datos de nuevo producto son: ", records)
//     connection.query('INSERT INTO categoria (id,nomCategoria) VALUES (null,?) ',[records], function (error, rows, fields) {
//         if (error) {
//             res.status(500).send(error);
//         } else {
//             res.status(200).send({ "status": "succes", "message": "Test Agregado" });
//         }

//     })
// })







//ver venta con sucursal y usuario
app.post("/sucursal/venta/:id", (req, res) => {

    const parametros = [req.params.id];
    connection.query('select sucursal.id, sucursal.nombre, sucursal.images, sucursal.direccion FROM sucursal where idUser=?', parametros, function (error, rows, fields) {
        console.log(parametros);
        if (error) {
            res.status(500).json(Error);
        } else {
            res.status(200).json(rows);
        }
    });
});


//buscar producto desde ID
app.get("/productos", (req, res) => {

    //const parametros = [req.params.id];
    connection.query('SELECT * FROM `productos`', function (error, rows, fields) {
        // console.log(parametros);
        if (error) {
            res.status(500).json(Error);
        } else {
            res.status(200).json(rows);
        }
    });
});

//seleccionar categoria
app.get("/products/category", (req, res) => {

    connection.query('SELECT * FROM `categoria`', function (error, rows, fields) {

        if (error) {
            res.status(500).json(Error);
        } else {
            res.status(200).json(rows);
        }
    });
});

//ver productos de cada sucursal
app.post("/inventario/producto/:id", (req, res) => {

    const parametros = [req.params.id];
    connection.query('SELECT productos.id,productos.codebar, productos.descripcion, productos.nombre, productos.stock, productos.precio_compra, productos.precio_venta, productos.descuento FROM productos where id_sucu=?', parametros, function (error, rows, fields) {
        console.log(parametros);
        if (error) {
            res.status(500).json(Error);
        } else {
            res.status(200).json(rows);
        }
    });
});

//mostrar los datos del administrador
app.get("/getAdmin/:id", (req, res) => {
    const parametros = [req.params.id];
    connection.query('SELECT rol.id, rol.nombre FROM rol INNER JOIN users ON rol.id=? = users.rol ', parametros, function (error, rows, fields) {
        if (error) {
            res.status(500).json(Error);
        } else {
            res.status(200).json(rows);
        }
    });
});

//Mostrar la suma de un producto
app.get("/apiautomax/v1/producto/total", (req, res) => {
    connection.query('SELECT SUM(existencia) as total FROM producto', function (error, rows, fields) {
        if (error) {
            res.status(500).json(Error);
        } else {
            res.status(200).json(rows);
        }
    });
});

//Actualizar un producto
app.put("/apiautomax/v1/producto/:id", (req, res) => {

    const sql = "update producto set nombre=?,marca=?,modelo=?,existencia=?, idproveedor=? idcategoria=? where idproducto=?";
    const parametros = [req.body.nombre, req.body.marca, req.body.modelo, req.body.existencia, req.body.idproveedor, req.body.idcategoria, req.body.idproducto];
    connection.query(sql, parametros, function (error, rows, fields) {
        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json({ "mensaje": "Estudiante Actualizado" });
        }
    });
});

//insertar marca
app.post("/add/category", (req, res) => {

    const sql = "insert into categoria(id, nomCategoria) values (null,?)";
    const {nomCategoria}  = req.body;
    const datos = [nomCategoria];
    console.log("the dates this", datos)
    connection.query(sql,[datos], function (error, rows, fields) {
        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json({ "mensaje": "Categoria agregado" });
        }
    });
});


//login 
app.post("/api/login", (req, res) => {
    const { username, pass } = req.body;
    const values = [username, pass];
    connection.query("SELECT * FROM users WHERE username=? AND pass=?", values, (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            if (result.length > 0) {
                // console.log(values)
                res.status(200).send(result[0])
            } else {
                res.status(400).send('Usuario y contraseña no existe')
            }
        }
    })
});

app.get("/inventario/producto/bodega", (req, res) => {5                                     

    //bodega.id,bodega.codebar, bodega.nombre, bodega.detalle, productos.stock, bodega.precio_compra, bodega.precio_venta, bodega.precio_mayorista
    //const parametros = [req.params.id];
    connection.query('SELECT * FROM bodega', function (error, rows, fields) {
       // console.log(parametros);
        if (error) {
            res.status(500).json(Error);
        } else {
            res.status(200).json(rows);
        }
    });
});

//Cliente listado ---- de la empresa
app.get("/cliente", (req, res) => {

    connection.query('SELECT cliente.id_cliente, cliente.Nombre, cliente.Apellido, cliente.NIT, cliente.direccion FROM cliente INNER JOIN tipocliente ON cliente.id_tipo=2= tipocliente.id_tipo', function (error, rows, fields) {
       // console.log(parametros);
        if (error) {
            res.status(500).json(Error);
        } else {
            res.status(200).json(rows);
        }
    });
});

//Ver detalladamente los clientes deudores
//SELECT cliente.Nombre, ventas.detalle, credito.MontoInicial, credito.fechaAbono, credito.montoPagar FROM ((cliente INNER JOIN ventas on cliente.id_cliente=ventas.id_cliente) INNER JOIN credito ON cliente.id_cliente=5); 
app.get("/deudas/clientes/:id", (req, res) => {
const parametros = [req.params.id];
    connection.query('SELECT cliente.Nombre, ventas.detalle, credito.MontoInicial, credito.fechaAbono, credito.montoPagar FROM ((cliente INNER JOIN ventas on cliente.id_cliente=ventas.id_cliente) INNER JOIN credito ON cliente.id_cliente=?)',parametros, function (error, rows, fields) {
       // console.log(parametros);
        if (error) {
            res.status(500).json(Error);
        } else {
            res.status(200).json(rows);
        }
    });
});

//Ver detalles de credito de cada cliente
app.get("/credito/:id", (req, res) => {
    const parametros = [req.params.id];
    connection.query('SELECT * FROM credito WHERE idCliente=?',parametros, function (error, rows, fields) {
       // console.log(parametros);
        if (error) {
            res.status(500).json(Error);
        } else {
            res.status(200).json(rows);
        }
    });
});

//insertar nuevo abono 
app.post("/add/abono", (req, res) => {
    //"INSERT INTO credito (idCliente, MontoInicial, fechaAbono, montoPagar, idUser) VALUES (NULL,?,?,?,?,?)"
    const sql ="INSERT INTO credito (idCliente, MontoInicial, fechaAbono, montoPagar, idUser) VALUES (?,?,?,?,?)";
    const {idCliente, MontoInicial, fechaAbono, montoPagar, idUser}  = req.body;
    const datos = [idCliente, MontoInicial, fechaAbono, montoPagar, idUser];
    console.log("the dates this", datos)
    connection.query(sql,datos, function (error, rows, fields) {
        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json({ "mensaje": "Abono Agregado" });
        }
    });
});



app.listen(8800, () => {
    console.log("servidor corriendo, PID=" + process.pid);
})


