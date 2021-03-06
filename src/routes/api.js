const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

const {
    isLoggedIn,
    isNotLoggedIn
} = require('../lib/auth');


router.post('/api/login', (req, res) => {
    const {
        id
    } = req.body;
    const user = id;
    const token = jwt.sign({
        user
    }, 'seceto', {
        expiresIn: '3600s'
    });

    res.json({
        token
    });
});

//links

router.get('/api/protected', ensureToken, (req, res) => {
    jwt.verify(req.token, 'seceto', (err, data) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                text: 'protected',
                data: data //iat 
            });
        }
    });

});


//clientes

router.post('/delete-cliente',(req,res)=>{
    const {id_user,id_usercreated} = req.body;

    
    const query = pool.query('DELETE FROM clientes_ where id = ?',[id_user]);

    query.then(()=>{


        req.flash('message', 'Cliente eliminado con éxito');
        res.redirect('/dashboard');
    }).catch((err)=>{
        res.json(err)
    });
});


router.post('/add-client', (req, res) => {


    const {
        name_padre,
        escolaridad_padre,
        ocupacion_padre,
        trabajo_padre,
        phone_padre,
        oficina_padre,
        mail_padre,
        parentesco
    } = req.body;


    const client = {
        name: name_padre,
        escolaridad: escolaridad_padre,
        ocupacion: ocupacion_padre,
        trabajo: trabajo_padre,
        phone: phone_padre,
        oficina: oficina_padre,
        mail: mail_padre,
        parentesco: parentesco,
        id_cartera: 0
    }


    const qu = pool.query('Insert into clientes_ set ?', [client]);

    qu.then((result) => {
        if (result.insertId) {
            req.flash('message', 'Cliente creado con éxito');
            res.render('dashboard/dashboard');
        }

    }).catch((err) => {
        console.log(err);
    });

});



router.post('/delete-alumno', (req,res)=>{
    const {id_user,id_usercreated} = req.body;
    const query = pool.query('DELETE FROM alumnos_ where id = ?',[id_user]);

    query.then(()=>{


        req.flash('message', 'Alumno eliminado con éxito');
        res.redirect('/dashboard');
    }).catch((err)=>{
        res.json(err)
    });
});

router.post('/update-alumno', (req, res) => {
    const alumno = req.body;
    const id = req.body.id;


 
    const qu = pool.query('UPDATE alumnos_ set ? where id = ? ', [alumno, id]);


    qu.then((response) => {
        try {
            console.log(response)
            req.flash('success', 'Datos actualizados');
            //res.redirect('/infoalumno/' + req.body. id);
            res.redirect('back');
        } catch (err) {
            console.log(err)
        }
    }).catch((err) => {
        console.log(err)
    });
});


router.post('/update-client', (req, res) => {
        const client = req.body;
        const id = req.body.id;
    
    
     
        const qu = pool.query('UPDATE clientes_ set ? where id = ? ', [client, id]);
    
    
        qu.then((response) => {
            try {
                console.log(response)
                req.flash('success', 'Datos actualizados');
                //res.redirect('/infoalumno/' + req.body. id);
                res.redirect('back');
            } catch (err) {
                console.log(err)
            }
        }).catch((err) => {
            console.log(err)
        });


/*
    */

});


router.post('/add-alumno', (req, res) => {
    console.log(req.body);
    const {
        name_alumno,
        lastnameP_alumno,
        lastnameM_alumno,
        alergias_alumno,
        tiposangre_alumno,
        talla_alumno,
        peso_alumno,
        precede_alumno,
        clave_alumno,
        id_client,
        colegiatura
    } = req.body;

    const alumno = {
        name: name_alumno,
        lastnameP: lastnameP_alumno,
        lastnameM: lastnameM_alumno,
        alergias: alergias_alumno,
        tiposangre: tiposangre_alumno,
        talla: talla_alumno,
        peso: peso_alumno,
        precede: precede_alumno,
        clave: clave_alumno,
        id_cliente: id_client,
        colegiatura: colegiatura,
        status: 'alta en sistema'
    }



    const qu = pool.query('Insert into alumnos_ set ?', [alumno]);

    qu.then(async (result) => {
        if (result.insertId) {
            const cartera = {
                id_alumno :result.insertId,
                status: 'alta en sistema, sin pagos aún'
            }
            const query = await pool.query('Insert into cartera_ set ?', [cartera]);
            req.flash('message', 'Datos generados con éxito');
            res.render('dashboard/dashboard');
        }
        

    }).catch((err) => {
        console.log(err);
    });

});




