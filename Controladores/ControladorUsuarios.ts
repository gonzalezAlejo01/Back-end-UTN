import { Router } from 'express';
import { Investigador } from '../Investigador';
import { AccesoUsuario, sha256 } from '../AccesoBD/AccesoUsuarios';
import { Db, MongoClient } from 'mongodb';
import { generarClaveInv, verificarClaveAdmin, verificarClaveInv } from '../jwt';

// Regex
const mailRegex: RegExp = new RegExp("[A-Za-z0-9]+@[a-z]+\.[a-z]{2,3}");
const contraRegex: RegExp = new RegExp("(?=.*[0-9])(?=.*[A-Z])[a-zA-Z0-9]");

// Base de datos
const url: string = "mongodb://127.0.0.1:27017/Gestion-de-eventos-academicos";
const client: MongoClient = new MongoClient(url);
const database: Db = client.db("Gestion-de-eventos-academicos");
export var accesoUsuario: AccesoUsuario = new AccesoUsuario(url, database, database.collection("Investigador"))

// Enrutador
export const RutasUsuarios = Router();

//lista de usuarios
RutasUsuarios.get("/investigadores", verificarClaveAdmin, (_req, _res) => {
    accesoUsuario.getUsuarios().then((v) => {
        _res.send(v);
    })
})

//datos del usuario segun id
RutasUsuarios.get("/investigadores/:nombre", verificarClaveAdmin, (_req, _res) => {
    accesoUsuario.getUsuario(_req.params.nombre).then((v) => {
        if(!v){
            _res.status(400).send("este usuario no existe");
            return;
        }
        _res.send(v);
    })
})

//datos del usuario segun id
RutasUsuarios.get("/investigadoresInv/:nombre", verificarClaveInv, (_req, _res) => {
    accesoUsuario.getUsuario(_req.params.nombre).then((v) => {
        if(!v){
            _res.status(400).send("este usuario no existe");
            return;
        }
        _res.send(v);
    })
})


//subir nuevo usuario
RutasUsuarios.post("/investigadores", verificarClaveAdmin, (_req, _res) => {
    console.log(_req.body)
    if(!_req.body.correo ||  !_req.body.nombre || !_req.body.contrasenia ||  !_req.body.fotoPerfil){
        _res.status(400).send("no se proporcionaron todos los datos");
        return;
    }
    if (!mailRegex.test(_req.body.correo)) {
        _res.status(400).send("mail invalido");
        return;
    
    }
    if (_req.body.contrasenia.length < 8 || !contraRegex.test(_req.body.contrasenia)) {
        _res.status(400).send("contraseña insegura");
        return;
    }

    accesoUsuario.getUsuario(_req.body.nombre).then((v) => {
        if (v != undefined) {
            _res.status(400).send("no se pudo crear, nombre ya en uso");
            return;
        }
        else {
            const usuarioTemp = new Investigador(_req.body.correo, _req.body.contrasenia, _req.body.nombre, "fotoPerfil/" + _req.body.fotoPerfil);
            accesoUsuario.subirUsuario(usuarioTemp);
            _res.json(usuarioTemp);
        }
    })
})

//borrar usuario
RutasUsuarios.delete("/investigadores/:nombre", verificarClaveAdmin, (_req, _res) => {
    accesoUsuario.getUsuario(_req.params.nombre).then((v) => {
        if (v == undefined) {
            _res.send("no existe");
            return;
        }
        else {
            accesoUsuario.borrarUsuario(_req.params.nombre);
            _res.status(204).send();
        }
    })
})

