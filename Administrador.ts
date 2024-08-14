export class Administrador{
    nombre: String;
    contraseña: String;
    esSuper: boolean;

    constructor(nombre: String, contraseña: String, esSuper: boolean){
        this.nombre = nombre;
        this.contraseña = contraseña;
        this.esSuper = esSuper;
    }
}