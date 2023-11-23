/*Sirve para imprimir sin salto de linea*/
function imp(str){
    process.stdout.write(str)
}

/*
*movs se encarga de generar una lista de objetos en los cuales representan los posibles movimientos
*de la ficha de origen, movs es abrebiatura a movimientos.
*/
class movs{
    
    /*es variable es privada*/
    __origen = null;
    /*es variable es privada*/
    __objeto = null;
    /*es variable es privada*/
    __sgt = null;
    /*es variable es privada*/
    __ant = null;

    /** 
    * @public
    * @version 1.0
    * @author Dr.lagb1703
    * @param {objeto} origen 
    * @param {objeto} info
    * @param {movs} anterior
    * @description Para instaciar un movs el unico parametro obligatorio es el origen el cual se refiere
    *a quien puede realizar ese movimiento por consiguiente quien esta amenazando esa casilla.
    */
    constructor(origen, info, anterior){
        if(origen == undefined){
            throw new Error("los parametros deben ser rellenados correctamente");
        }
        this.anterior = anterior || null;
        this.objeto = info || null;
        this.origen = origen;
    }

   /**
    * @public
    * @version 1.0
    * @returns {void} void
    * @author Dr.lagb1703
    * @description
    * @param {Function} funcion 
    * @param {Number} n 
    * @param {Array} array 
    * @returns {Array} Array
    * @description La funcion map intenta replicar la funcionalidad map de los arrays, siendo solamente
    * necesario rellenar el compo de funcion, esta funcion va a recibir primero el objeto que esta 
    * en en el movimiento, el segundo es el numero de objeto que se llama despues del primer mov;
    * el tercero es el movs donde se ejecuta en el momento map y por ultimo quien origina la amenzasa.
    * esta funcion devuelve un array contodos los return de la funcion.
    * Ejemplo:
    *   teniendo esta lista: movs1 -> movs2 -> movs3 -> movs4-> null
    *   llamamos a la funcion: movs2.map((objeto_contenido, n, movs, origen)=>{
    *                                   console.log(objeto_contenido, n, movs, origen);
    *                               }
    *                           );
    *   produce: 
    *   objeto 0 movs2 pieza
    *   objeto 1 movs3 pieza
    *   objeto 2 movs4 pieza
    */
    map(funcion, n = 0, array = []){
        if(this.objeto != null){
            array.push(funcion(this.objeto, n, this, this.origen));
        }
        if(this.siguiente == null){
            return array;
        }
        this.siguiente.map(funcion, n = n+1, array = array);
    }

    /*
    * Contrato: push: objeto -> void
    * Proposito: La funcion push imita la funcionalidad de push de un array, el unico parametro necesario
    * es info el cual se refiere a un objeto, esta funcion va rellenando la lista con la info que le vamos
    * dando.
    * Ejemplo: 
    *   tenemos esta lista: movs:null -> null.
    *   llamamos a la funcion: movs.push(info1);
    *                          movs.push(info2);
    *                          movs.push(info3);
    *   terminaremos con la siguiente lista movs:info1 -> movs:info2 -> movs:info3 -> null.
    * 
    */
    push(info){
       if(this.objeto == null){
            this.objeto = info;
       }else if(this.siguiente == null){
            this.siguiente = new movs(this.origen, info, this);
       }else{
        this.siguiente.push(info);
       }
       return;
    }

    /*Setea __ant con un movs, este puede ser null pero no undefained*/
    set anterior(anterior){
        if(anterior === undefined){
            throw new Error("Debes rellenar correctamente los parametros");
        }
        this.__ant = anterior;
    }

    /*
    * Setea __origen con una pieza, este puede ser null pero no undefained
    * origen se refiere a una pieza que amenza el objeto
    */
    set origen(obj){
        if(obj === undefined){
            throw new Error("Debes rellenar correctamente los parametros");
        }
        this.__origen = obj;
    }
    
    /*
    * Setea __objeto con una pieza, este puede ser null pero no undefained
    * objeto se refiere al objeto amenazado por el origen
    */
    set objeto(obj){
        if(obj === undefined){
            throw new Error("Debes rellenar correctamente los parametros");
        }
        this.__objeto = obj;
    }

