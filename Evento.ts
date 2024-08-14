import { Contribucion } from "./Contribucion";
import { LugarDesarrollo } from "./LugarDesarrollo";

export class Evento{
    nombre: String;
    fecha: Date;
    fechaCierreConvocatoria: Date;
    lugarDesarrollo: LugarDesarrollo;
    tags: Array<string>;
    contribuciones: Array<Contribucion>;
    nombreAdmin: string;
    descripcion: string;
    
    constructor(nombre: String, fecha: Date, fechaCierreConvocatoria: Date,
        lugarDesarrollo: LugarDesarrollo, tags: Array<string>, contribuciones: Array<Contribucion>, nombreAdmin: string, descripcion: string){
            this.fecha = fecha;
            this.fechaCierreConvocatoria = fechaCierreConvocatoria;
            this.lugarDesarrollo = lugarDesarrollo;
            this.nombre = nombre;
            this.tags = tags;
            this.contribuciones = contribuciones;
            this.nombreAdmin = nombreAdmin;
            this.descripcion = descripcion;
        }
}