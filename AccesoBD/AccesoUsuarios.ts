import { Collection, Db } from "mongodb";
import { createHash } from 'node:crypto';
import { Investigador } from "../Investigador";

export function sha256(content: string) {  
    return createHash('sha256').update(content).digest('hex')
}

export class AccesoUsuario{
    url: String;
    database: Db;
    collection: Collection;

    constructor(url: String, database: Db, collection: Collection){
        this.url = url;
        this.database = database;
        this.collection = collection;
    }

    public async getUsuario(dato: string) {
        const filtro = { $or: [{nombre: dato}, {correo: dato}] };
        const usuario = await this.collection.findOne(filtro);
        return usuario;
    }

    public async getUsuarios(){
        return await this.collection.find().toArray();
    }

    public async subirUsuario(usuario: any){
        usuario.contraseña = sha256(usuario.contraseña);
        this.collection.insertOne(JSON.parse(JSON.stringify(usuario)));
    }

    public async modificarUsuario(usuario: any){
        const filtro = { nombre: usuario.nombre };
        this.collection.findOneAndReplace(filtro, JSON.parse(JSON.stringify(usuario)));
    }

    public async borrarUsuario(nombre: string){
        const filtro = { nombre: nombre };
        await this.collection.findOneAndDelete(filtro);
    }

    public async registrarse(nombre: string, contraseña: string, correo: string){
        const usuario = new Investigador(correo,sha256(contraseña),nombre, "");
        await this.collection.insertOne(usuario);
        return usuario;
    }

    public async login(nombre: string, contraseña: string){
        const v = await this.getUsuario(nombre);

        if(v != undefined){
            if(v.contraseña == sha256(contraseña)){
                return "todo bien";
            }
            else{
                return "contraseña incorrecta";
            }
        }
        else{
            return "usuario no encontrado";
        }
    }
}