import {objeto, movs, imp} from "./globales.mjs";
import {casilla} from "./casillas.mjs";

class pieza extends objeto{

    __casilla = null;

    constructor(posicion, color, simbolo, tablero){
        if (new.target === pieza) {
            throw new Error( 'No puedes instanciar una clase abstracta' );
        }
        if(!(tablero[posicion] instanceof casilla)){
            throw new Error("Intentas llenar una casilla con un parametro no valido");
        }
        super(posicion, color, simbolo);
        this.casilla = tablero[posicion];
        tablero[posicion] = this;
    }

    controlar(tablero){
        this.movimientos(tablero).map((obj)=>{
            obj.map((n, k, m)=>{
                this.amenazar(m);
            });
        });
    }

    descontrolar(tablero){
        let mov = this.movimientos(tablero);
        mov.map((obj)=>{
        obj.map((n)=>{
            n.aliviar(this);
            });
        });
    }

    validar(pos, tablero){
        var verdad = false;
        let movimientos = this.movimientos(tablero);
        if(typeof(movimientos) != "object"){
            throw new Error("Fomrato de movimientos incorrectos");
        }
        if(!this.amenasaRey(tablero)){
            movimientos.map((mov)=>{
                mov.map((objeto)=>{
                    if(objeto.posicion == pos){
                        verdad = true;
                    }
                });
            });
        }
        return verdad;
    }

    amenasaRey(tablero){
        tablero[this.posicion] = this.casilla;
        tablero[this.posicion].amenazas = this.amenazas;
        let verdad = tablero[this.posicion].recalcularAmenaza(tablero);
        tablero[this.posicion].amenazas.map((mov)=>{
            if(mov.origen instanceof alfil || mov.origen instanceof torre){
                mov.map((obj)=>{
                    obj.aliviar(mov.origen);
                });
            }
        });
        tablero[this.posicion] = this;
        if(verdad instanceof rey){
            if(verdad.color == this.color){
                return true;
            }
        }
        return false;
    }

    seleccionar(){
        this.casilla.seleccionar();
        super.seleccionar();
    }

    imprimir(){
        if(this.__select){
            imp("╬");
            return;
        }
        super.imprimir();
    }

    set casilla(cas){
        if(!(cas instanceof casilla)){
            throw new Error("Intentas llenar una casilla con un parametro no valido");
        }
        this.__casilla = cas;
    }

    get casilla(){
        return this.__casilla;
    }

    movimientos(tablero){
        throw new Error("no has sobreescrito el metodo movimientos");
    }

    capturar(pieza){}

    capturado(pieza){}

    amenazado(pieza){}

    marcar(tablero){
        let mov = this.movimientos(tablero);
        if(typeof(mov) != "object"){
            throw new Error("Fomrato de movimientos incorrectos");
        }
        mov.map((movi)=>{
            movi.map((objeto)=>{
                objeto.seleccionar();
            });
        });
    }

    mover(pos, tablero){
        if(pos >= 0 && pos < 64){
            this.descontrolar(tablero);
            this.amenazas.map((obj)=>{
                obj.objeto = this.casilla;
            });
            this.casilla.amenazas = this.amenazas;
            tablero[this.posicion] = this.casilla;
            tablero[this.posicion].recalcularAmenaza(tablero);
            this.posicion = pos;
            this.amenazas = tablero[this.posicion].amenazas;
            if(!(tablero[this.posicion] instanceof casilla)){
                this.capturar(tablero[this.posicion]);
                this.casilla = tablero[this.posicion].casilla;
                tablero[this.posicion].capturado(this);
            }else{
                this.amenazas.map((n)=>{
                    if(n.siguiente != null && n.siguiente != undefined){
                        n.siguiente.objeto.aliviar(n.origen);
                    }
                });
                this.casilla = tablero[this.posicion];
            }
            tablero[this.posicion] = this;
            this.controlar(tablero);
        }
        return;
    }

    seleccionarEnemigos(){
        this.amenazas.map((mov)=>{
            if(mov.origen.color != this.color){
                mov.origen.seleccionar();
            }
        });
        return;
    }

    seleccionarAliados(){
        this.amenazas.map((mov)=>{
            if(mov.origen.color == this.color){
                mov.origen.seleccionar();
            }
        });
        return;
    }
}

class peon extends pieza{
    constructor(posicion, color, cas){
        super(posicion, color, 80, cas);
    }

    get prototype(){
        return peon;
    }

    mover(pos, tablero){
        super.mover(pos, tablero);
        if(pos < 8 || pos > 55){
            this.coronar();
        }
    }

    amenazar(mov){
        let mul = -1;
        if(this.color){
            mul = 1;
        }
        if(mov.objeto.posicion != this.posicion + mul*8 && mov.objeto.posicion != this.posicion + mul*16){
            return mov.objeto.amenasado(mov);
        }
        return false;
    }

