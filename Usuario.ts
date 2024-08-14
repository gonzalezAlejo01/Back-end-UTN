export class Usuario{
 correo: String;
 contraseña: String;
 nombre: String;
 fotoPerfil: String;

 constructor(correo: string, contraseña: String, nombre: String, fotoPerfil: string){
    this.correo = correo;
    this.contraseña = contraseña;
    this.nombre = nombre;
    this.fotoPerfil = fotoPerfil;
    }
}