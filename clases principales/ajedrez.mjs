import {marco, modoLibre, modoFIDE, onlineLibre, onlineFIDE} from "./juego.mjs"
import * as rd from "readline-sync";

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

class iu{
    __modo = null;
    constructor(){
        this.menu();
    }

    async menu(){
        console.log("Buenvenido a ajedrez de luis, recuerde que aun esta en fase de desarollo asi que tenga pasiencia, si algun proceso se queda trabado en consola, utilize control + c para detener la ejecucion.");
        input("da enter para continuar..", "");
        let op1 = 0;
        let op2 = 0;
        do{
            console.clear();
            op1 = input("seleccione su preferencia: \n1. multijugador online \n2. multijugador en equipo\n3. salir del programa\n", "number");
            switch(op1){
                case 1:
                    console.clear();
                    console.log("bienvenio al modo online");
                    let nombre = input("Porfavor dijita tu nombre de usuario: ", "");
                    console.clear();
                    do{
                        op2 = input("Seleccione el modo que desea jugar.\n1. modo Libre.\n2. modo FIDE\n", "number");
                        switch(op2){
                            case 1:
                                this.__modo = new onlineLibre(marco.tableroClasico(), "http://localhost/", nombre);
                                break;
                            case 2:
                                this.__modo = new onlineFIDE(marco.tableroClasico(), "http://localhost/", nombre);
                                break;
                            default:
                                op2 = 4;
                        }
                    }while(op2 > 3);
                    console.log("esperando respuesta del servidor...");
                    await this.__modo.conection().then(async ()=>{
                        console.clear();
                        if(!this.__modo.conectado){
                            console.error("servidor apagado");
                            return false;
                        }
                        do{
                            op2 = input(nombre + " dijite la opcion que le gustaria usar:\n1. crear partida(se une de una)\n2. unirse a partida\n3.salir del modo online\n", "number");
                            switch(op2){
                                case 1:
                                    await this.__modo.crearPartida(-1, -1).then(async (json)=>{
                                        console.log("id de partida: ", json.id);
                                        console.log("esperando al rival... ");
                                        await this.__modo.conectarsePartida(json.id).then((re)=>{
                                            if(re != undefined)
                                                this.__modo.init();
                                            else
                                                console.error("partida cerrada");
                                        });
                                    });
                                    break;
                                case 2:
                                    console.log("esperando al otro jugador");
                                    await this.__modo.conectarsePartida(input("dijite el id a conectarse: ", "number")).then((j)=>{
                                        if(j != undefined){
                                            this.__modo.init();
                                        }else
                                            console.log("partida no encontrada");
                                    }).catch(()=>{
                                        console.log("partida no encontrada");
                                    });
                                    break;
                                case 3:
                                    console.clear();
                                    console.log("regresando al menu principal");
                                    break;
                                default:
                                    console.log("opcion no valida");
                            }
                            op1 = 3;
                        }while(op2 > 3);
                    }).catch((e)=>{
                        console.log("Por desgracia el servidor no esta disponible");
                        input("PRESIONA ENTER PARA CONTINUAR...", "");
                    });
                    break;
                case 2:
                    do{
                        console.clear();
                        op2 = input("Seleccione el modo de juego:\n1.modo libre\n2.modo FIDE\n3.salir", "number");
                        switch(op2){
                            case 1:
                                this.__modo = new modoLibre(marco.tableroClasico());
                                this.__modo.init();
                                break;
                            case 2:
                                this.__modo = new modoFIDE(marco.tableroClasico());
                                this.__modo.init();
                                break;
                            case 3:
                                console.log("regresando al menu principal");
                                break;
                            default:
                                console.log("opcion no valida.");
                        }
                    }while(op2 != 3);
                    break;
                case 3:
                    console.clear();
                    console.log("gracias por utilizar este servicio");
                    break;
                default:
                    console.log("opcion no valida");
            }
        }while(op1 != 3);
    }
}

let j = new iu();