//modificarse asi mismo
RutasUsuarios.patch("/investigadoresEdit", verificarClaveInv, (_req, _res) => {
    accesoUsuario.getUsuario(_req.body.nombreVerificado).then((v) => {
        if (v == undefined) {
            _res.send("no existe");
            return;
        }
        else {
            var usuarioTemp = new Investigador(v.correo, v.contraseña, v.nombre, v.fotoPerfil);
            if (_req.body.correo) {
                if(!mailRegex.test(_req.body.correo)){
                    _res.status(400).send("mail invalido")
                }
                else{
                    usuarioTemp.correo = _req.body.correo;
                }
            }
            if (_req.body.contra) {
                if (_req.body.contra.length < 8 || !contraRegex.test(_req.body.contra)) {
                    _res.status(400).send("contraseña insegura");
                    return;
                }
                else{
                    usuarioTemp.contraseña = sha256(_req.body.contra);
                }
            }
            if (_req.body.fotoPerfil) {
                usuarioTemp.fotoPerfil =  "fotoPerfil/" + _req.body.fotoPerfil;
            }
            accesoUsuario.modificarUsuario(usuarioTemp);
            _res.json(usuarioTemp);
        }
    })
})

//modificar parte del usuario
RutasUsuarios.patch("/investigadores/:nombre", verificarClaveAdmin, (_req, _res) => {
    accesoUsuario.getUsuario(_req.params.nombre).then((v) => {
        if (v == undefined) {
            _res.send("no existe");
            return;
        }
        else {
            var usuarioTemp = new Investigador(v.correo, v.contraseña, v.nombre, v.fotoPerfil);
            if (_req.body.correo) {
                if(!mailRegex.test(_req.body.correo)){
                    _res.status(400).send("mail invalido");
                    return;
                }
                usuarioTemp.correo = _req.body.correo;
            }
            if (_req.body.contraseña) {
                if (_req.body.contraseña.length < 8 || !contraRegex.test(_req.body.contraseña)) {
                    _res.status(400).send("contraseña insegura");
                    return;
                }
                usuarioTemp.contraseña = sha256(_req.body.contraseña);
            }
            if (_req.body.fotoPerfil) {
                usuarioTemp.fotoPerfil =  "fotoPerfil/" + _req.body.fotoPerfil;
            }
            accesoUsuario.modificarUsuario(usuarioTemp);
            _res.json(usuarioTemp);
        }
    })
})

// Registrarse
RutasUsuarios.post("/registrarse", (_req, _res) => {
    console.log("epic");
    if(!_req.body.correo || !_req.body.contraseña){
        _res.status(400).send("no se proporcionaron todos los datos");
        return;
    }
    //  mail formato valido
    if (!mailRegex.test(_req.body.correo)) {
        _res.status(400).send("mail invalido");
        return;
    }

    // contraseña formato seguro
    if (_req.body.contraseña.length < 8 || !contraRegex.test(_req.body.contraseña)) {
        _res.status(400).send("contraseña insegura");
        return;
    }
    console.log("epic2")
    accesoUsuario.getUsuario(_req.body.nombre).then((v: any) => {
        if (v != undefined) {
            _res.status(400).send("nombre de usuario ya en uso");
        }
        else {
            accesoUsuario.getUsuario(_req.body.correo).then((b: any) => {
                if (v != undefined) {
                    _res.status(400).send("nombre de usuario ya en uso");
                }
                else {
                    accesoUsuario.registrarse(_req.body.nombre, _req.body.contraseña, _req.body.correo).then((b) => {
                        _res.json(b);
                    })
                }
            })
        }
    })
})
// Login
RutasUsuarios.post("/login", (_req, _res) => {
    if(!_req.body.nombre || !_req.body.contraseña){
        _res.status(400).send("no se proporcionaron todos los datos");
        return;
    }
    accesoUsuario.getUsuario(_req.body.nombre).then((b) => {
        if (b) {
            accesoUsuario.login(_req.body.nombre, _req.body.contraseña).then((v) => {
                if (v) {
                    if (v == "todo bien") {
                        let respuesta: JSON = JSON.parse(JSON.stringify(b));
                        Object.assign(respuesta, { "claveJWT": generarClaveInv(_req.body.nombre) });
                        _res.json(respuesta);
                    }
                    else {
                        _res.status(400).json(v);
                    }
                }
            });
        }
        else {
            _res.status(404).json("usuario no encontrado");
        }
    })
})