    validar(pos, tablero){
        var verdad = false;
        let mul = 1;
        let movimientos = this.movimientos(tablero);
        if(!this.color){
            mul = -1;
        }
        if(!this.amenasaRey(tablero)){
            movimientos.map((movs)=>{
                movs.map((obj)=>{
                    if(pos == obj.posicion){
                        if(obj instanceof casilla){
                            if(this.posicion + 8*mul == obj.posicion || this.posicion + 16*mul == obj.posicion){
                                verdad = true
                            }
                        }else{
                            if(this.color != obj.color && (this.posicion + 7*mul == obj.posicion || this.posicion + 9*mul == obj.posicion)){
                                verdad = true;
                            }
                        }
                    }
                });
            });
        }
        return verdad;
    }

    marcar(tablero){
        let mul = -1;
        if(this.color){
            mul = 1;
        }
        let mov = this.movimientos(tablero);
        if(typeof(mov) != "object" || typeof(mov[0]) != "object"){
            throw new Error("Fomrato de movimientos incorrectos");
        }
        mov.map((movi)=>{
            movi.map((objeto)=>{
                if(objeto.posicion == this.posicion + mul*8 || objeto.posicion == this.posicion + mul*16){
                    objeto.seleccionar();
                }
            });
        });
    }

    coronar(){}

    movimientos(tablero){
        if(this.posicion > 55 || this.posicion < 8){
            return [];
        }
        let movimientos = [];
        let mul = 1;
        if(!this.color){
            mul = -1;
        }
        let mov = new movs(this);
        if(tablero[this.posicion + 8*mul] instanceof casilla){
            mov.push(tablero[this.posicion + 8*mul]);
            if(tablero[this.posicion + 16*mul] instanceof casilla)
                if((this.posicion < 16 && this.color) || (this.posicion > 47 && !this.color))
                mov.push(tablero[this.posicion + 16*mul]);
        }
        movimientos.push(mov);
        mov = new movs(this);
        if(this.posicion%8 != 0){
            mov.push(tablero[this.posicion + 7*mul]);
        }
        movimientos.push(mov);
        mov = new movs(this);
        if((this.posicion + 1)%8 != 0){
            mov.push(tablero[this.posicion + 9*mul]);
        }
        movimientos.push(mov);
        return movimientos;
    }
}

class torre extends pieza{
    en = true;
    constructor(posicion, color, cas){
        super(posicion, color, 84, cas);
    }

    get prototype(){
        return torre;
    }

    enroque(){}

    mover(pos,tablero){
        this.en = false;
        super.mover(pos, tablero);
    }

