import { Router } from 'express';
import { AccesoUsuario } from '../AccesoBD/AccesoUsuarios';
import { Db, MongoClient } from 'mongodb';
import { claveSecretaAdmin, generarClaveAdmin, verificarClaveAdmin } from '../jwt';
import { Administrador } from '../Administrador';
import jwt from "jsonwebtoken";

const mailRegex: RegExp = new RegExp("[A-Za-z0-9]+@[a-z]+\.[a-z]{2,3}");
const contraRegex: RegExp = new RegExp("^(?=.*[A-Z])(?=.*[0-9]).{8,}$");

// Base de datos
const url: string = "mongodb://127.0.0.1:27017/Gestion-de-eventos-academicos";
const client: MongoClient = new MongoClient(url);
const database: Db = client.db("Gestion-de-eventos-academicos");
export var accesoAdmin: AccesoUsuario = new AccesoUsuario(url, database, database.collection("Administrador"));

accesoAdmin.borrarUsuario("admin").then((v) => {
    const usuarioTemp = new Administrador("admin", "Admin123", true);
    accesoAdmin.subirUsuario(usuarioTemp);    
});

export function checkAdmin(req: any, res: any, next:any){
    accesoAdmin.getUsuario(req.body.nombreUsuario).then((v) => {
        if(v == undefined){
            res.status(404).send("usuario no encontrado");
            return;
        }
        else{
            next()
        }
    })
}

export function checkSuper(req: any, res: any, next:any){
    const clave = req.headers.authorization;
    const payload: any = jwt.verify(clave, claveSecretaAdmin);
    accesoAdmin.getUsuario(payload.nombre).then((v) => {
        if(v == undefined){
            res.status(404).send("usuario no encontrado");
            return;
        }
        else{
            if(v.esSuper){
                next()
            }
            else{
                res.status(400).send("permisos insuficientes");
            }
        }
    })
}

// Enrutador
export const RutasAdmin = Router();

RutasAdmin.post("/LoginAdministrador", (req, res) => {
    if(!req.body.nombre || !req.body.contraseña){
        res.status(400).send("No se proporcionaron todos los datos");
        return;
    }
    accesoAdmin.getUsuario(req.body.nombre).then((b) => {
        if(b == undefined){
            res.status(400).send("No existe");
            return;
        }
        else{
            accesoAdmin.login(req.body.nombre, req.body.contraseña).then((v) => {
                if (v) {
                    if (v == "todo bien") {
                        let respuesta: JSON = JSON.parse(JSON.stringify(b));
                        Object.assign(respuesta, { "claveJWT": generarClaveAdmin(req.body.nombre) });
                        res.json(respuesta);
                    }
                    else {
                        res.status(400).json(v);
                    }
                }
            })
        }
    })
})

// Lista admin
RutasAdmin.get("/administradores", (req, res) =>{
    accesoAdmin.getUsuarios().then((v) => {
        res.json(v);
    })
})

// Admin segun nombre
RutasAdmin.get("/administradores/:nombre", (req, res) =>{
    accesoAdmin.getUsuario(req.params.nombre).then((v) => {
        res.json(v);
    })
})

//subir nuevo admin
RutasAdmin.post("/administradores", (req, res) => {
    console.log(req.body.esSuper)
    if(!req.body.nombre || !req.body.contraseña){
        res.status(400).send("no se proporcionaron todos los datos");
        return;
    }
    if(!contraRegex.test(req.body.contraseña)){
        res.status(400).send("La contraseña debe tener 8 caracteres minimo, un numero y un caracter especial");
        return;
    }
    if(req.body.esSuper != true && req.body.esSuper != false){
        res.status(400).send("dato invalido en el campo esSuper");
        return;
    }

    accesoAdmin.getUsuario(req.body.nombre).then((v) => {
        if (v != undefined) {
            res.status(400).send("no se pudo crear, nombre ya en uso");
            return;
        }
        else {
            const usuarioTemp = new Administrador(req.body.nombre, req.body.contraseña, req.body.esSuper)
            accesoAdmin.subirUsuario(usuarioTemp);
            res.json(usuarioTemp);
        }
    })
})

//borrar admin
RutasAdmin.delete("/administradores/:nombre", (req, res) => {
    accesoAdmin.getUsuario(req.params.nombre).then((v) => {
        if (v == undefined) {
            res.status(400).send("no existe");
            return;
        }
        else {
            accesoAdmin.borrarUsuario(req.params.nombre);
            res.status(204).send();
        }
    })
})

//modificar parte del admin
RutasAdmin.patch("/administradores/:nombre", (req, res) => {
    accesoAdmin.getUsuario(req.params.nombre).then((v) => {
        if (v == undefined) {
            res.send("no existe");
            return;
        }
        else {
            var usuarioTemp = new Administrador(v.nombre, v.contraseña, v.esSuper);
            if (req.body.contraseña) {
                usuarioTemp.contraseña = req.body.contraseña;
            }
            if (req.body.esSuper) {
                usuarioTemp.esSuper = req.body.esSuper;
            }
            accesoAdmin.modificarUsuario(usuarioTemp);
            res.json(usuarioTemp);
        }
    })
})