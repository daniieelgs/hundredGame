'use strict';


function createRankingElement(user, units, ignores){

    const tr = document.createElement("tr");

    for(let prop in user){

        if(ignores.includes(prop)) continue;

        const td = document.createElement("td");
        td.classList.add(prop);
        td.innerText = user[prop] + (units[prop] ?? "");

        tr.appendChild(td);
    }

    return tr;

}

async function makeRanking(users, units, translates, ignores){

    const fragment = document.createDocumentFragment()

    if(!users.length){
        
        const h1 = document.createElement("h1");
        h1.classList.add("nonData");

        h1.innerText = "Not data yet";

        fragment.appendChild(h1);

        return fragment;

    }

    let online = await testConnection();

    if(!online){
        const h4 = document.createElement("h4");
        h4.classList.add("offline");

        h4.innerText = "¡Offline results!";

        fragment.appendChild(h4);
    }

    const table = document.createElement("table");
    table.classList.add("rankingTable");

    const titles = document.createElement("tr");

    for(let n in users[0]){

        if(ignores.includes(n)) continue

        const th = document.createElement("th");
        th.innerText = translates[n] ?? n;
        th.innerText = th.innerText.charAt(0).toUpperCase() + th.innerText.slice(1);
        titles.appendChild(th);
            
    }

    table.appendChild(titles);

    users.forEach(n => table.appendChild(createRankingElement(n, units, ignores)));

    fragment.appendChild(table);

    return fragment;

}

function showRanking(alertComponent){
    
    alertComponent.innerHTML = "";

    tryRead(readAllOrder, readAllUsersOrderIDB, async function(res) {

        alertComponent.appendChild(await makeRanking(res, {
            "score":"pts",
            "time":"s"
        }, {
            "name" : "nombre",
            "time" : "tiempo"
        }, ["helps", "id", "timestamp"]));

    })

}

const listenerAlerts = [];
listenerAlerts["ranking"] = showRanking;

document.querySelectorAll(".modalAlert > nav > ul > li").forEach(n => {

    n.addEventListener("click", e => {

        const selected = document.querySelector(".modalAlert > nav > ul > li.select")
        selected.classList.remove("select");
        

       const opened = document.querySelector(`.modalAlert .contentAlert.${selected.className}Alert`);
       opened.classList.add("hideAlert");

       const alertComponent = document.querySelector(`.modalAlert .contentAlert.${n.className}Alert`);
       alertComponent.classList.remove("hideAlert");

        const type = e.target.className;

       n.classList.add("select");

       if(listenerAlerts[type]) showRanking(alertComponent);

    });

});
