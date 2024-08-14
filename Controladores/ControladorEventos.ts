import { Router } from "express";
import { Db, MongoClient, ObjectId } from "mongodb";
import { AccesoEvento } from "../AccesoBD/AccesoEvento";
import { Evento } from "../Evento";
import { verificarClaveAdmin, verificarClaveInv } from "../jwt";
import { accesoLugar } from "./ControladorLugar";
const urlArchivos: string = "http://localhost:3000/archivos/"

const url: string = "mongodb://127.0.0.1:27017/Gestion-de-eventos-academicos";
const client: MongoClient = new MongoClient(url);
const database: Db = client.db("Gestion-de-eventos-academicos");

var accesoEventos: AccesoEvento = new AccesoEvento(url, database, database.collection("Evento"));

export const RutasEventos = Router();

function isValidDate(dateString: string): boolean {
    const dateParts = dateString.split("-");

    if (dateParts.length !== 3) {
        return false;
    }

    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return false;
    }

    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

function eliminarTagsRepetidos(tags: Array<string>){
    // Utilizamos un Set para almacenar palabras únicas y un array para las duplicadas
  const palabrasUnicas = new Set<string>();

  for (const palabra of tags) {
    if (!palabrasUnicas.has(palabra)) {
      palabrasUnicas.add(palabra); // Agregamos la palabra al set de únicas
    }
  }

  // Convertimos el Set de palabras únicas de nuevo a un array y lo retornamos
  return Array.from(palabrasUnicas);
}

//lista de eventos
RutasEventos.get("/eventos", (_req,_res) => {
    const itemsPorPagina = 8;
    const pagina = _req.headers?.['x-pagina'] || 0;
    accesoEventos.getEventos(pagina, itemsPorPagina).then((v)=>{
        _res.send(v);
    })
})

//datos del usuario segun id
RutasEventos.get("/eventos/:_id", (_req, _res) => {
    if(!ObjectId.isValid(_req.params._id)){
        _res.status(400).send("id invalido");
        return;
    }
    accesoEventos.getEventoPorId(_req.params._id).then((v) => {
        if (!v) {
            _res.status(400).send("no existe un evento con ese id");
            return;
        }
        v.urlArchivos = urlArchivos;
        _res.send(v);
    })
})

//subir nuevo evento
RutasEventos.post("/eventos", verificarClaveAdmin, (_req, _res) => {
    console.log(_req.body)
    if (!_req.body.nombre || !_req.body.fecha || !_req.body.fechaCierreConvocatoria || !_req.body.lugarDesarrollo || !_req.body.descripcion) {
        console.log("falto algo")
        _res.status(400).send("no se proporcionaron todos los datos");
        return;
    }
    if (!isValidDate(_req.body.fecha)) {
        _res.status(400).send("fecha invalida");
        return;
    }
    if (!isValidDate(_req.body.fechaCierreConvocatoria)) {
        _res.status(400).send("fecha del cierre de la convocatoria invalida");
        return;
    }

    if(_req.body.tags){
        if(!Array.isArray(_req.body.tags)){
            _res.status(400).send("formato de tags invalido");
            return;
        }
        for(const tag of _req.body.tags){
            console.log(tag)
            if(typeof tag != "string"){
                _res.status(400).send("formato de tags invalido");
                return;
            }
        }
        _req.body.tags = eliminarTagsRepetidos(_req.body.tags);
    }
    else{
        _req.body.tags = [];
    }

    accesoLugar.getLugarPorNombre(_req.body.lugarDesarrollo).then((b) => {
        if (!b) {
            _res.status(400).send("no existe el lugar");
            return;
        }
        console.log("a crear")
        accesoEventos.getEvento(_req.body.nombre).then((v) => {
            if (v != undefined) {
                _res.send("no se pudo crear, ya existe un evento con ese nombre");
                return;
            }
            else {
                const eventoTemp: Evento = new Evento(_req.body.nombre, _req.body.fecha,
                    _req.body.fechaCierreConvocatoria, _req.body.lugarDesarrollo, _req.body.tags,
                    [], _req.body.nombreVerificado, _req.body.descripcion);
                accesoEventos.subirEvento(eventoTemp);
                _res.json(eventoTemp);
            }
        })
    })
})

//borrar evento
RutasEventos.delete("/eventos/:_id", verificarClaveAdmin, (_req, _res) => {
    if(!ObjectId.isValid(_req.params._id)){
        _res.status(400).send("id invalido");
        return;
    }
    accesoEventos.getEventoPorId(_req.params._id).then((v) => {
        if (v == undefined) {
            _res.send("no existe");
            return;
        }
        else {
            accesoEventos.borrarEventoXid(_req.params._id);
            _res.status(204).send();
        }
    })
})

