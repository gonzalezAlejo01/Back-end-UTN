import { TipoParticipacion } from "./TipoParticipacion";

export class Participacion{
    nombreInvestigador: String;
    tipoParticipacion: TipoParticipacion;

    constructor(nombreInvestigador: String, tipoParticipacion: TipoParticipacion){
        this.nombreInvestigador = nombreInvestigador;
        this.tipoParticipacion = tipoParticipacion;
    }
}