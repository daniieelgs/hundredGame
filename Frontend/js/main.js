'use strict';


IDBRequest.addEventListener('success', showModal);

const maxNumber = 100;

const scoreSpan = document.getElementById("score");
const scoreTimer = document.getElementById("timer");
const record = document.getElementById("record");
const userName = document.getElementById("user");
const userList = document.getElementById("userList");
const btnHelp = document.querySelector(".btnHelp");
const txBtnHelp = btnHelp.innerText;
const gameEnd = document.querySelector(".gameEnd");
const labelGameEnd = document.getElementById("labelGameEnd");
const textLabel = document.querySelector(".label");

let lastClicked = creteNumberButton(0);

let playing = false;
let isPause = false;

let points = 0;
let nHelp = 0;

let initTime = -1;
let timer = initTime;
let idTimer;

let timerBtnHelp = 0;
let idTimerBtnHelp;

let player;
let playerId;
let recordPoints = 0;
record.innerText = recordPoints;

userName.addEventListener("click", showModal);

document.addEventListener("keydown", e => {if(e.key == 'p') pause()});

document.querySelector(".btnPause").addEventListener("click", pause);

document.querySelector(".btnPlay").addEventListener("click", pause);

document.querySelector(".btnReset").addEventListener("click", reset);

document.querySelector(".btnSelectUser").addEventListener("click", e => {

    if(!getUserSelected().name){
        setModalError("Introduce un nombre de usuario");
        return;
    }
    
    setModalError("");

    let user = getUserSelected();

    player = user.name;
    playerId = user.id;


    closeModal();
    reset();
    start();


});

window.addEventListener("beforeunload", () => {
    if(idTimer) saveData();
})

function startTimerHelp(){
    idTimerBtnHelp = setInterval(() => {

        if(timerBtnHelp == 0){
            resetBtnHelpState();
            return;
        }

        timerBtnHelp--;

        btnHelp.innerText = timerBtnHelp;

    }, 1000);
}

btnHelp.addEventListener("click", e => {

    if(!playing || isPause || btnHelp.classList.contains("helpTimer")) return;

    help();

    timerBtnHelp = parseInt(btnHelp.dataset.timer);

    btnHelp.classList.add("helpTimer");
    btnHelp.innerText = timerBtnHelp;

    gameEnd.classList.remove

    startTimerHelp();

});

function pause(){

    if(!playing) return;

    isPause = !isPause;

    if(isPause){

        clearInterval(idTimer);
        clearInterval(idTimerBtnHelp);

        document.querySelectorAll(".btnNumber").forEach(n => {
            if(!n.classList.contains("clickedCorrect")){
                n.classList.add("paused");
            }
        });    


        showModalComponent(modalPause);

        setPause();

    }else{

        setResume();

        if(idTimer) startTimer();
        if(idTimerBtnHelp) startTimerHelp();

        document.querySelectorAll(".btnNumber").forEach(n => n.classList.remove("paused"));

    }

}

function updateScore(){
    points = lastClicked.dataset.number;
    scoreSpan.innerText = points;

    if(points > recordPoints) {
        recordPoints = points;
        record.innerText = recordPoints;
    }
}

function timePeeker(){

    timer++;

    scoreTimer.innerText = timer;

}

function count(){

    if(initTime < 0){
        timePeeker();
        return;
    }

    if(timer == 0){
        gameOver();
        return;
    }
    else if(timer <= 30) scoreTimer.classList.add("shortTime");
    else scoreTimer.classList.remove("shortTime");
    timer--;
    scoreTimer.innerText = timer;
}

function gameOver(){
    gameEnd.innerText = "Game Over";
    gameEnd.classList.add("gameOver");
    textLabel.classList.add("gameOver");
    endGame();
}

function gameWinned(){
    gameEnd.innerText = "You Win";
    gameEnd.classList.add("gameWin");
    textLabel.classList.add("gameWin");
    document.querySelectorAll(".btnNumber.clicked").forEach(n => n.classList.add("animatedClick"));
    endGame();
}

function endGame(){
    clearInterval(idTimer);
    clearInterval(idTimerBtnHelp);


    idTimer = undefined;
    idTimerBtnHelp = undefined;

    playing = false;

    saveData();

    showModalLabel();
}

function saveData(){

    let time = initTime > 0 && points >= maxNumber ? initTime-timer : timer;

    saveUserIDB(player, points, time, nHelp, playerId);
    savePlayer(playerId, makeUser(playerId, player, points, time, nHelp))
        .then(res => playerId = res.id);


}

function creteNumberButton(number){

    const btn =  document.createElement("span");
    btn.classList.add("btnNumber");

    btn.dataset.number = number;

    btn.addEventListener("click", clickBtnNumber);

    return btn;

}

function startTimer(){
    idTimer = setInterval(count, 1000);
}

function clickBtnNumber(e){

    if(!playing || isPause || e.target.classList.contains("clicked")) return;

    if(lastClicked.dataset.number == 0) startTimer();

    e.target.classList.add("clicked");

    if((parseInt(lastClicked.dataset.number) + 1) == e.target.dataset.number){
        
        lastClicked = e.target;

        lastClicked.classList.add("clickedCorrect");

        updateScore();

        if(points >= maxNumber) gameWinned();

        return;

    }

    lastClicked.classList.add("clickedBad", "animatedClick");
    lastClicked.classList.remove("clickedCorrect");
    e.target.classList.add("clickedBad", "animatedClick");
    
    gameOver();

}

function start(){
    const game = document.getElementById("game");

    game.innerHTML = '';

    const fragment = document.createDocumentFragment();

    Array.from(Array(maxNumber).keys()).sort(n => 0.5 - Math.random()).forEach(n => fragment.appendChild(creteNumberButton(n+1)));

    console.log(fragment.innerHTML);

    game.appendChild(fragment);

}

function resetBtnHelpState(){
    timerBtnHelp = 0;
    btnHelp.innerText = txBtnHelp;
    btnHelp.classList.remove("helpTimer");
    clearInterval(idTimerBtnHelp);
    idTimerBtnHelp = undefined;
}

function help(){

    const btn = document.querySelector(`.btnNumber[data-number="${parseInt(lastClicked.dataset.number)+1}"]`);

    btn.classList.remove("help");

    nHelp++;

    setTimeout(() => btn.classList.add("help"), 500);

}

function reset(){

    if(idTimer) saveData();


    if(playerId){

        tryRead(readPlayer, readUserIDB, res => {
            recordPoints = res.score ?? res.record;
            record.innerText = recordPoints;
            if(recordPoints >= maxNumber) initTime = (parseInt(res.time)+1);

            timer = initTime;
            count();

        }, [playerId], [player]);

    }else{

        recordPoints = 0;
        record.innerText = recordPoints;
        initTime = -1;
        timer = initTime;
        count();

    }

    lastClicked = creteNumberButton(0);
    nHelp = 0; 

    resetBtnHelpState();
    updateScore();
    clearInterval(idTimer);
    clearInterval(idTimerBtnHelp);

    idTimer = undefined;
    idTimerBtnHelp = undefined;

    gameEnd.innerText = "";
    gameEnd.classList.remove("gameOver", "gameWin")

    userName.innerText = player;

    document.querySelectorAll(".btnNumber").forEach(n => {

        n.classList.remove("clicked", "clickedBad", "clickedCorrect", "help", "animatedClick");

    });

    textLabel.classList.remove("gameWin", "animatedLabel", "gameOver");


    playing = true;
    isPause = false;

    start();

}