    movimientos(tablero){
        let movimientos = [];
        let mov = new movs(this);
        for(let i = this.posicion + 8; i < 64; mov.push(tablero[i]), i += 8){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        mov = new movs(this);
        for(let i = this.posicion - 8; i >= 0; mov.push(tablero[i]), i -= 8){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        mov = new movs(this);
        for(let i = this.posicion + 1; i%8 != 0; mov.push(tablero[i]), i++){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        mov = new movs(this);
        for(let i = this.posicion - 1; (i+1)%8 != 0; mov.push(tablero[i]), i--){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        return movimientos;
    }
}

class alfil extends pieza{
    constructor(posicion, color, tabla){
        super(posicion, color, 65, tabla);
    }

    get prototype(){
        return alfil;
    }

    movimientos(tablero){
        let movimientos = [];
        let mov = new movs(this, null, null);
        for(let i = this.posicion + 9; i%8 != 0 && i < 64; i+=9){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
            mov.push(tablero[i]);
        }
        movimientos.push(mov);
        mov = new movs(this, null, null);
        for(let i = this.posicion + 7; (i+1)%8 != 0 && i < 64; mov.push(tablero[i]), i+=7){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        mov = new movs(this, null, null);
        for(let i = this.posicion - 9; (i+1)%8 != 0  && i >= 0; mov.push(tablero[i]), i-=9){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        mov = new movs(this, null, null);
        for(let i = this.posicion - 7; i%8 != 0 && i >= 0; mov.push(tablero[i]), i-=7){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        return movimientos;
    }
}

class rey extends pieza{
    constructor(posicion, color, cas){
        super(posicion, color, 82, cas);
    }
    
    get prototype(){
        return rey;
    }

    en = true;

    mover(pos,tablero){
        this.en = false;
        super.mover(pos, tablero);
    }

    puntaPie(obj){
        let ver = true;
        obj.amenazas.map((n)=>{
            if(n.origen.color != this.color){
                ver = false;
            }
        });
        return ver;
    }

    amenasado(mov){
        if(mov.origen.color != this.color){
            this.jacke(mov);
        }
        super.amenasado(mov);
    }

    jacke = ()=>{}

    mate = ()=>{}

    enroque(){}

    movimientos(tablero){
        let movimientos = [];
        let mov = new movs(this);
        if(this.posicion%8 != 0){
            if(tablero[this.posicion - 1] != undefined){
                if(this.puntaPie(tablero[this.posicion - 1])){
                    mov.push(tablero[this.posicion - 1]);
                    movimientos.push(mov);
                    mov = new movs(this);
                }
            }
            if(tablero[this.posicion - 9] != undefined){
                if(this.puntaPie(tablero[this.posicion - 9])){
                    mov.push(tablero[this.posicion - 9]);
                    movimientos.push(mov);
                    mov = new movs(this);
                }
            }
            if(tablero[this.posicion + 7] != undefined){
                if(this.puntaPie(tablero[this.posicion + 7])){
                    mov.push(tablero[this.posicion + 7]);
                    movimientos.push(mov);
                    mov = new movs(this);
                }
            }
        }
        if((this.posicion + 1)%8 != 0){
            if(tablero[this.posicion + 1] != undefined){
                if(this.puntaPie(tablero[this.posicion + 1])){
                    mov.push(tablero[this.posicion + 1]);
                }
            }
            movimientos.push(mov);
            mov = new movs(this);
            if(tablero[this.posicion + 9] != undefined){
                if(this.puntaPie(tablero[this.posicion + 9])){
                    mov.push(tablero[this.posicion + 9]);
                }
            }
            movimientos.push(mov);
            mov = new movs(this);
            if(tablero[this.posicion - 7] != undefined){
                if(this.puntaPie(tablero[this.posicion - 7])){
                    mov.push(tablero[this.posicion - 7]);
                }
            }
            movimientos.push(mov);
            mov = new movs(this);
        }
        if(tablero[this.posicion - 8] != undefined){
            if(this.puntaPie(tablero[this.posicion - 8])){
                mov.push(tablero[this.posicion - 8]);
                movimientos.push(mov);
                mov = new movs(this);
            }
        }
        if(tablero[this.posicion + 8] != undefined){
            if(this.puntaPie(tablero[this.posicion + 8])){
                mov.push(tablero[this.posicion + 8]);
                movimientos.push(mov);
            }
        }
        return movimientos;
    }
}

class dama extends pieza{
    constructor(posicion, color, tabla){
        super(posicion, color, 68, tabla);
    }

    get prototype(){
        return alfil;
    }

    movimientos(tablero){
        let movimientos = [];
        let mov = new movs(this);
        for(let i = this.posicion + 9; i%8 != 0 && i < 64; i+=9){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
            mov.push(tablero[i]);
        }
        movimientos.push(mov);
        mov = new movs(this);
        for(let i = this.posicion + 7; (i+1)%8 != 0 && i < 64; mov.push(tablero[i]), i+=7){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        mov = new movs(this);
        for(let i = this.posicion - 9; (i+1)%8 != 0  && i >= 0; mov.push(tablero[i]), i-=9){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        mov = new movs(this);
        for(let i = this.posicion - 7; i%8 != 0 && i >= 0; mov.push(tablero[i]), i-=7){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        //aca...................
        mov = new movs(this);
        for(let i = this.posicion + 8; i < 64; mov.push(tablero[i]), i += 8){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        mov = new movs(this);
        for(let i = this.posicion - 8; i >= 0; mov.push(tablero[i]), i -= 8){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        mov = new movs(this);
        for(let i = this.posicion + 1; i%8 != 0; mov.push(tablero[i]), i++){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        mov = new movs(this);
        for(let i = this.posicion - 1; (i+1)%8 != 0; mov.push(tablero[i]), i--){
            if(!(tablero[i] instanceof casilla)){
                mov.push(tablero[i]);
                break;
            }
        }
        movimientos.push(mov);
        return movimientos;
    }
}

class caballo extends pieza{
    constructor(posicion, color, tabla){
        super(posicion, color, 67, tabla);
    }

    get prototype(){
        return alfil;
    }

    movimientos(tablero){
        let movimientos = [];
        let mov = new movs(this);
        if(this.posicion%8 != 0){
            if(tablero[this.posicion - 17] != undefined){
                mov.push(tablero[this.posicion - 17]);
                movimientos.push(mov);
                mov = new movs(this);
            }
            if(tablero[this.posicion + 15] != undefined){
                mov.push(tablero[this.posicion + 15]);
                movimientos.push(mov);
                mov = new movs(this);
            }
            if((this.posicion - 1)%8 != 0){
                if(tablero[this.posicion - 10] != undefined){
                    mov.push(tablero[this.posicion - 10]);
                    movimientos.push(mov);
                    mov = new movs(this);
                }
                if(tablero[this.posicion + 6] != undefined){
                    mov.push(tablero[this.posicion + 6]);
                    movimientos.push(mov);
                    mov = new movs(this);
                }
            }
        }
        if((this.posicion + 1)%8 != 0){
            if(tablero[this.posicion + 17] != undefined){
                mov.push(tablero[this.posicion + 17]);
                movimientos.push(mov);
                mov = new movs(this);
            }
            if(tablero[this.posicion - 15] != undefined){
                mov.push(tablero[this.posicion - 15]);
                movimientos.push(mov);
                mov = new movs(this);
            }
            if((this.posicion + 2)%8 != 0){
                if(tablero[this.posicion + 10] != undefined){
                    mov.push(tablero[this.posicion + 10]);
                    movimientos.push(mov);
                    mov = new movs(this);
                }
                if(tablero[this.posicion - 6] != undefined){
                    mov.push(tablero[this.posicion - 6]);
                    movimientos.push(mov);
                    mov = new movs(this);
                }
            }
        }
        return movimientos;
    }
}

export{pieza, rey, alfil, peon, torre, dama, caballo};