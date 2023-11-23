import { alfil, caballo, peon, torre, rey, dama, pieza } from "./piezas.mjs";
import { casilla } from "./casillas.mjs";
import { objeto, movs } from "./globales.mjs";
import * as ard from "readline"
import * as rd from "readline-sync";
import { runInThisContext } from "vm";

function input(str, tipo){
    const readline = rd;
    switch(tipo){
        case "float":
            return parseInt(readline.question(str));
        case "number":
            return parseFloat(readline.question(str));
        case "char":
            return readline.question(str)[0 ];
        default:
            return readline.question(str);
    }
}

function asyncinput(str, tipo){
    switch(tipo){
        case "float":
            return parseInt(readline.question(str));
        case "number":
            return parseFloat(readline.question(str));
        case "char":
            return readline.question(str)[0 ];
        default:
            return readline.question(str);
    }
}

/*Sirve para imprimir sin salto de linea*/
function imp(str){
    process.stdout.write(str)
}

class marco{
    static activar(tablero){
        for(let i = 0; i < 64; i++){
            if(tablero[i] instanceof pieza)
            tablero[i].controlar(tablero);
        }
    }

    static tableroVacio(){
        let tablero = []
        for(let i = 0; i < 64; i++){
            tablero.push(new casilla(i));
        }
        return tablero;
    }

    static tableroClasico(){
        let tablero = marco.tableroVacio();
        for(let i = 0; i < 64; i++){
            if(i > 7 && i < 16){
                new peon(i, true, tablero);
            }else if(i > 47 && i < 56){
                new peon(i, false, tablero);
            }else if(i == 0 || i == 7){
                new torre(i, true, tablero);
            }else if(i == 56 || i == 63){
                new torre(i, false, tablero);
            }else if(i == 1 || i == 6){
                new caballo(i, true, tablero);
            }else if(i == 57 || i == 62){
                new caballo(i, false, tablero);
            }else if(i == 2 || i == 5){
                new alfil(i, true, tablero);
            }else if(i == 58 || i == 61){
                new alfil(i, false, tablero);
            }else if(i == 3){
                new rey(i, true, tablero);
            }else if(i == 59){
                new rey(i, false, tablero);
            }else if(i == 4){
                new dama(i, true, tablero);
            }else if(i == 60){
                new dama(i, false, tablero);
            }
        }
        marco.activar(tablero);
        return tablero;
    }

    static tableroResgistro(tablero){
        let t = marco.tableroVacio();
        tablero.map((str, n)=>{
            switch(str[0]){
                case "P":
                    new peon(n, objeto.formatoColor(parseInt(str[1])), t);
                    break;
                case "A":
                    new alfil(n, objeto.formatoColor(parseInt(str[1])), t);
                    break;
                case "R":
                    new rey(n, objeto.formatoColor(parseInt(str[1])), t);
                    break;
                case "D":
                    new dama(n, objeto.formatoColor(parseInt(str[1])), t);
                    break;
                case "T":
                    new torre(n, objeto.formatoColor(parseInt(str[1])), t);
                    break;
                case "C":
                    new caballo(n, objeto.formatoColor(parseInt(str[1])), t);
                    break;
            }
        });
        return t;
    }
}

class modoJuego{

    turno = 0;
    reyes = [];
    registro = [];
    fin = false;
    jacke = false;

    static formatoCoordenadas(dato){
        if(typeof(dato) == "object" || typeof(dato) == "boolean"){
            throw new Error("Fomato de dato incorrecto, dato tipo " + typeof(dato));
        }else if(typeof(dato) == "string"){
            dato = dato.toUpperCase();
            if(dato.length == 2){
                dato = (72 - dato.codePointAt(0)) + (parseInt(dato[1]) - 1)*8;
            }else{
                dato = (dato.codePointAt(0) - 65);
            }
        }
        if(dato < 64 && dato >= 0){
            return dato;
        }else{
            return;
        }
    }

    static registro(tablero){
        let t = [];
        tablero.map((obj)=>{
            if(obj instanceof pieza){
                let p = (obj.color)?"0":"1";
                t.push(String.fromCodePoint(obj.simbolo) + p);
            }else{
                t.push("0");
            }
        });
        return t;
    }

    constructor(tablero){
        if(new.target === modoJuego){
            throw new Error('No puedes instanciar una clase abstracta');
        }
        this.tablero = tablero;
    }

    manejoError(e){
        console.error("ho no developer, ha ocurrido un error inesperado, porfavor actualiza la version o ponte en contacto con el desarrollador principal");
        if(input("¿Quieres imprimir el error?(y/n)", "").toLowerCase() == "y"){
            console.error(e);
        }
        return;
    }

    set tablero(tablero){
        for(let i = 0; i < 64 && this.reyes.length != 2; i++){
            if(tablero[i] instanceof objeto){
                if(tablero[i] instanceof rey){
                    this.reyes.push(tablero[i]);
                }
            }else{
                throw new Error("El parametro no tiene el formato indicado");
            }
        }
        this.__tablero = tablero;
    }

    get tablero(){
        return this.__tablero;
    }

    init(){
        while(!this.fin){
            this.juego();
        }
    }

