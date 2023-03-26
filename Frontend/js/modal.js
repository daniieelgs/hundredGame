'use strict';

const modal = document.getElementById("modal");
const modalError = document.querySelector(".invalidError");
const modalPause = document.getElementById("modalPause");
const play = modalPause.querySelector(".btnPlay");
const selectUser = document.getElementById("userSelected");
const usersLoad = [];


function showModal(){
    showModalComponent(modal);
    updateList();
}

function updateList(){
    selectUser.value = player ?? "";

    userList.innerHTML = "";

    tryRead(readAllNames, readAllIDB, res =>  {

        let fragment = document.createDocumentFragment()

        res.forEach(n => {

            let opt = document.createElement("option");
            opt.value = n.name;

            usersLoad[n.name] = n.id;

            fragment.appendChild(opt);

        });

        userList.appendChild(fragment);
    });
}

function getUserSelected(){
    const name = selectUser.value.trim();

    return usersLoad[name] ? {name: name, id: usersLoad[name]} : {name: name};

}

function showModalLabel(){

    showModalComponent(labelGameEnd, false);

    textLabel.innerText = gameEnd.innerText;

    const transitionListner = () => {
        closeModalLabel();
        textLabel.classList.remove("animatedLabel");
        textLabel.removeEventListener("animationend", transitionListner);
    }

    textLabel.addEventListener("animationend", transitionListner);

    textLabel.classList.add("animatedLabel");
}


function closeModalLabel(){
    closeModalComponent(labelGameEnd);
}


function closeModal(){
    closeModalComponent(modal);
}

function showModalComponent(component){
    location.href = "#";
    document.body.classList.add("modal");
    component.classList.add("showModal");
}

function closeModalComponent(component){
    document.body.classList.remove("modal");
    document.body.style = "";
    component.classList.remove("showModal");
}

function setModalError(msg){
    modalError.innerText = msg;
}

function setPause(){
    setTimeout(() => play.classList.replace("hide", "enter"), 100);
}

function setResume(){
    play.classList.replace("enter", "exit")

    const transtitionEnd = () => {
        closeModalComponent(modalPause);
        play.classList.replace("exit", "hide");
        play.removeEventListener("transitionend", transtitionEnd);
    }

    play.addEventListener("transitionend", transtitionEnd);
}