//modificar parte del evento
RutasEventos.patch("/eventos/:_id", verificarClaveAdmin, (_req, _res) => {
    if(!ObjectId.isValid(_req.params._id)){
        _res.status(400).send("id invalido");
        return;
    }
    accesoEventos.getEvento(_req.params._id).then((v) => {
        if (v == undefined) {
            _res.send("no existe");
            return;
        }
        else {
            var eventoTemp: Evento = new Evento(v.nombre, v.fecha, v.fechaCierreConvocatoria
                , v.lugarDesarrollo, v.tags, v.usuarios, v.nombreAdmin, v.descripcion);
            if (_req.body.fecha) {
                if (!isValidDate(_req.body.fecha)) {
                    _res.status(400).send("fecha invalida");
                    return;
                }
                eventoTemp.fecha = _req.body.fecha;
            }
            if (_req.body.fechaCierreConvocatoria) {
                if (!isValidDate(_req.body.fechaCierreConvocatoria)) {
                    _res.status(400).send("fecha del cierre de la convocatoria invalida");
                    return;
                }
                eventoTemp.fechaCierreConvocatoria = _req.body.fechaCierreConvocatoria;
            }
            if(_req.body.descripcion){
                eventoTemp.descripcion = _req.body.descripcion;
            }
            accesoEventos.modificarEvento(eventoTemp, _req.params._id);
            _res.json(eventoTemp);
        }
    })
})

//lista tags
RutasEventos.get("/eventosTags", (_req, _res) => {
    accesoEventos.getTags().then((v) => {
        _res.json(v);
    })
})

//busqueda eventos por tags
RutasEventos.get("/eventosTags/busquedaTags/:tags", (_req, _res) => {
    console.log("tags: "+_req.body.tags)
    var tagsTemp:any = _req.params.tags
    tagsTemp = tagsTemp.replace(" ","")
    tagsTemp = tagsTemp.split(",")
    const itemsPorPagina = 8;
    const pagina = _req.headers?.['x-pagina'] || 0;
    accesoEventos.getEventoTag(tagsTemp, pagina, itemsPorPagina).then((v) => {
        _res.json(v);
    })
})
RutasEventos.patch("/eventos/estado/:_id",  (_req, _res) => {
    if(!ObjectId.isValid(_req.params._id)){
        _res.status(400).send("id invalido");
        return;
    }
    accesoEventos.getEventoPorId(_req.params._id).then((v) => {
        if (!v) {
            _res.status(400).send("no existe un evento con ese id");
            return;
        }
        accesoEventos.cambiarEstadoEvento(_req.params._id, _req.body.estado, _req.body.nombre).then((b: any) => {
            if(b != "todo bien"){
                console.log(b)
                _res.status(400).send("no se pudo cambiar el estado");
                return;
            }
            _res.status(200).send("estado cambiado");
        })
    })
})

RutasEventos.post("/eventos/contribucion", verificarClaveInv, (req, res) => {
    if(!ObjectId.isValid(req.body.idEvento)){
        res.status(400).send("id invalido");
        return;
    }
    console.log(req.body)
    if (!req.body.contribucion || !req.body.titulo || !req.body.descripcion || !req.body.idEvento || !req.body.nombreVerificado) {
        res.status(400).send("no se proporcionaron todos los datos");
        return;
    }

    if (req.body.titulo == "" || req.body.descripcion == "") {
        res.status(400).send("titulo o descripcion vacia");
        return;
    }

    if (!ObjectId.isValid(req.body.idEvento)) {
        res.status(400).send("id de evento invalido");
        return;
    }

    accesoEventos.getEventoPorId(req.body.idEvento).then((v) => {
        if (!v) {
            res.status(400).send("este evento no existe");
            return;
        }
        for (const contribucion of v.contribuciones) {
            if (contribucion.nombreUsuario == req.body.nombreVerificado) {
                res.status(400).send("ya contribuiste a este evento");
                return;
            }
        }
        accesoEventos.realizarAporte(req.body.titulo, req.body.descripcion, req.body.nombreVerificado, req.body.contribucion, req.body.idEvento, "pendiente").then((b) => {
            res.json(b);
        })
    })
})

RutasEventos.get("/eventosAportesUsuario", verificarClaveInv, (req, res) => {
    let contribuciones:any = []
    accesoEventos.getEventos(0, 9999).then((v) => {
        var eventos = v.eventos
        for (let evento of eventos) {
            for (let contribucion of evento.contribuciones) {
                if (contribucion.nombreUsuario = req.body.nombreVerificado) {
                    contribuciones.push(contribucion)
                }
            }
        }
        res.json(contribuciones)
    })
})