const { response } = require("express");

let id = 0;

let nombre = "";


/*
fetch("http://localhost:3000/",{
    method: "PATCH",
    body: JSON.stringify({
        id:0,
        comando:"mv 54"
    }),
    headers:{
        "Content-type": "application/json; charset=UTF-8"
    }
}).then(res => {
    if(res.ok){
        return res.json()
    }
})
.then((json)=>{
    if(json != undefined){
        console.log(json);
    }else{
        console.log("partida no creada");
    }
})*/

/*
fetch("http://localhost:3000/",{
    method: "POST",
    body: JSON.stringify({
        id:-1,
        nombre: "pepe",
        tipo: "libre", 
        roll:-1
    }),
    headers:{
        "Content-type": "application/json; charset=UTF-8"
    }
}).then(res => {
    if(res.ok){
        return res.json()
    }
})
.then((json)=>{
    if(json != undefined){
        console.log(json);
    }else{
        console.log("partida no creada");
    }
})*/

/* PUT
fetch("http://localhost:3000/",{
    method: "PUT",
    body: JSON.stringify({
        id:-1,
        nombre: "pepe",
        tipo: "libre"
    }),
    headers:{
        "Content-type": "application/json; charset=UTF-8"
    }
}).then(res => {
    if(res.ok){
        return res.json()
    }
})
.then((json)=>{
    if(json != undefined){
        console.log(json);
    }else{
        console.log("partida no encontrada");
    }
})
.catch(err => console.log(err));
*/

/* DELETE
setTimeout(()=>{
    fetch("http://localhost:3000/",{
        method: "DELETE",
        body: JSON.stringify({
            id:0,
            instrucion:"cancel"
        }),
        headers:{
            "Content-type": "application/json; charset=UTF-8"
        }
    })
}, 1000);
*/