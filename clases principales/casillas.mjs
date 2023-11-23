import {objeto, imp} from "./globales.mjs";
import { alfil, torre, rey} from "./piezas.mjs";

class casilla extends objeto{
    constructor(pos){
        if(pos < 8 || (pos >= 16 && pos < 24) || (pos >= 32 && pos < 40) || (pos >= 48 && pos < 56)){
            super(pos, pos, (objeto.formatoColor(pos)?"█":"▓"));
        }else{
            super(pos, pos + 1, (objeto.formatoColor(pos + 1)?"█":"▓"));
        }
    }
    imprimir(){
        if(this.__select){
            imp("░");
            return;
        }
        super.imprimir();
    }

    recalcularAmenaza(tablero){
        let r = null;
        this.amenazas.map((mov)=>{
            if(mov.origen instanceof alfil || mov.origen instanceof torre){
                let pi = mov.origen;
                pi.movimientos(tablero).map((movs)=>{
                    movs.map((obj, n, m)=>{
                        if(obj instanceof rey){
                            if(m.origen.color != obj.color){
                                r = obj;
                            }
                        }else{
                            obj.amenazar(m);
                        }
                    });
                });
            }
        });
        return r;
    }
}
export{casilla};