router.post('/cartera-update', (req, res) => {
    const {
        id_alumno,
        id_cartera
    } = req.body;
    console.log(id_alumno, id_cartera);
    const qu = pool.query('Update cartera_ set id_alumno = ?, status = ? where id = ?', [id_alumno, 'alta-en-sistema', id_cartera]);
    qu.then(async (resp, error, result, rows, fields) => {
        console.log(error, result, rows, fields);
        if (resp.affectedRows > 0) {
            const query2 = await pool.query('Update alumnos_ set id_cartera = ? ,  status = ?  where id =  ?', [id_cartera, 'alta-en-sistema', id_alumno]);
            req.flash('message', 'Cartera modificada con éxito');
            res.render('dashboard/dashboard');
        }
    }).catch((errr) => {
        console.log(errr)
    });;
});

router.post('/cartera-add', (req, res) => {
    console.log(req.body);
    const {
        id_cliente
    } = req.body;

    const wallet = {
        id_cliente: id_cliente,
        status: 'sin asignar'
    }
    const qu = pool.query('Insert into cartera_ set ?', [wallet]);

    qu.then(async (result) => {
        if (result.insertId) {
            const query = await pool.query('Update clientes_ set id_cartera = ? where id = ?', [result.insertId, id_cliente]);
            req.flash('message', 'Cartera creado con éxito');
            res.render('dashboard/dashboard');
        }

    }).catch((err) => {
        console.log(err);
    });

});

router.get('/carteras/:id', (req, res) => {
    const {
        id
    } = req.params;
    const qu = pool.query(' select cartera_.id id , alumnos_.name name  from cartera_ inner join  alumnos_ ON alumnos_.id_cartera = cartera_.id where cartera_.id_cliente = 32', [id]);

    const carteras = [];

    qu.then((data) => {

        data.forEach((data) => {
            carteras.push(data);
        });

        res.json(carteras);

    }).catch((err) => {
        console.log(err)
    });

});

router.get('/maestros', (req, res) => {
    const qu = pool.query('select * from personal_');

    qu.then((result) => {
        res.json(result);

    }).catch((err) => {
        console.log(err);
    });
});


router.post('/pago',(req,res)=>{
    const {id_cliente,id_cartera_alumno,mes,
        colegiatura} 
    = req.body;
        console.log(id_cliente,id_cartera,mes,
            colegiatura);


});

router.get('/cliente-carteras/:id',(req,res)=>{
const {id} = req.params;
 
const qu = pool.query('select * from cartera_ where id_cliente = ?',[id]);
    qu.then((resp)=>{
            res.json(resp);
    }).catch((err)=>{
        console.log(err);
    });
});

router.get('/alumnos', (req, res) => {


//where id_cartera
    const qu = pool.query('select * from alumnos_ ');

    qu.then((result) => {
        res.json(result);

    }).catch((err) => {
        console.log(err);
    });

});

router.get('/alumnos-sincartera', (req, res) => {



    const qu = pool.query('select * from alumnos_ where status = 1 ');

    qu.then((result) => {
        res.json(result);

    }).catch((err) => {
        console.log(err);
    });

});


router.post('/add-personal', (req, res) => {
    console.log(req.body);
    const {
        name,
        telefono,
            
        sueldo,
        curp,
        profesion,
        email,
        rfc,
        fingreso,estudios,porhora,
    } = req.body;

    const maestro = {
        name: name,
        estudios:estudios,
        porhora :porhora,
        telefono: telefono,
        
        sueldo: sueldo,
        curp: curp,
        profesion: profesion,
        email: email,
        rfc: rfc,
        fecha_ingreso: fingreso
    }



    const qu = pool.query('Insert into personal_ set ?', [maestro]);

    qu.then((result) => {
        if (result.insertId) {
            req.flash('message', 'Personal creado con éxito');
            res.render('dashboard/dashboard');
        }

    }).catch((err) => {
        console.log(err);
    });

});