    /*Setea __sgt con un movs, este puede ser null pero no undefained*/
    set siguiente(sgt){
        if(sgt === undefined){
            throw new Error("Debes rellenar correctamente los parametros");
        }
        this.__sgt = sgt;
    }

    get anterior(){
        return this.__ant;
    }

    get objeto(){
        return this.__objeto;
    }

    get siguiente(){
        return this.__sgt;
    }

    get origen(){
        return this.__origen;
    }

}


class objeto{

    /*
    * contrato: formatoColor: (strng, number, boolean) -> boolean
    * Proposito: esta funcion normaliza la posibles representaciones de blanco y negro,
    *  siendo true la representacion del blanco y false la representacion de negro.
    * Ejemplo:
    *   llamamos a la funcion:
    *                   objeto.formatoColor(true);
    *                   objeto.formatoColor(false);
    *                   objeto.formatoColor("blanco");
    *                   objeto.formatoColor("negro");
    *                   objeto.formatoColor(numero par);
    *                   objeto.formatoColor(numero impar);
    *   obtenemos:
    *                   true
    *                   false
    *                   true
    *                   false
    *                   true
    *                   false
    * 
    */
    static formatoColor(color){
        switch(typeof(color)){
            case "boolean":
                return color;
            case "number":
                if(color%2 == 0){
                    return true;
                }else{
                    return false;
                }
            case "string":
                switch(color.toLowerCase()){
                    case "blanco":
                        return true;
                    case "negro":
                        return false;
                    default:
                        throw new Error("Intetas llenar color con un formato incorrecto"); 
                }
            default:
                throw new Error("Intetas llenar color con un formato incorrecto");
        }
    }

    /*es variable es privada*/
    __c = false;
    /*es variable es privada*/
    __p = -1;
    /*es variable es privada*/
    __simbolo = 63;
    /*es variable es privada*/
    __select = false;
    /*es una variable publica*/
    amenazas = [];

   /**
    * @public
    * @abstract
    * @version 1.0
    * @author Dr.lagb1703
    * @param {number} posicion 
    * @param {boolean} color 
    * @param {number} simbolo 
    * @description objeto es una clase abstracta, lo cual significa que no se puede instanciar solo heredar.
    * Esta clase se asimila a cualquier objeto en el tablero de ajedrez, todo objeto que compone un tablero
    * debe heredar de ella.
    * esta ofrece el color, la posicion, el simbolo y las amenzas de un objeto en el tablero.
    */
    constructor(posicion, color, simbolo){
        if (new.target === objeto) {
            throw new Error( 'No puedes instanciar una clase abstracta' );
        }
        if(posicion == undefined || color == undefined || simbolo == undefined){
            throw new Error("Intentas iniciar una clase sin uno de sus parametros")
        }else{
            this.__p = posicion;
            this.__c = objeto.formatoColor(color);
            switch(typeof(simbolo)){
                case "number":
                    this.__simbolo = simbolo;
                    break;
                case "string":
                    if(simbolo.length == 1){
                        this.__simbolo = simbolo;
                    }else{
                        this.__simbolo = simbolo.charCodeAt(0);
                    }
                    break;
                default:
                    throw new Error("Intentas cojer un simbolo sin el formato indicado");
            }
        }
    }

    get simbolo(){
        return this.__simbolo;
    }

    /*
    * Setea __p con un number, este debe ser number
    * este numero mayor igual a 0 y menor a 64
    */
    set posicion(pos){
        if(typeof(pos) == "number"){
            this.__p = pos;
        }else{
            throw new Error("Intentas poner un " + typeof(pos) + " en un number")
        }
    }

    get posicion(){
        return this.__p;
    }

    /*
    * Setea __c con un boolean, este debe ser boolean
    * donde true es blaco y false es negro
    */
    get color(){
        return this.__c;
    }

    set color(color){
        this.__c = objeto.formatoColor(color);
    }

