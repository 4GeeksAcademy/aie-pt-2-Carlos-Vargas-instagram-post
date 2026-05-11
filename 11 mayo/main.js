const counterText = document.getElementById('counter');
const subtractButton = document.getElementById('subtract');
const addButton = document.getElementById('add');

let playedGames = 0;

function updateCounter() {
  counterText.innerHTML = playedGames;
}

function addPlayedGame() {
    playerdGames++;
    updateCounter();

    if (playedGames > 10) {
        counterText.style.color = 'red';
    }
}

const subtractPlayedGame = () => {

    if (playedGames == 0) {
        return alert('No puedes restar más juegos jugados');
    }


    playedGames--;
    updateCounter();

    if (playedGames <= 10) {
        counterText.style.color = 'black';
    }

addButton.addEventListener('click', addPlayedGame);
subtractButton.addEventListener('click', subtractPlayedGame);

uopdateCounter();



const form = document.getElementById('myForm');
const table = document.getElementById('gameTable');

let videogamesTable = [{videogame: 'RDR2', score:99 platform: 'Nintendo Switch', }];

function renderTable() {

    videogamesTable.forEach((videogame) => {
   const row = document.createElement('tr');

    const CellVideogame = document.createElement('td');
    CellVideogame.innerHTML = videogamesTable[0].videogame;
    const Cellscore = document.createElement('td');
    Cellscore.innerHTML = videogamesTable[0].score;
    const Cellplatform = document.createElement('td');
    Cellplatform.innerHTML = videogamesTable[0].platform;

    row.appendChild(CellVideogame);
    row.appendChild(Cellscore);
    row.appendChild(Cellplatform);

    table.appendChild(row);

}

const clearinputs = () => {
    form.videogame.value = '';
    form.score.value = '';
    form.platform.value = '';
}

renderTable();