router.get('/data_personal/:id', (req, res) => {

    const {
        id
    } = req.params;
    const qu = pool.query('select * from personal_ where id = ?', [id]);

    

    qu.then((data) => {

        console.log(data)
        data.forEach((data) => {
           res.json(data);
        });

      

    }).catch((err) => {
        console.log(err)
    });

});

router.get('/info_personal/:id', (req, res) => {

    const {
        id
    } = req.params;
    const qu = pool.query('select * from personal_ where id = ?', [id]);

    const maestro = [];

    qu.then((data) => {

        console.log(maestro)
        data.forEach((data) => {
            maestro.push(data);
        });

        res.render('public/info', {
            maestro
        });

    }).catch((err) => {
        console.log(err)
    });

});



router.get('/infocartera/:id', (req, res) => {

    const {
        id
    } = req.params;
    const qu = pool.query('select * from cartera_ where id = ?', [id]);

    const cartera = [];

    qu.then((data) => {

        data.forEach((data) => {
            cartera.push(data);
        });

        res.render('public/info', {
            cartera
        });

    }).catch((err) => {
        console.log(err)
    });

});

router.get('/alumn/search/', function (req, res) {


    req.getConnection(function (err, connection) {
        pool.query('SELECT * FROM pacjenci WHERE name LIKE "%' + req.query.key + '%"', function (err, rows, fields) {
            if (err)
                console.log("Error inserting : %s ", err);
            var data = [];
            for (i = 0; i < rows.length; i++) {
                data.push(rows[i]);
            }
            res.end(JSON.stringify(data));

        });
    });

});



router.get('/alumno_pagos/:id', (req, res) => {
    const {
        id
    } = req.params;
    const qu = pool.query('select * from pagos_ where id_alumno = ?', [id]);
    qu.then((resp) => {
       // console.log(error, result, rows, fields);
        res.json(resp)

    }).catch((err) => {
        console.log(err);
    });

});

router.get('/alumno/:id', (req, res) => {
    const {
        id
    } = req.params;
    const qu = pool.query('select * from alumnos_ where id = ?', [id]);
    qu.then((resp) => {
       // console.log(error, result, rows, fields);
        res.json(resp)

    }).catch((err) => {
        console.log(err);
    });

});

router.get('/infoalumno/:id', (req, res) => {

    const {
        id
    } = req.params;
    const qu = pool.query('select * from alumnos_ where id = ?', [id]);

    const alumno = [];

    qu.then((data) => {

        console.log(alumno)
        data.forEach((data) => {
            alumno.push(data);
        });

        res.render('public/info', {
            alumno
        });

    }).catch((err) => {
        console.log(err)
    });

});

router.get('/infocliente/:id', (req, res) => {

    const {
        id
    } = req.params;
    const qu = pool.query('select * from clientes_ where id = ?', [id]);

    const cliente = [];

    qu.then((data) => {

        //console.log(cliente)
        data.forEach((data) => {
            cliente.push(data);
        });

        res.render('public/info', {
            cliente
        });

    }).catch((err) => {
        console.log(err)
    });

});

//Ensure

function ensureToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    console.log(bearerHeader);

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

router.get('/cliente/:id', (req, res) => {
    const {id} = req.params;

    const qu = pool.query('SELECT * FROM clientes_ where id = ? ',[id]);

    qu.then((data) => {
        res.json(data);
    });
})


router.get('/alumno-cartera/:id', (req, res) => {
    const {id} = req.params;
    const qu = pool.query('SELECT * FROM cartera_ where id_alumno = ? ',[id]);
    qu.then((data) => {
        res.json(data);
    });
})