    mate(mov){
        let verdad = false;
        while(mov != null){
            if(!(mov.objeto instanceof rey)){
                let p = (mov.objeto.posicion < 10)?"0" + mov.objeto.posicion:mov.objeto.posicion;
                this.buscarPieza("?" + p).map((obj)=>{
                    if(obj.color == objeto.formatoColor(this.turno)){
                        obj.seleccionar();
                        verdad = true;
                    }
                });
            }
            mov = mov.anterior;
        }
        return verdad;
    }

    comandos(comando){
        let cmd = comando.split(" ");
        try{
            switch(cmd[0]){
                case "mm":
                    let p1 = this.buscarPieza(cmd[1]);
                    if(p1.length == 0){
                        console.error("pieza no encontrada");
                        return false;
                    }
                    p1.map((n)=>{
                        if(n instanceof pieza)
                            n.marcar(this.tablero);
                    });
                    return false;
                case "eq":
                    let piezas = this.buscarPieza(cmd[1]);
                    if(piezas.length == 0){
                        console.error("pieza no encontrada");
                        return false;
                    }
                    let a1 = 1;
                    if(this.turno%2 == 0){
                        a1 = 0;
                    }
                    if(this.reyes[a1].en){
                        for(let i = piezas.length - 1; i >= 0; i--){
                            if(piezas[i] instanceof torre){
                                if(piezas[i].en){
                                    let h = piezas[i].posicion;
                                    let verdad = true;
                                    for(let j = this.reyes[a1].posicion; j != h;(j < h)?j++:j--){
                                        if(!(this.tablero[j] instanceof casilla || this.tablero[j] instanceof rey)){
                                            verdad = false;
                                            break;
                                        }
                                    }
                                    if(verdad){
                                        if(this.reyes[a1].posicion > piezas[i].posicion){
                                            this.reyes[a1].mover(1, this.tablero);
                                            piezas[i].mover(this.reyes[a1].posicion + 1, this.tablero);
                                        }else{
                                            this.reyes[a1].mover(this.reyes[a1].posicion + 2, this.tablero);
                                            piezas[i].mover(this.reyes[a1].posicion - 1, this.tablero);
                                        }
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                    console.error("no hay posible enroque");
                    return false;
                case "me":
                    let p = this.buscarPieza(cmd[1]);
                    if(p.length == 0){
                        console.error("Pieza no encontrada");
                        return false;
                    }
                    p.map((obj)=>{
                        obj.seleccionarEnemigos();
                    });
                    return false;
                case "ma":
                    let pi = this.buscarPieza(cmd[1]);
                    if(pi.length == 0){
                        console.error("pieza no encontrada");
                        return false;
                    }
                    pi.map((obj)=>{
                        obj.seleccionarAliados();
                    });
                    return false;
                case "end":
                    this.fin = true;
                    this.finDelJuego();
                    break;
                default:
                    console.error("comando no valido");
                    return false;
            }
            return true;
        }catch{
            console.error("lo lamento un error interno del sistema");
            return false;
        }
    }

    buscarPieza(pie){
        let piezas = [];
        let regex = /^[0-9]*$/;
        if(regex.test(pie)){
            piezas.push(this.tablero[parseInt(pie)]);
        }else if(pie.length == 2){
            piezas.push(this.tablero[modoJuego.formatoCoordenadas(pie)]);
        }else if(pie.length == 3){
            let pi = null;
            let n = pie[1] + pie[2];
            if(pie[0] == "?"){
                let pos = 0;
                if(regex.test(n)){
                    pos = parseInt(n);
                }else{
                    pos = modoJuego.formatoCoordenadas(n);
                }
                for(let i = 0; i < 64; i++){
                    if(this.tablero[i] instanceof pieza){
                        if(this.tablero[i].validar(pos, this.tablero)){
                            piezas.push(this.tablero[i]);
                        }
                    }
                }
            }else{
                if(regex.test(n)){
                    pi = this.tablero[parseInt(n)];
                }else{
                    pi = this.tablero[modoJuego.formatoCoordenadas(n)]
                }
                if(pi.simbolo == pie.toUpperCase().codePointAt(0)){
                    piezas.push(pi);
                }
            }
        }else{
            pie = pie.toUpperCase().codePointAt(0);
            for(let i = 0; i < 64; i++){
                if(this.tablero[i].simbolo == pie){
                    piezas.push(this.tablero[i]);
                }
            }
        }
        return piezas;
    }

    imprimirNegro(){
        imp("\n    ");
        for(let i = 0; i < 8; i++){
            imp(" ");
            imp(String.fromCodePoint(72 - i));  
            imp(" ");
        }
        imp("\n  ┌─");
        for(let i = 0; i < 8; i++){
            imp("───");
        }
        imp("─┐\n");
        this.tablero.map((n, pos)=>{
            if((pos + 8)%8 == 0){
                imp(((pos + 8)/8).toString());
                imp(" │ ");
            }
            if(n instanceof casilla){
                n.imprimir();
                n.imprimir();
                n.imprimir();
            }else if(n instanceof pieza){
                n.casilla.imprimir();
                n.imprimir();
                n.casilla.imprimir();
                n.casilla.deseleccionar();
            }
            n.deseleccionar();
            if((pos + 1)%8 == 0){
                imp(" │ ");
                console.log((pos + 1)/8);
            }
        });
        imp("  └─");
        for(let i = 0; i < 8; i++){
            imp("───");
        }
        imp("─┘\n    ");
        for(let i = 0; i < 8; i++){
            imp(" ");
            imp(String.fromCodePoint(72 - i));  
            imp(" ");
        }
        console.log("");
    }

    imprimirBlanco(){
        imp("\n    ");
        for(let i = 0; i < 8; i++){
            imp(" ");
            imp(String.fromCodePoint(65 + i));  
            imp(" ");
        }
        imp("\n  ┌─");
        for(let i = 0; i < 8; i++){
            imp("───");
        }
        imp("─┐\n");
        this.tablero.reverse().map((n, pos)=>{
            if((pos + 8)%8 == 0){
                imp((9 - (pos + 8)/8).toString());
                imp(" │ ");
            }
            if(n instanceof casilla){
                n.imprimir();
                n.imprimir();
                n.imprimir();
            }else if(n instanceof pieza){
                n.casilla.imprimir();
                n.imprimir();
                n.casilla.imprimir();
                n.casilla.deseleccionar();
            }
            n.deseleccionar();
            if((pos + 1)%8 == 0){
                imp(" │ ");
                console.log(9 - (pos + 1)/8);
            }
        });
        this.tablero.reverse();
        imp("  └─");
        for(let i = 0; i < 8; i++){
            imp("───");
        }
        imp("─┘\n    ");
        for(let i = 0; i < 8; i++){
            imp(" ");
            imp(String.fromCodePoint(65 + i));  
            imp(" ");
        }
        console.log("");
    }

    imprimir(){
        if(this.turno%2 == 0){
            this.imprimirBlanco();
        }else{
            this.imprimirNegro();
        }
    }

    juego(){
        throw new Error("No has sobreescrito el metodo juego");
    }

    registar(){
        this.registro.push(modoJuego.registro(this.tablero));
    }

    finDelJuego(...datos){
    }

}

class modoLibre extends modoJuego{
    constructor(tablero){
        super(tablero);
    }

    comandos(comando){
        let cmd = comando.split(" ");
        try{
            switch(cmd[0]){
                case "mv":
                    switch(cmd.length){
                        case 2:
                            let coor = cmd[1];
                            let m = coor[1] + coor[2];
                            if(coor.length == 2){
                                coor = "?" + coor;
                            }else if(coor[0] != "?"){
                                m = coor[1] + coor[2];
                                coor = coor[0];
                            }else if (coor.length == 1){
                                console.error("formato de coordenadas incorrecto");
                                return false;
                            }
                            let pieza = this.buscarPieza(coor);
                            if(pieza.length > 0){
                                if(coor[0] != "?"){
                                    let i = pieza.length - 1;
                                    while(i >= 0){
                                        if(pieza[i].validar(modoJuego.formatoCoordenadas(m), this.tablero)){
                                            pieza[i].mover(modoJuego.formatoCoordenadas(m), this.tablero);
                                            break;
                                        }
                                        i--;
                                    }
                                }else{
                                    pieza[0].mover(modoJuego.formatoCoordenadas(m), this.tablero);
                                }
                            }else{
                                console.error("Pieza no encontrada");
                                return false;
                            }
                            break;
                        case 3:
                            let origen = cmd[1];
                            let destino = cmd[2];
                            let piezas = this.buscarPieza(origen);
                            if(piezas.length == 0){
                                console.error("Pieza no encontrada");
                                return false;
                            }
                            switch(destino.length){
                                case 1:
                                    let pieza = this.buscarPieza(origen);
                                    if(pieza.length == 0){
                                        console.error("Pieza no encontrada");
                                        return false;
                                    }
                                    for(let i = pieza.length-1; i >= 0; i--){
                                        if(piezas[0].validar(pieza[0].posicion, this.tablero)){
                                            piezas[0].mover(pieza[0].posicion, this.tablero);
                                            break;
                                        }
                                    }
                                    break;
                                case 2:
                                    piezas[0].mover(modoJuego.formatoCoordenadas(destino), this.tablero);
                                    break;
                                case 3:
                                    let p = this.buscarPieza(origen);
                                    if(p.length == 0){
                                        console.error("Pieza no encontrada");
                                    }
                                    for(let i = piezas.length; i >= 0; i--){
                                        if(piezas[i].validar(p[0].posicion, this.tablero)){
                                            piezas[i].mover(p[0].posicion, this.tablero);
                                        }
                                    }
                                    break;
                            }
                            break;
                        default:
                            console.error("mv requiere unicamente un paraametro, maximo dos");
                    }
                    break;
                
                    break;
                default:
                    return super.comandos(comando);
            }
            return true;
        }catch(e){
            console.error("perdon error interno", e);
        }
    }

    juego(){
        console.clear();
        this.imprimir()
        if(this.comandos(input("", "string"))){
            this.turno += 1;
        }else{
            this.imprimir()
            input("Preciona cualquier enter para seguir...");
        }
    }
}


class modoFIDE extends modoJuego{
    constructor(tablero){
        super(tablero);
        this.reyes.map((rey)=>{
            rey.jacke = (mov)=>{
                this.jacke = true;
                let ver = true;
                rey.movimientos(this.tablero).map((mov)=>{
                    if(mov.objeto instanceof casilla)
                        ver = false;
                });
                this.turno += 1;
                if(ver && !this.mate(mov)){
                    rey.mate();
                }
                this.turno -= 1;
            }
            rey.mate = ()=>{
                rey.seleccionar();
                this.imprimir();
                console.log("jacke mate");
                this.fin = true;
                this.finDelJuego();
            }
        });
        for(let i = 0; i < 64; i++){
            if(tablero[i] instanceof peon){
                tablero[i].coronar = ()=>{
                    let p = null;
                    switch(i%8){
                        case 0:
                            p = tablero[56];
                            break;
                        case 1:
                            p = tablero[57];
                            break;
                        case 2:
                            p = tablero[58];
                            break;
                        case 3:
                            p = tablero[59];
                            break;
                        case 4:
                            p = tablero[60];
                            break;
                        case 5:
                            p = tablero[61];
                            break;
                        case 6:
                            p = tablero[62];
                            break;
                        case 7:
                            p = tablero[63];
                            break;
                    }
                    this.tablero[p.posicion] = p.casilla;
                    let pi = "r";
                    while(pi == "r" || pi == "p"){
                        pi = input("seleccione el tipo de pieza que desea coronar al peon: ", "").toLowerCase();
                        switch(pi){
                            case "a":
                                new alfil(p.posicion, p.color, this.tablero);
                                break;
                            case "t":
                                new torre(p.posicion, p.color, this.tablero);
                                break;
                            case "c":
                                new caballo(p.posicion, p.color, this.tablero);
                                break;
                            case "d":
                                new dama(p.posicion, p.color, this.tablero);
                                break;
                            case "p":
                                console.error("¿para que quieres convertir un peon en un peon?");
                                break;
                            case "r":
                                console.error("¿para que quieres otro rey?");
                                break;
                            default:
                                console.error("la pieza no se reconoce");
                                pi = "r";
                        }
                    }
                    tablero[p.posicion].controlar(this.tablero);
                }
            }
        }
    }

    comandos(comando){
        let cmd = comando.split(" ");
        try{
            switch(cmd[0]){
                case "mv":
                    switch(cmd.length){
                        case 2:
                            let coor = cmd[1];
                            let m = coor[1] + coor[2];
                            if(this.jacke){
                                let v = true;
                                this.reyes.map((rey)=>{
                                    if(rey.color == objeto.formatoColor(this.turno)){
                                        let mov = rey.amenazas[rey.amenazas.length - 1];
                                        if(mov.origen == this.tablero[modoJuego.formatoCoordenadas(m)]){
                                            v = false;
                                        }
                                        while(mov != null && v){
                                            if(modoJuego.formatoCoordenadas(m) == mov.objeto.posicion){
                                                v = false;
                                                break;
                                            }
                                            mov = mov.anterior;
                                        }
                                    }
                                });
                                if(v){
                                    console.error("No puedes mover esa pieza hasta eliminar la amenza del rey");
                                    return false;
                                }
                            }
                            if(coor.length == 2){
                                coor = "?" + coor;
                            }else if(coor[0] != "?"){
                                m = coor[1] + coor[2];
                                coor = coor[0];
                            }else if (coor.length == 1){
                                console.error("formato de coordenadas incorrecto");
                                return false;
                            }
                            let pieza = this.buscarPieza(coor);
                            if(pieza.length > 0){
                                if(coor[0] != "?"){
                                    let i = pieza.length - 1;
                                    while(i >= 0){
                                        if(pieza[i].color == objeto.formatoColor(this.turno)){
                                            if(pieza[i].validar(modoJuego.formatoCoordenadas(m), this.tablero)){
                                                pieza[i].mover(modoJuego.formatoCoordenadas(m), this.tablero);
                                                return true;
                                            }
                                        }
                                        i--;
                                    }
                                }else{
                                    if(pieza[0].color == objeto.formatoColor(this.turno)){
                                        pieza[0].mover(modoJuego.formatoCoordenadas(m), this.tablero);
                                        return true;
                                    }
                                }

                            }
                            console.error("Pieza no encontrada");
                            return false;
                        case 3:
                            let origen = cmd[1];
                            let destino = cmd[2];
                            if(this.jacke){
                                let v = true;
                                let m = destino;
                                switch(destino.length){
                                    case 1:
                                        console.error("porfavor, se mas especifico");
                                        return false;
                                    case 3:
                                        m = destino[1] + destino[2];
                                        break;
                                }
                                this.reyes.map((rey)=>{
                                    if(rey.color == objeto.formatoColor(this.turno)){
                                        let mov = rey.amenazas[rey.amenazas.length - 1];
                                        if(mov.origen == this.tablero[modoJuego.formatoCoordenadas(m)]){
                                            v = false;
                                        }
                                        while(mov != null && v){
                                            if(modoJuego.formatoCoordenadas(m) == mov.objeto.posicion){
                                                v = false;
                                                break;
                                            }
                                            mov = mov.anterior;
                                        }
                                    }
                                });
                                if(v){
                                    console.error("No puedes mover esa pieza hasta eliminar la amenza del rey");
                                    return false;
                                }
                            }
                            let piezas = this.buscarPieza(origen);
                            if(piezas.length == 0){
                                console.error("Pieza no encontrada");
                                return false;
                            }
                            switch(destino.length){
                                case 1:
                                    let pieza = this.buscarPieza(destino);
                                    if(pieza.length == 0){
                                        console.error("Pieza no encontrada");
                                        return false;
                                    }
                                    for(let i = pieza.length-1; i >= 0; i--){
                                        if(piezas[i].color == objeto.formatoColor(this.turno)){
                                            if(piezas[i].validar(pieza[i].posicion, this.tablero) ){
                                                piezas[i].mover(pieza[i].posicion, this.tablero);
                                                return true;
                                            }
                                        }
                                    }
                                    console.error("Pieza no encontrada");
                                    return false;
                                case 2:
                                    for(let i = piezas.length - 1; i >= 0; i--){
                                        if(piezas[i].color == objeto.formatoColor(this.turno)){
                                            if(piezas[i].validar(modoJuego.formatoCoordenadas(destino), this.tablero)){
                                                piezas[i].mover(modoJuego.formatoCoordenadas(destino), this.tablero);
                                                return true;
                                            }
                                        }
                                    }
                                    console.error("la pieza indicado no puede moverse a ese lugar");
                                    return false;
                                case 3:
                                    let p = this.buscarPieza(origen);
                                    if(p.length == 0){
                                        console.error("Pieza no encontrada");
                                    }
                                    for(let i = piezas.length - 1; i >= 0; i--){
                                        if(piezas[i].color == objeto.formatoColor(this.color)){
                                            if(piezas[i].validar(p[0].posicion, this.tablero)){
                                                piezas[i].mover(p[0].posicion, this.tablero);
                                                return true;
                                            }
                                        }
                                    }
                                    console.error("la pieza no puede ocupar esa posicion");
                                    return false;
                            }
                            break;
                        default:
                            console.error("mv requiere unicamente un paraametro, maximo dos");
                            return false;
                    }
                    break;
                case "end?":
                    if(input("¿Quieres proclamar tablas?(y/n)").toLowerCase() == "y"){
                        this.fin = true;
                        this.finDelJuego();
                    }
                    return false;
                    break;
                default:
                    return super.comandos(comando);
            }
            return true;
        }catch(e){
            console.error("perdon error interno");
            console.error(e);
        }
    }

    juego(){
        console.clear();
        this.imprimir()
        if(this.comandos(input("", "string"))){
            this.turno += 1;
        }else{
            this.imprimir()
            input("Preciona cualquier enter para seguir...");
        }
    }
}

class online extends modoJuego{

    __tipo = "";
    conectado = false;
    url = "";
    nombre = "";
    id = -1;
    roll = -1;
    _promesa = null;

    constructor(tablero, url){
        if(new.target === online){
            throw new Error("no puesdes instanciar una clase abstracta");
        }
        super(tablero);
        this.url = url;
        /*let n = 0;
        let id = setInterval(()=>{
            if(this.conectado){
                this.init();
                clearInterval(id);
            }else if(n < 10){
                n += 1;
            }else{
                this.manejoError("no se pudo conectar al servidor");
                clearInterval(id);
            }
        }, 1000)
        this.conection(id);*/
    }

    comando(comando){
        return this.comandos(comando).then(async (op)=>{
            if(op != undefined){
                console.clear();
                this.imprimir();
                if(op[0]){
                    this.turno += 1;
                }
                if(op[1]){
                    await this.comandoOnline(this.id, op[2]).then((cmd)=>{
                        if(cmd != undefined)
                            this.comandos(cmd).then((o)=>{
                                if(o != undefined){
                                    console.clear();
                                    this.imprimir();
                                    this.turno += 1;
                                    if(o[1] && o[2][0] == "-"){
                                        this.comandoOnline(this.id, op[2]);
                                    }
                                }
                            });
                    });
                }
            }
        });
    }

    async init(){
        await this.juego();
    }

    imprimir(){
        if(this.roll == 0){
            this.imprimirBlanco();
        }else{
            this.imprimirNegro();
        }
        return;
    }

    permitir(){
        return (this.roll == 0 && this.turno%2 == 0) || (this.roll == 1 && this.turno%2 == 1);
    }

    conection(){
        return fetch(this.url + "juego").then((res)=>{
            this.conectado = res.ok;
        }).catch((e)=>{
            this.conectado = false;
            this.manejoError(e);
        });
    }

    crearPartida(id, roll){
        if(!this.conectado){
            throw new Error("Coneccion no establecida");
        }
        return fetch(this.url + "juego",{
            method: "POST",
            body: JSON.stringify({
                id:id,
                nombre: this.nombre,
                tipo: this.__tipo, 
                roll:roll
            }),
            headers:{
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then(res => {
            let j = res.json();
            this.id = j.id;
            this.roll = j.roll;
            return j;
        });
    }

    eliminarPartida(id, instruccion){
        if(!this.conectado){
            throw new Error("Coneccion no establecida");
        }
        return fetch(this.url + "juego",{
            method: "DELETE",
            body: JSON.stringify({
                id:id,
                instrucion:instruccion
            }),
            headers:{
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then(() =>{
            this.id = -1;
            this.roll = -1;
        });
    }

    comandoOnline(id, comando, n = 0){
        if(!this.conectado){
            throw new Error("Coneccion no establecida");
        }
        return fetch(this.url + "juego",{
            method: "PATCH",
            body: JSON.stringify({
                id:id,
                comando:comando
            }),
            headers:{
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then(res => {
            if(res != undefined)
                if(res.ok)
                    res = res.json();
            return res;
        })
        .then(r=>r.comando)
        .catch(async (e)=>{
            if(n<10){
                console.error("fallo", n);
                await this.comandoOnline(this.id, comando, n = n + 1).then((cmd)=>{
                    if(cmd != undefined)
                        this.comandos(cmd).then((op)=>{
                            if(op != undefined)
                                if(op[1] && op[2][0] == "-"){
                                    this.comandoOnline(this.id, op[2]);
                                }
                        });
                });
            }else{
                this.manejoError(e);
            }
        })
    }

    conectarsePartida(id){
        if(!this.conectado){
            throw new Error("Coneccion no establecida");
        }
        return fetch(this.url + "juego",{
            method: "PUT",
            body: JSON.stringify({
                id:id,
                nombre: this.nombre,
                tipo: this.__tipo
            }),
            headers:{
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then(res => {
            if(res != undefined){
                if(res.status == 200)
                    res = res.json();
            }
            return res;
        }).then(json =>{
            if(json != undefined){
                this.roll = json.roll;
                this.id = json.id;
            }
            return json;
        }).catch((e)=>{
            this.manejoError(e);
        });
    }
}

class onlineLibre extends online{
    constructor(tablero, url, nombre){
        super(tablero, url);
        this.nombre = nombre;
        this.__tipo = "Libre";
    }

    comandos(comando){//turno comunicacion comando
        return new Promise((solve, reject)=>{
            let cmd = comando.split(" ");
            if(!this.permitir())
                if(cmd[0] in ["mv", "tp", "ms", "end", "end?"])
                    reject();
            try{
                switch(cmd[0]){
                    case "mv":
                        switch(cmd.length){
                            case 2:
                                let coor = cmd[1];
                                let m = coor[1] + coor[2];
                                if(coor.length == 2){
                                    coor = "?" + coor;
                                }else if(coor[0] != "?"){
                                    m = coor[1] + coor[2];
                                    coor = coor[0];
                                }else if (coor.length == 1){
                                    console.error("formato de coordenadas incorrecto");
                                    reject();
                                }
                                let pieza = this.buscarPieza(coor);
                                if(pieza.length > 0){
                                    if(coor[0] != "?"){
                                        let i = pieza.length - 1;
                                        while(i >= 0){
                                            if(pieza[i].validar(modoJuego.formatoCoordenadas(m), this.tablero)){
                                                pieza[i].mover(modoJuego.formatoCoordenadas(m), this.tablero);
                                                break;
                                            }
                                            i--;
                                        }
                                    }else{
                                        pieza[0].mover(modoJuego.formatoCoordenadas(m), this.tablero);
                                    }
                                }else{
                                    console.error("Pieza no encontrada");
                                    reject();
                                }
                                break;
                            case 3:
                                let origen = cmd[1];
                                let destino = cmd[2];
                                let piezas = this.buscarPieza(origen);
                                if(piezas.length == 0){
                                    console.error("Pieza no encontrada");
                                    reject();
                                }
                                switch(destino.length){
                                    case 1:
                                        let pi = this.buscarPieza(origen);
                                        if(pi.length == 0){
                                            console.error("Pieza no encontrada");
                                            reject();
                                        }
                                        for(let i = pi.length-1, j = 0; i >= 0; i--){
                                            if(piezas[0].validar(pi[0].posicion, this.tablero)){
                                                piezas[0].mover(pi[0].posicion, this.tablero);
                                                break;
                                            }
                                        }
                                        break;
                                    case 2:
                                        for(let i = piezas.length - 1; i >= 0; i--){
                                            if(!(piezas[i] instanceof casilla)){
                                                piezas[i].mover(modoJuego.formatoCoordenadas(destino), this.tablero);
                                                break;
                                            } 
                                        }
                                        break;
                                    case 3:
                                        let p = this.buscarPieza(origen);
                                        if(p.length == 0){
                                            console.error("Pieza no encontrada");
                                            reject();
                                        }
                                        for(let i = piezas.length - 1; i >= 0; i--){
                                            if(!(piezas[i] instanceof casilla))
                                                if(piezas[i].validar(p[0].posicion, this.tablero)){
                                                    piezas[i].mover(p[0].posicion, this.tablero);
                                                    break;
                                                }
                                        }
                                        break;
                                }
                                break;
                            default:
                                console.error("mv requiere unicamente un paraametro, maximo dos");
                                reject();
                        }
                        solve([true, true, comando]);
                        break;
                    case "end":
                        this.fin = true;
                        this.finDelJuego();
                        solve([false, true, "-end"]);
                        break;
                    case "-end":
                        this.fin = true;
                        this.finDelJuego();
                        solve([false, true, "-true final"]);
                        break;
                    /*case "end?":
                        console.log("esperando la respuesta del rival");
                        this.comandoOnline(this.id, "-end?").then((cmd)=>{
                            if(cmd == "-true"){
                                this.fin = true;
                                this.finDelJuego();
                                solve([false, false, "-true"]);
                            }else{
                                reject();
                            }
                        });
                        break;
                    case "-end?":
                        if(input("¿desea declarara tablas?(y/n)", "").toLowerCase() == "y"){
                            this.comandoOnline(this.id, "-true final");
                            this.fin = true;
                            this.finDelJuego();
                        }else{
                            this.comandoOnline(this.id, "-false");
                            this.comandoOnline(this.id, "").then((cmd)=>{
                                this.comandos(cmd);
                            })
                        }
                        solve([false, false, ""]);
                        break;*/
                    default:
                        super.comandos(comando);
                        solve([false, false, comando]);
                }
            }catch(e){
                this.manejoError(e);
                reject();
            }
        }).catch((e)=>{
            this.juego();
        });
    }

    async juego(){
        this.imprimir();
        if(this.turno == 0 && this.roll == 1){
            await this.comandoOnline(this.id, "").then((c)=>{
                this.comandos(c).then((op)=>{
                    if(op != undefined)
                        if(op[1] && op[2][0] == "-"){
                            this.comandoOnline(this.id, op[2]);
                        }
                });
                this.imprimir();
            });
        }
        if(!this.fin){            
            await this.comando(input("tu turno:", "").replace("-", ""));
            this.juego();
        }
    }
}

class onlineFIDE extends online{
    constructor(tablero, url, nombre){
        super(tablero, url);
        this.nombre = nombre;
        this.__tipo = "FIDE";
        this.reyes.map((rey)=>{
            rey.jacke = (mov)=>{
                this.jacke = true;
                let ver = true;
                rey.movimientos(this.tablero).map((mov)=>{
                    if(mov.objeto instanceof casilla)
                        ver = false;
                });
                this.turno += 1;
                if(ver && !this.mate(mov)){
                    rey.mate();
                }
                this.turno -= 1;
            }
            rey.mate = ()=>{
                rey.seleccionar();
                this.imprimir();
                console.log("jacke mate");
                this.comandoOnline(this.id, "end");
                this.fin = true;
                this.finDelJuego();
            }
        });
        for(let i = 0; i < 64; i++){
            if(tablero[i] instanceof peon){
                tablero[i].coronar = ()=>{
                    let p = null;
                    switch(i%8){
                        case 0:
                            p = tablero[56];
                            break;
                        case 1:
                            p = tablero[57];
                            break;
                        case 2:
                            p = tablero[58];
                            break;
                        case 3:
                            p = tablero[59];
                            break;
                        case 4:
                            p = tablero[60];
                            break;
                        case 5:
                            p = tablero[61];
                            break;
                        case 6:
                            p = tablero[62];
                            break;
                        case 7:
                            p = tablero[63];
                            break;
                    }
                    this.tablero[p.posicion] = p.casilla;
                    let pi = "r";
                    while(pi == "r" || pi == "p"){
                        pi = input("seleccione el tipo de pieza que desea coronar al peon: ", "").toLowerCase();
                        switch(pi){
                            case "a":
                                new alfil(p.posicion, p.color, this.tablero);
                                break;
                            case "t":
                                new torre(p.posicion, p.color, this.tablero);
                                break;
                            case "c":
                                new caballo(p.posicion, p.color, this.tablero);
                                break;
                            case "d":
                                new dama(p.posicion, p.color, this.tablero);
                                break;
                            case "p":
                                console.error("¿para que quieres convertir un peon en un peon?");
                                break;
                            case "r":
                                console.error("¿para que quieres otro rey?");
                                break;
                            default:
                                console.error("la pieza no se reconoce");
                                pi = "r";
                        }
                    }
                    tablero[p.posicion].controlar(this.tablero);
                }
            }
        }
    }

    comandos(comando){
        return new Promise((solve, reject)=>{
            let cmd = comando.split(" ");
            try{
                switch(cmd[0]){
                    case "mv":
                        switch(cmd.length){
                            case 2:
                                let coor = cmd[1];
                                let m = coor[1] + coor[2];
                                if(this.jacke){
                                    let v = true;
                                    this.reyes.map((rey)=>{
                                        if(rey.color == objeto.formatoColor(this.turno)){
                                            let mov = rey.amenazas[rey.amenazas.length - 1];
                                            if(mov.origen == this.tablero[modoJuego.formatoCoordenadas(m)]){
                                                v = false;
                                            }
                                            while(mov != null && v){
                                                if(modoJuego.formatoCoordenadas(m) == mov.objeto.posicion){
                                                    v = false;
                                                    break;
                                                }
                                                mov = mov.anterior;
                                            }
                                        }
                                    });
                                    if(v){
                                        console.error("No puedes mover esa pieza hasta eliminar la amenza del rey");
                                        reject();
                                    }
                                }
                                if(coor.length == 2){
                                    coor = "?" + coor;
                                }else if(coor[0] != "?"){
                                    m = coor[1] + coor[2];
                                    coor = coor[0];
                                }else if (coor.length == 1){
                                    console.error("formato de coordenadas incorrecto");
                                    reject();
                                }
                                let pieza = this.buscarPieza(coor);
                                if(pieza.length > 0){
                                    if(coor[0] != "?"){
                                        let i = pieza.length - 1;
                                        while(i >= 0){
                                            if(pieza[i].color == objeto.formatoColor(this.turno)){
                                                if(pieza[i].validar(modoJuego.formatoCoordenadas(m), this.tablero)){
                                                    pieza[i].mover(modoJuego.formatoCoordenadas(m), this.tablero);
                                                    solve([true, true, comando]);
                                                }
                                            }
                                            i--;
                                        }
                                    }else{
                                        if(pieza[0].color == objeto.formatoColor(this.turno)){
                                            pieza[0].mover(modoJuego.formatoCoordenadas(m), this.tablero);
                                            solve([true, true, comando]);
                                        }
                                    }
    
                                }
                                console.error("Pieza no encontrada");
                                reject();
                            case 3:
                                let origen = cmd[1];
                                let destino = cmd[2];
                                if(this.jacke){
                                    let v = true;
                                    let m = destino;
                                    switch(destino.length){
                                        case 1:
                                            console.error("porfavor, se mas especifico");
                                            reject();
                                        case 3:
                                            m = destino[1] + destino[2];
                                            break;
                                    }
                                    this.reyes.map((rey)=>{
                                        if(rey.color == objeto.formatoColor(this.turno)){
                                            let mov = rey.amenazas[rey.amenazas.length - 1];
                                            if(mov.origen == this.tablero[modoJuego.formatoCoordenadas(m)]){
                                                v = false;
                                            }
                                            while(mov != null && v){
                                                if(modoJuego.formatoCoordenadas(m) == mov.objeto.posicion){
                                                    v = false;
                                                    break;
                                                }
                                                mov = mov.anterior;
                                            }
                                        }
                                    });
                                    if(v){
                                        console.error("No puedes mover esa pieza hasta eliminar la amenza del rey");
                                        reject();
                                    }
                                }
                                let piezas = this.buscarPieza(origen);
                                if(piezas.length == 0){
                                    console.error("Pieza no encontrada");
                                    reject();
                                }
                                switch(destino.length){
                                    case 1:
                                        let pieza = this.buscarPieza(destino);
                                        if(pieza.length == 0){
                                            console.error("Pieza no encontrada");
                                            reject();
                                        }
                                        for(let i = pieza.length-1; i >= 0; i--){
                                            if(piezas[i].color == objeto.formatoColor(this.turno)){
                                                if(piezas[i].validar(pieza[i].posicion, this.tablero) ){
                                                    piezas[i].mover(pieza[i].posicion, this.tablero);
                                                    solve([true, true, comando]);
                                                }
                                            }
                                        }
                                        console.error("Pieza no encontrada");
                                        reject();
                                    case 2:
                                        for(let i = piezas.length - 1; i >= 0; i--){
                                            if(piezas[i].color == objeto.formatoColor(this.turno)){
                                                if(piezas[i].validar(modoJuego.formatoCoordenadas(destino), this.tablero)){
                                                    piezas[i].mover(modoJuego.formatoCoordenadas(destino), this.tablero);
                                                    solve([true, true, comando]);
                                                    return;
                                                }
                                            }
                                        }
                                        console.error("la pieza indicado no puede moverse a ese lugar");
                                        reject();
                                        break;
                                    case 3:
                                        let p = this.buscarPieza(origen);
                                        if(p.length == 0){
                                            console.error("Pieza no encontrada");
                                        }
                                        for(let i = piezas.length - 1; i >= 0; i--){
                                            if(piezas[i].color == objeto.formatoColor(this.turno)){
                                                if(piezas[i].validar(p[0].posicion, this.tablero)){
                                                    piezas[i].mover(p[0].posicion, this.tablero);
                                                    solve([true, true, comando]);
                                                }
                                            }
                                        }
                                        console.error("la pieza no puede ocupar esa posicion");
                                        reject();
                                        break;
                                }
                                break;
                            default:
                                console.error("mv requiere unicamente un paraametro, maximo dos");
                                reject();
                        }
                        solve([true, true, comando]);
                        break;
                    case "end":
                        this.fin = true;
                        this.finDelJuego();
                        solve([false, true, "-end"]);
                        break;
                    case "-end":
                        this.fin = true;
                        this.finDelJuego();
                        solve([false, true, "-true final"]);
                        break;
                    default:
                        super.comandos(comando);
                        solve([false, false, comando]);
                }
            }catch(e){
                this.manejoError(e);
                reject();
            }
        }).catch(async (e)=>{
            input("Presiona enter para continuar...");
            console.clear();
            this.imprimir();
            await this.comando(input("tu turno:", "").replace("-", ""));
        });
    }

    async juego(){
        this.imprimir();
        if(this.turno == 0 && this.roll == 1){
            await this.comandoOnline(this.id, "").then(async (c)=>{
                await this.comandos(c).then((op)=>{
                    if(op != undefined){
                        if(op[0]){
                            this.turno+=1;
                        }
                        if(op[1] && op[2][0] == "-"){
                            this.comandoOnline(this.id, op[2]);
                        }
                    }
                });
                this.imprimir();
            });
        }
        if(!this.fin){            
            await this.comando(input("tu turno:", "").replace("-", ""));
            this.juego();
        }
    }
}


export{marco, modoLibre, modoFIDE, onlineLibre, onlineFIDE}