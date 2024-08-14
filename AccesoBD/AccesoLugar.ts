import { Collection, Db, ObjectId } from "mongodb";
import { LugarDesarrollo } from "../LugarDesarrollo";

export class AccesoLugar{
    url: String;
    database: Db;
    collection: Collection;

    constructor(url: String, database: Db, collection: Collection){
        this.url = url;
        this.database = database;
        this.collection = collection;
    }

    public async getLugares(){
        return await this.collection.find().toArray();
    }

    public async getLugar(id: string){
        const filtro = {_id : new ObjectId(id)};
        return await this.collection.findOne(filtro);
    }

    public async getLugarPorNombre(nombre: String){
        const filtro = { nombre: nombre };
        return await this.collection.findOne(filtro);
    }

    public async subirLugar(lugar: LugarDesarrollo){
        this.collection.insertOne(JSON.parse(JSON.stringify(lugar)));
    }

    public borrarLugar(id: string){
        const filtro = {_id : new ObjectId(id)};
        this.collection.findOneAndDelete(filtro);
    }

    public modificarLugar(lugar: LugarDesarrollo, id: string){
        const filtro = {_id : new ObjectId(id)};
        this.collection.findOneAndReplace(filtro, JSON.parse(JSON.stringify(lugar)));
    }
}