router.get('/clients', (req, res) => {
    const qu = pool.query('SELECT * FROM clientes_ ');

    qu.then((data) => {
        res.json(data);
    });
})


router.get('/client/alumnos/:id', (req, res) => {
    const id_cliente = req.params;
        console.log(id_cliente);
    const qu = pool.query('SELECT * FROM alumnos_ where id_cliente = ?',[id_cliente.id]);

    qu.then((data) => {
        res.json(data);
    });
})

router.get('/client/pagos/:id', (req, res) => {
    const id_cliente = req.params.id;
        
    const qu = pool.query('SELECT * FROM pagos_ where id_cliente = ?',[id_cliente]);

    qu.then((data) => {
        res.json(data);
    });
})


router.get('/pago/data/:id', (req, res) => {
    const id = req.params.id;
        
    const qu = pool.query('SELECT * FROM pagos_ where id = ?',[id]);

    qu.then((data) => {
        res.json(data);
    });
});

router.get('/pagos/all', (req, res) => {
    
        
    const qu = pool.query('SELECT * FROM pagos_ ');

    qu.then((data) => {
        res.json(data);
    });
});


router.get('/pagos/current_year/', (req, res) => {
     
        
    const qu = pool.query('SELECT * FROM pagos_ where YEAR(created_at) = YEAR(CURDATE())');

    qu.then((data) => {
        res.json(data);
    });
});

router.get('/pagos/current_month/', (req, res) => {    
        
    const qu = pool.query('SELECT * FROM pagos_ where Month(created_at) = Month(CURDATE()) && YEAR(created_at) = YEAR(CURDATE())');

    qu.then((data) => {
        res.json(data);
    });
});
router.get('/pagos/current_month/count', (req, res) => {    
        
    const qu = pool.query('SELECT count(*) totalPagosMes FROM pagos_ where Month(created_at) = Month(CURDATE()) && YEAR(created_at) = YEAR(CURDATE())');

    qu.then((data) => {
        res.json(data);
    });
});





router.post('/pago-add-personal', (req, res) => {
    console.log(req.body);

    const pago = req.body;    
    const qu = pool.query('Insert into pagos_personal set ?', [pago]);        
    qu.then(async (result) => {
        if (result.insertId) {
            //const query = await pool.query('Update clientes_ set id_cartera = ? where id = ?', [result.insertId, id_cliente]);
            req.flash('message', 'Pago creado con éxito! Actualiza la info de este cliente segun corresponda!');
            res.redirect('info_personal/'+req.body.id_staff);
        }
    }).catch((err) => {
        console.log(err);
    });
});



router.post('/pago-add', (req, res) => {
    console.log(req.body);

    const pago = req.body;    
    const qu = pool.query('Insert into pagos_ set ?', [pago]);        
    qu.then(async (result) => {
        if (result.insertId) {
            //const query = await pool.query('Update clientes_ set id_cartera = ? where id = ?', [result.insertId, id_cliente]);
            req.flash('message', 'Pago creado con éxito! Actualiza la info de este cliente segun corresponda!');
            res.redirect('infocliente/'+req.body.id_cliente);
        }
    }).catch((err) => {
        console.log(err);
    });
});



router.get('/pagos-personal-list/:id', (req, res) => {
    
    const id = req.params.id;
    const qu = pool.query(' SELECT * from pagos_personal where id = ?',[id]);
    qu.then(async (result) => {        
            console.log(result);                     
            res.json(result);        
    }).catch((err) => {
        console.log(err);
    });

});




router.post('/expenses-add', (req, res) => {
    console.log(req.body);

    const pago = req.body;
    
    const qu = pool.query('Insert into expensas_ set ?', [pago]);
    
    
    qu.then(async (result) => {
        if (result.insertId) {
            console.log(result);
            //const query = await pool.query('Update clientes_ set id_cartera = ? where id = ?', [result.insertId, id_cliente]);
            req.flash('message', 'Ticket creado con éxito!');
            res.redirect('/dashboard');
        }

    }).catch((err) => {
        console.log(err);
    });

});


