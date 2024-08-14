import jwt from "jsonwebtoken";
import { accesoAdmin } from "./Controladores/ControladorAdministradores";
import { accesoUsuario } from "./Controladores/ControladorUsuarios";

export const claveSecretaInv = "Utn-Clave-Inv";
export const claveSecretaAdmin = "Utn-Clave-Admin";

//investigador
export function generarClaveInv(nombre: String): string{
    let dataFirma = {
        "nombre": nombre
    }
    let respuesta = jwt.sign(dataFirma, claveSecretaInv);

    return respuesta;
}

export function verificarClaveInv(req: any, res: any, next: any){
    const clave = req.headers.authorization;

    if (clave == undefined) {
        return res.status(401).send('Unauthorized: No token provided.');
    }

    try {
        const payload: any = jwt.verify(clave, claveSecretaInv);
        accesoUsuario.getUsuario(payload.nombre).then((v) => {
            if(v == undefined){
                res.status(404).send("usuario no encontrado");
                return;
            }
            else{
                req.body.nombreVerificado = payload.nombre;
                next()
            }
        })
    }
    catch (err) {
        return res.status(401).send('Unauthorized: Invalid token.');
    }
}

//Administrador
export function generarClaveAdmin(nombre: String): string{
    let dataFirma = {
        "nombre": nombre
    }
    let respuesta = jwt.sign(dataFirma, claveSecretaAdmin);

    return respuesta;
}

export function verificarClaveAdmin(req: any, res: any, next: any){
    console.log("verificarAdmin")
    const clave = req.headers.authorization;

    if (clave == undefined) {
        return res.status(401).send('Unauthorized: No token provided.');
    }

    try {
        const payload: any = jwt.verify(clave, claveSecretaAdmin);
        req.body.nombreVerificado = payload.nombre;
        accesoAdmin.getUsuario(payload.nombre).then((v) => {
            if(v == undefined){
                res.status(404).send("usuario no encontrado");
                return;
            }
            else{
                next()
            }
        })
    }
    catch (err) {
        return res.status(401).send('Unauthorized: Invalid token.');
    }
}