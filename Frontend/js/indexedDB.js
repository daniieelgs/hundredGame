'use strict';

const IDBRequest = indexedDB.open("usuarios", 1);

const dbName = "players";

IDBRequest.addEventListener('upgradeneeded', () => {

    const db = IDBRequest.result;

    db.createObjectStore(dbName, {
        keyPath: "name"
    })

});

IDBRequest.addEventListener('success', updateStatus);

function getObjectStore(idb = IDBRequest, objectStoreName = dbName, mode = "readonly", callbackComplete = null, callbackError = null){

    const db = idb.result;
    const IDBtransaction = db.transaction(objectStoreName, mode);
    const objectStore = IDBtransaction.objectStore(objectStoreName);

    if(callbackComplete) IDBtransaction.addEventListener("complete", callbackComplete);
    if(callbackError) IDBtransaction.addEventListener("error", callbackError);

    return objectStore;

}

function readAllUserIDB(){

    const objectStore = getObjectStore();

    const cursor = objectStore.openCursor();

    let usersName = []

    return new Promise((resolved, reject) => {
        cursor.addEventListener("success", () => {

            if(cursor.result) {

                usersName.push(cursor.result.key);
    
                cursor.result.continue();
    
            }else resolved(usersName);
    
        });
    });

}

function readAllIDB(){

    return new Promise((resolved, reject) => {
        readAllUserIDB()
            .then(users => Promise.all(users.map(n => readUserIDB(n))))
            .then(resolved)
            .catch(reject);
    });

}

function readAllUsersOrderIDB(){
    return new Promise((resolved, reject) => {

        readAllUserIDB()
            .then(users => Promise.all(users.map(n => readUserIDB(n))))
            .then(res => {
                const orderUsers = res.sort((n1, n2) => (n2.record - n1.record) == 0 ? ((n1.time - n2.time) == 0 ? n1.helps - n2.helps : n1.time - n2.time) : n2.record - n1.record)
                resolved(orderUsers);
            })
            .catch(reject);

    });
}

function readUserIDB(user){

    const objectStore = getObjectStore();

    const cursor = objectStore.openCursor();

    return new Promise((resolved, reject) => {

        cursor.addEventListener("success", () => {

            if(cursor.result) {
    
                if(cursor.result.key == user){
                    resolved(cursor.result.value);
                    return;
                }
    
                cursor.result.continue();
    
            }else reject();
    
        });

    })

}

function saveUserIDB(user, score, time, helps, id, timestamp = new Date().getTime()){

    let userObj = makeUserIDB(user, score, time, helps, id, timestamp);

    return new Promise((resolved, reject) => {
        
        readUserIDB(user)
            .then(res => {

                if(parseInt(userObj.record) < parseInt(res.record)){

                    userObj.record = res.record;
                    userObj.time = res.time;
                    
                }else if(userObj.record == res.record){

                    if(userObj.time < res.time){
                        userObbj.helps = res.helps;
                    }else{
                        userObj.time = res.time;
                        userObj.helps = userObj.helps > res.helps ? res.helps : userObj.helps;
                    }

                }

                updateUserIDB(userObj, getObjectStore(IDBRequest, dbName, "readwrite"));
                resolved();
            })
            .catch(() => {
                createUserIDB(userObj, getObjectStore(IDBRequest, dbName, "readwrite"));
                resolved();
            })
    })

}

const updateUserIDB = (user, objectStore) => objectStore.put(user);

const createUserIDB = (user, objectStore) => objectStore.add(user);

const deleteUserIDB = user => getObjectStore(IDBRequest, dbName, "readwrite").delete(user);

function makeUserIDB(user, score, time, help, id, timestamp){

    return {
        name: user,
        record: score,
        time: time,
        helps: help,
        id: id,
        timestamp: timestamp
    }

}

async function updateStatus(){

    const work = new Worker('js/worker.js');

    work.addEventListener("message", async function() {

        const users = await readAllUserIDB();

        console.log("updating");

        users.forEach(async function(n){

            let timestamp;

            let exists = (await userExists(n)).exists;

            let user = await readUserIDB(n);

            timestamp = user.timestamp;

            if(user.id && !exists){
                await deleteUserIDB(n);
                return;
            }

            if(!user.id && exists) user.id = (await idPlayer(n)).id;

            let player = await savePlayer(user.id, makeUser(user.id, user.name, user.record, user.time, user.helps));

            player = await readPlayer(player.id);

            if(((new Date().getTime() - timestamp)/(1000*60*60*24)) > 7) await deleteUserIDB(player.name);
            else await saveUserIDB(player.name, player.score, player.time, player.helps, player.id, timestamp);

        })

        updateList();


    });

    let users = await readAllUserIDB();

    work.postMessage(JSON.stringify(users));

}

function tryRead(server, local, action, paramServer = [], paramLocal = []){

    server(...paramServer)
        .then(action)
        .catch(() => local(...paramLocal).then(action));

}

    // testConnection()
    //     .then(res => {
    //         if(res.connection) server(...paramServer)
    //                                 .then(action)
    //                                 .catch(() => local(...paramLocal).then(action));
    //         else local(...paramLocal)
    //                 .then(action);
    //     });