router.get('/expenses-month-get', (req, res) => {
    console.log(req.body);

    const pago = req.body;
    
    const qu = pool.query('Select * from expensas_  Where Month(created_at) = Month(CURDATE()) || Year(created_at) = Year(CURDATE()) ');
    
    
    qu.then(async (result) => {        
            console.log(result);                     
            res.json(result);
        

    }).catch((err) => {
        console.log(err);
    });

});


//  


router.get('/cliente-pagos-all/:id', (req, res) => {
 
    const id = req.params.id;
    
    const qu = pool.query('Select * from pagos_ where id_cliente = ?',[id]);
    
    
    qu.then(async (result) => {        
            console.log(result);                     
            res.json(result);
        

    }).catch((err) => {
        console.log(err);
    });

});


router.get('/clientesEnDeuda', (req, res) => {
    console.log(req.body);

    const pago = req.body;    
    const qu = pool.query('SELECT * FROM clientes_ where estado = "deudor"');        
    qu.then(async (result) => {
        res.json(result)
    }).catch((err) => {
        console.log(err);
    });
});


router.get('/alumnosPrim', (req, res) => {
    console.log(req.body);

    const pago = req.body;    
    const qu = pool.query('SELECT * FROM alumnos_ where nivel = "primaria"');        
    qu.then(async (result) => {
        res.json(result)
    }).catch((err) => {
        console.log(err);
    });
});


router.get('/alumnosPree', (req, res) => {
    console.log(req.body);

    const pago = req.body;    
    const qu = pool.query('SELECT * FROM alumnos_ where nivel = "preescolar"');        
    qu.then(async (result) => {
        res.json(result)
    }).catch((err) => {
        console.log(err);
    });
});



router.get('/reiniciar-colegiaturas/', (req, res) => {
    console.log(req.body);

    const pago = req.body;  
    
    const qu = pool.query("UPDATE clientes_ set estado = 'Deudor' " );
   
});


router.get('/pagos-cliente-all-accounts/:id', (req, res) => {    
        const id = req.params.id;
        console.log(id)
        const qu = pool.query(`
        SELECT  pagos, saldofavor , saldoencontra 
        FROM (
        select sum(amount) pagos from pagos_ where id_cliente =  ${id}  
        ) a
        INNER JOIN (
        select sum(saldo_afavor) saldofavor from pagos_ where id_cliente =   ${id} 
        ) b on 1=1
        INNER JOIN (
        select sum(saldo_pendiente) saldoencontra from pagos_ where id_cliente =  ${id} 
        ) c on 1=1  
    `);

    qu.then((data) => {
        res.json(data);
    });
});


router.get('/colegiaturasReporte', (req, res) => {    
    const id = req.params.id;
    console.log(id)
    const qu = pool.query(`
    SELECT  primariaTotal, preescolarT 
    FROM (
        select sum(colegiatura) pagos from alumnos_ where nivel = 'primaria' && Month(created_at) = Month(CURDATE()) && Year(created_at) = Year(CURDATE()) ;
    ) a
    INNER JOIN (
        select sum(colegiatura) pagos from alumnos_ where nivel = 'preescolar' && Month(created_at) = Month(CURDATE()) && Year(created_at) = Year(CURDATE()) ;
    ) b on 1=1
     
`);

qu.then((data) => {
    res.json(data);
});
});

router.get('/expenses/current_month', (req, res) => {    
        
    const qu = pool.query("SELECT * FROM expensas_ where  Month(created_at) = Month(CURDATE()) || Year(created_at) = Year(CURDATE()) ");

    qu.then((data) => {
        res.json(data);
    });
});

router.get('/pagos/current_month/dates', (req, res) => {    
        
    const qu = pool.query("SELECT distinct DATE_FORMAT(created_at,'%d/%m/%Y') created_at  FROM pagos_ where Month(created_at) = Month(CURDATE())");

    qu.then((data) => {
        res.json(data);
    });
});

router.get('/pagos/current_month/count_per_day', (req, res) => {    
        
    const qu = pool.query("SELECT DATE_FORMAT(created_at,'%d/%m/%Y') day , count(created_at) pagos FROM pagos_ where Month(created_at) = Month(CURDATE()) group by Day(created_at);");

    qu.then((data) => {
        res.json(data);
    });
});

