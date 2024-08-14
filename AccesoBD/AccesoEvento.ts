import { Collection, Db, ObjectId } from "mongodb";
import { Evento } from "../Evento";

export class AccesoEvento{
    url: String;
    database: Db;
    collection: Collection;

    constructor(url: String, database: Db, collection: Collection){
        this.url = url;
        this.database = database;
        this.collection = collection;
    }

    public async getEvento(nombre: String) {
        const filtro = { nombre: nombre };
        const usuario = await this.collection.findOne(filtro);
        return usuario;
    }

    public async getEventoPorId(id: string) {
        const filtro = { _id: new ObjectId(id) };
        const usuario = await this.collection.findOne(filtro);
        return usuario;
    }

    public async getEventos(pagina: any, itemsPorPagina: any){
        return {
            eventos: await this.collection.find().skip(pagina*itemsPorPagina).limit(itemsPorPagina).toArray(),
            hayMas: (await this.collection.find().toArray()).length>=itemsPorPagina*(Number(pagina)+1)
        }
    }
    public async cambiarEstadoEvento(id: string, estado: string, nombre: string){
        this.getEventoPorId(id).then((v) => {
            if(v == undefined){
                return;
            }
            else{
                let contribucionesTemp = v.contribuciones;
                for(let i = 0; i<contribucionesTemp.length; i++){
                    if(contribucionesTemp[i].nombreUsuario == nombre && contribucionesTemp[i].estado == "PENDIENTE"){
                        contribucionesTemp[i].estado = estado;
                    }
                }
                this.collection.updateOne({_id: new ObjectId(id)}, { $set: {contribuciones: contribucionesTemp} });
                return "todo bien";
            }
        })
    }
    public async subirEvento(evento: Evento){
        this.collection.insertOne(JSON.parse(JSON.stringify(evento)));
    }

    public async modificarEvento(evento: Evento, id: string){
        const filtro = { _id: new ObjectId(id) };
        this.collection.findOneAndReplace(filtro, JSON.parse(JSON.stringify(evento)));
    }

    public async borrarEvento(nombre: String){
        const filtro = { nombre: nombre };
        this.collection.findOneAndDelete(filtro);
    }
    public async borrarEventoXid(id: string){
        const filtro = { _id: new ObjectId(id) };
        this.collection.findOneAndDelete(filtro);
    }
    

    public async getEventoTag(tags: Array<String>, pagina: any, itemsPorPagina: any){
        const filtro = { tags: { $all: tags } };
        return {
            eventos: await this.collection.find(filtro).skip(pagina*itemsPorPagina).limit(itemsPorPagina).toArray(),
            hayMas: (await this.collection.find(filtro).toArray()).length>=itemsPorPagina*(Number(pagina)+1)
        }
    }

    public async getTags(){
        return await this.collection.distinct("tags");
    }

    public async realizarAporte(titulo: string, descripcion: string, nombre: string, contribucion: string, idEvento: any, estado: string) {
        let elId = new ObjectId(idEvento)
        const eventoEncontrado = await this.collection.find({ _id: elId }).toArray();
        if (eventoEncontrado.length > 0) {
            return await this.collection.updateOne({ _id: elId }, {
                $push: {
                    contribuciones: {
                        titulo: titulo,
                        descripcion: descripcion,
                        nombreUsuario: nombre,
                        contribucion: contribucion,
                        estado: estado
                    }
                }
            });
        }
        else{
            console.log("no lo encuentra")
        }
    }
}