    /*
    * obtiene el objeto en si, es una recreacion de prototipe
    */
    get prototype(){
        return objeto;
    }

    /*
    * Contrato: selecionar: void -> void
    * Proposito: su funcion es separar el objeto de los otros objetos del tablero
    * la funcion imprimir se ve afectada al imprimir un objeto selecionado
    * Ejemplo: 
    *   llamamos a la funcion: objeto.selecionar();
    *   obtendermos un objeto selecionado.
    */
    seleccionar(){
        this.__select = true;
        return;
    }

    /**
     * @public
     * @version 1.0
     * @returns void
     * @author Dr.lagb1703
     * @description su funcion es revertir el la selecion del objeto.
    * Ejemplo: 
    *   llamamos a la funcion: objeto.deselecionar();
    *   obtendermos un objeto normal.
    */
    deseleccionar(){
        this.__select = false;
        return;
    }

    /**@public
     * @version 1.0
     * @returns void
     * @author Dr.lagb1703
     * @description su funcion es representar el objeto en el tablero, immprimiendo el simbolo interno del objeto
    * si el objeto esta selecionado, puede cambiar la representacion de este en el tablero.
    * Ejemplo: 
    *   llamamos a la funcion: 
    *                           objeto.imprimir();
    *                           alfil.imprimir();
    *                           casillaNegra.imprimir();
    *                           alfil.selecionar();
    *                           alfil.imprimir();
    *                           casillaNegra.seleccionar();
    *                           casillaNegra.imprimir();
    *   obtendermos: 
    *                           ?
    *                           a
    *                           ▓
    *                           ╬
    *                           ░
    * 
    */
    imprimir(){
        switch(this.color){
            case false:
                if(typeof(this.simbolo) == "string"){
                    imp(this.simbolo.toLowerCase());
                }else{
                    imp(String.fromCodePoint(this.simbolo).toLowerCase());
                }
                break;
            case true:
                if(typeof(this.simbolo) == "string"){
                    imp(this.simbolo.toUpperCase());
                }else{
                    imp(String.fromCodePoint(this.simbolo).toUpperCase());
                }
                break;
        }
        return;
    }

    /**
     * @public
     * @version 1.0
     * @param {movs} mov 
     * @returns void
     * @author Dr.lagb1703
     * @description Añadir un movs que adentro tiene  un origen el cual es una pieza.
     * si es movimiento ya esta registrado no se registra nuevamente
     * 
     * Ejemplo:
     *          Tenemos //object.amenazado(movs);
     *          Obtendremos: [movs]
     */
    amenasado(mov){
        if(mov in this.amenazas){
            return;
        }
        if(!(mov instanceof movs)){
            throw new Error("instentas rellenar un mov con la clase " + mov.prototype);
        }
        this.amenazas.push(mov);
    }

    /**
     * @public
     * @version 1.0
     * @param {movs} mov
     * @returns {void} void
     * @author Dr.lagb1703
     * @description invocar la funcion amenazado del objeto dentro del movs.
     * 
     * Ejemplo: 
     *          Tenemos: objectoPeligroso.amenazar(movs)
     *          Obtendremos en el objeto dentro del movs: [movs]
     */
    amenazar(mov){
        return mov.objeto.amenasado(mov);
    }

    /**
     * @public
     * @version 1.0
     * @param {objeto} objeto
     * @returns {void} void
     * @author Dr.lagb1703
     * @description eliminar un mov de amenazas.
     */
    aliviar(objeto){
        this.amenazas = this.amenazas.filter((mov) =>{
            if(mov.origen !== objeto){
                return objeto;
            }else{
                mov.map((n)=>{
                    n.amenazas = this.amenazas.filter((n)=> mov.origen !== objeto);
                });
            }
        });
        return true;
    }

    /**
     * @public
     * @version 1.0
     * @returns {void} void
     * @author Dr.lagb1703
     * @description selecciona todos las piezas del color contrario del objeto.
     */
    seleccionarEnemigos(){
        this.amenazas.map((mov)=>{
            mov.origen.seleccionar();
        });
        return;
    }
}

export{imp, objeto, movs};