router.get('/pagos/current_month/all_pagos', (req, res) => {    
        
    const qu = pool.query("SELECT count( DATE_FORMAT(created_at,'%d/%m/%Y') ) total FROM pagos_ where Month(created_at) = Month(CURDATE());");

    qu.then((data) => {
        res.json(data);
    });
});


//Estados para tablas


router.get('/alumnos-count/', (req, res) => {    
        
    const qu = pool.query("SELECT count(*) totalAlumnos from alumnos_ ;");

    qu.then((data) => {
        res.json(data);
    });
});


router.get('/clientes-count/', (req, res) => {    
        
    const qu = pool.query("SELECT count(*) totalClientes from clientes_ ;");

    qu.then((data) => {
        res.json(data);
    });
});


router.get('/alumnos-nivel-count/', (req, res) => {    
        
            const qu = pool.query(`
            SELECT  primero, segundo, tercero, cuarto, quinto, sexto
    FROM (
         select Count(*) primero from alumnos_ where grado like '1' 
         ) a
    INNER JOIN (
         select Count(*) segundo from alumnos_ where grado like '2' 
         ) b on 1=1
             INNER JOIN (
         select Count(*) tercero from alumnos_ where grado like '3' 
         ) c on 1=1
             INNER JOIN (
         select Count(*) cuarto from alumnos_ where grado like '4' 
         ) d on 1=1
             INNER JOIN (
         select Count(*) quinto from alumnos_ where grado like '5' 
         ) e on 1=1
             INNER JOIN (
         select Count(*) sexto from alumnos_ where grado like '6' 
         ) f on 1=1            
                 `);
        
            qu.then((data) => {
                res.json(data);
            });
        });

         router.get('/alumnos-genero-count/', (req, res) => {    
        
            const qu = pool.query(`SELECT  masculinos, femeninos, total
                FROM (
                    select Count(*) masculinos from alumnos_ where sexo like 'masculin' 
                    ) a
                INNER JOIN (
                    select Count(*) femeninos from alumnos_ where sexo like 'femenino' 
                    ) b on 1=1
                 INNER JOIN (
                    select Count(*) total from alumnos_  
                    ) c on 1=1
                 `);
        
            qu.then((data) => {
                res.json(data);
            });
        });

router.get('/alumnos-estados-count/', (req, res) => {    
        
    const qu = pool.query(`SELECT totalVigentes, totalNoVigentes, totalEnProrroga, estadoSinAsignar
    FROM (
         SELECT count(*) totalVigentes from alumnos_ where estado = 'Vigente'
         ) a
    INNER JOIN (
         SELECT count(*) totalNoVigentes from alumnos_ where estado = 'Deudor' || estado = 'Prorroga'
         ) b on 1=1
    INNER JOIN (
        SELECT count(*) totalEnProrroga from alumnos_ where estado = 'Prorroga'
        ) c on 1=1
        INNER JOIN (
        SELECT count(*) estadoSinAsignar from alumnos_ where estado IS NULL
        ) d on 1=1`);

    qu.then((data) => {
        res.json(data);
    });
});






router.get('/clientes-estados-count/', (req, res) => {    
        
    const qu = pool.query(`SELECT totalVigentes, totalNoVigentes, totalEnProrroga, estadoSinAsignar
    FROM (
         SELECT count(*) totalVigentes from clientes_ where estado = 'Vigente'
         ) a
    INNER JOIN (
         SELECT count(*) totalNoVigentes from clientes_ where estado = 'Deudor' || estado = 'Prorroga'
         ) b on 1=1
    INNER JOIN (
        SELECT count(*) totalEnProrroga from clientes_ where estado = 'Prorroga'
        ) c on 1=1
        INNER JOIN (
        SELECT count(*) estadoSinAsignar from clientes_ where estado IS NULL
        ) d on 1=1`);

    qu.then((data) => {
        res.json(data);
    });
});



module.exports = router;