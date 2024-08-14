import { Router } from "express";
import { Db, MongoClient } from "mongodb";
import { AccesoLugar } from "../AccesoBD/AccesoLugar";
import { LugarDesarrollo } from "../LugarDesarrollo";
import { verificarClaveAdmin } from "../jwt";
import { AccesoEvento } from "../AccesoBD/AccesoEvento";
export const rutasLugar = Router();

const url: string = "mongodb://127.0.0.1:27017/Gestion-de-eventos-academicos";
const client: MongoClient = new MongoClient(url);
const database: Db = client.db("Gestion-de-eventos-academicos");

export var accesoLugar: AccesoLugar = new AccesoLugar(url, database, database.collection("LugarDesarrollo"));

const urlImagenes = "http://localhost:3000/imagenes/"

// lista de lugares
rutasLugar.get("/lugares", verificarClaveAdmin, (req, res) => {
    accesoLugar.getLugares().then((v) => {
        res.json({lugares: v, urlImagenes: urlImagenes});
    })
})

// lugar por id
rutasLugar.get("/lugares/:_id", (req, res) => {
    accesoLugar.getLugar(req.params._id).then((v) => {
        if(!v){
            res.status(400).send("este lugar no existe");
            return;
        }
        res.json({lugar: v, urlImagenes: urlImagenes});
    })
})
rutasLugar.get("/lugaresXnombre/:nombre", (req, res) => {
    accesoLugar.getLugarPorNombre(req.params.nombre).then((v) => {
        if(!v){
            res.status(400).send("este lugar no existe");
            return;
        }
        res.json({lugar: v, urlImagenes: urlImagenes});
    })
})

// subir lugar
rutasLugar.post("/lugares", verificarClaveAdmin, (req, res) => {
    console.log(req.body)
    if (!req.body.nombre || !req.body.direccion || !req.body.fotoLugar) {
        res.status(400).send("no se proporcionaron todos los datos");
        return;
    }
    accesoLugar.getLugarPorNombre(req.body.nombre).then((v) => {
        if (v != undefined) {
            res.status(400).send("ya existe un lugar con ese nombre");
            return;
        }
        const lugar = new LugarDesarrollo(req.body.direccion, "fotoLugar/" + req.body.fotoLugar, req.body.nombre);
        accesoLugar.subirLugar(lugar).then((b) => {
            console.log(lugar)
            res.json(lugar);
        });

    })
})

// borrar lugar por id
rutasLugar.delete("/lugares/:_id", verificarClaveAdmin, (req, res) => {
    accesoLugar.getLugar(req.params._id).then((v) => {
        if (v == undefined) {
            res.status(400).send("no existe un lugar con ese id");
            return;
        }
        accesoLugar.borrarLugar(req.params._id);
        res.status(204).send("lugar borrado");
    })
})

// modificar lugar por id
rutasLugar.patch("/lugares/:_id", verificarClaveAdmin, (req, res) => {
    accesoLugar.getLugar(req.params._id).then((v) => {
        if (v == undefined) {
            res.status(400).send("no existe un lugar con ese id");
            return;
        }
        const lugar: LugarDesarrollo = new LugarDesarrollo(v.nombre, v.direccion, v.fotoLugar);
        if(req.body.direccion){
            lugar.direccion = req.body.direccion;
        }
        if(req.body.fotoLugar){
            lugar.fotoLugar = req.body.fotoLugar;
        }
        accesoLugar.modificarLugar(lugar, req.params._id);
        res.json(lugar);
    })
})