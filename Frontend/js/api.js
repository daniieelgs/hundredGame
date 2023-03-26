
const readAllNames = () => api("readAllNames")

const readAllOrder = () => api("readAllOrder");

const readPlayer = id => api(`read/${id}`);

const userExists = name => api(`exists/${name}`);

const savePlayer = (id, data) => id ? api(`update/${id}`, "PUT", data) : api("create", "POST", data);

const idPlayer = username => api(`id/${username}`);

function testConnection(){
    return new Promise((resolved, reject) => {

        try{
            fetch("http://daniieelgs.ddns.net/hundredGame/player/connection")
                .then(res => res.json())
                .then(res => resolved(res.connection))
                .catch(err => resolved(false));
        }catch(error){
            resolved(false);
        }

    });
}

function api(route, _method = "GET", _body = null, _header = {
    "Content-type" : "application/json"
}){

    return new Promise((resolved, reject) => {
        fetch(`http://danieelgs.ddns.net/hundredGame/player/${route}`, {
            method: _method,
            mode: "cors",
            body: _body ? JSON.stringify(_body) : null,
            headers: _header
        })
            .then(res => res.json())
            .then(resolved)
            .catch(reject);
    });

}

function makeUser(_id, _name, _score, _time, _helps){

    return {
        id: _id,
        name: _name,
        score: _score,
        time: _time,
        helps: _helps
    }

}
