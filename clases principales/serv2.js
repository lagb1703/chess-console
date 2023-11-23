fetch("http://localhost:3000/",{
    method: "PATCH",
    body: JSON.stringify({
        id:0,
        comando:""
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
})
