addEventListener("message", async function(e){

    let users = JSON.parse(e.data);

    if(users.length == 0) return;

    let online = await testConnection();

    console.log("online: " + online);

    if(online){
        update(users);
    }else{

        let idInterval = this.setInterval(async function() {

            online = await testConnection();

            console.log("online: " + online);

            if(online){
                clearInterval(idInterval);
                update(users);
            }

        }, 10000);

    }

});

function update(users){

    postMessage(JSON.stringify(users))

}

function testConnection(){

    return new Promise((resolved, reject) => {

        try{
            fetch("http://danieelgs.ddns.net/hundredGame/player/connection")
                .then(res => res.json())
                .then(res => resolved(res.connection))
                .catch(err => resolved(false));
        }catch(error){
            resolved(false);
        }

    });

}