export class Contribucion {
    archivo: string;
    titulo: string;
    descripcion: string;
    nombre: string;
    estado: string;

    constructor(archivo: string, titulo: string, descripcion: string, nombre: string, estado: string) {
        this.archivo = archivo;
        this.descripcion = descripcion;
        this.nombre = nombre;
        this.titulo = titulo;
        this.estado = estado;
    }
}