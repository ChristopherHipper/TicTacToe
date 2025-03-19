let fields = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
];

const winningCombinations = [ // ein Array in dem alle GewinnCombinationen in Arrays drin sind
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Horizontal
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Vertikal
    [0, 4, 8],
    [2, 4, 6] // Diagonal
];

let currentPlayer = 'circle'; // variabel die beim beginn des spieles auf circle steht (also wird das erste symbol ein kreis)
let gameOver = false;

function getCircleSVG() {
    return `<svg class="circle" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                               <circle class="circle-path" cx="50" cy="50" r="18" stroke="#00B0EF" stroke-width="6" fill="none" stroke-dasharray="113.1" stroke-dashoffset="113.1"/>
            </svg>`;
}

function getCrossSVG() {
    return `<svg class="cross" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <line class="cross-line" x1="32" y1="32" x2="68" y2="68" stroke="#FFC000" stroke-width="6" stroke-dasharray="51" stroke-dashoffset="51" />
                <line class="cross-line" x1="68" y1="32" x2="32" y2="68" stroke="#FFC000" stroke-width="6" stroke-dasharray="51" stroke-dashoffset="51" />
            </svg>`;
}

function addSymbol(index) { // onclick funktion auf die einzelenden table datas
    if (fields[index] !== null || gameOver) return; // Falls das Feld schon belegt ist, nichts tun
    fields[index] = currentPlayer; // Setze den aktuellen Spieler auf das Feld
    let cell = document.querySelectorAll("td")[index]; // Hole das angeklickte Feld //querlySelectorAll(greift auf alle td's zu) da wir noch den index mit einfügen nur auf das eine td
    let symbolSVG = currentPlayer === 'circle' ? getCircleSVG() : getCrossSVG(); // Wähle das passende Symbol
    cell.innerHTML = symbolSVG; // Füge das Symbol in das Feld ein
    setTimeout(() => { // Füge die Animationsklasse nachträglich hinzu
        let symbol = cell.querySelector("svg");
        if (symbol) {
            symbol.classList.add("animate");
        }
    }, 10);
    currentPlayer = currentPlayer === 'circle' ? 'cross' : 'circle'; // Wechsle den Spieler
    endGame()
    if (gameOver) return;
    currentPlayerIndicator();
    setTimeout(makeRandomMove, 800);
}

function render() {
    let contentDiv = document.getElementById('content');
    let tableHTML = '<table>'; //eine Variabel in der ein HTML Tag <table> eingefügt wird
    for (let i = 0; i < 3; i++) { // eine äußere For schleife die bis 3 geht und jeweils eine Table Row erstellt (also) am Ende Drei reihen          
        tableHTML += '<tr>';
        for (let j = 0; j < 3; j++) { // eine innere For schleife die in die Table Rows 3 Table Datas einfügt. (somit bekommen wir 3x3 reihen)
            let index = i * 3 + j; // mit der Rechnung schauen wir in welchem Index im Array wir uns befinden (wenn die äußere For i=0 und die innere For j=0)
            let symbol = ''; // kriegen wir index (0*3+0)=0 also index 0 vom Array // sind wir allerdings bei der äußeren For i=2 und bei der inneren j=1
            // kriegen wir index (2*3+1)=7 also index 7 vom Array
            if (fields[index] === 'circle') { // if abfrage ob der index den wir berechnet haben ein circle oder cross ist
                symbol = getCircleSVG(); // falls eins davon stimmt wird in der variable symbol das passende symbol eingefügt
            } else if (fields[index] === 'cross') {
                symbol = getCrossSVG()
            }
            tableHTML += `<td onclick="addSymbol(${index})">${symbol}</td>`; // am ende wird eine Table dara mit dem passenden Symbol erzeugt
        }
        tableHTML += '</tr>'; // nach jeder inneren For schleife wird die Table Row geschlossen
    }
    tableHTML += '</table>'; // nach der 3ten row wird die table geschlossen
    contentDiv.innerHTML = tableHTML; // die ganze tabelle wird anschließend in die variable die auf die ID zugreift eingefügt
    currentPlayerIndicator();
}

function endGame() {
    for (let combination of winningCombinations) { // eine For schleife die die indexes von winningCombination in die variable combination packt (erster durchgang index=0 ([0,1,2])...)
        const [a, b, c] = combination; // packt das array combination in die const die wie ein array aufgebaut ist. Um das Array passend zu übergeben 
        if (fields[a] && fields[a] === fields[b] && fields[a] === fields[c]) { // if abfrage ob die Gewinn Combinationen auch den selben wert hat 3x(circle oder crosses)
            drawWinningLine(a, c);
            gameOver = true;
            openOverlay();
            chooseWinner(a, b, c);
            return;
        } else { checkGameOver() }
    }
}

function drawWinningLine(start, end) {
    let cells = document.querySelectorAll("td");
    let startRect = cells[start].getBoundingClientRect(); //getBoundingClientRect() gibt die Position und Größe eines Elements relativ zum Viewport zurück.
    let endRect = cells[end].getBoundingClientRect();
    let contentRect = document.getElementById("content").getBoundingClientRect();
    let x1 = startRect.left + startRect.width / 2 - contentRect.left; // Berechnung der Mittelpunkte der drei Gewinnfelder
    let y1 = startRect.top + startRect.height / 2 - contentRect.top;
    let x3 = endRect.left + endRect.width / 2 - contentRect.left;
    let y3 = endRect.top + endRect.height / 2 - contentRect.top;
    let width = Math.hypot(x3 - x1, y3 - y1) + 100; // Berechnung der gesamten Linienlänge durch alle drei Punkte
    let line = document.createElement("div"); // Erstellen und Stylen der Linie
    line.classList.add('winning_line');
    let angle = Math.atan2(y3 - y1, x3 - x1);
    if (y1 === y3) {
        // Horizontale Linie
        line.style.left = Math.min(x1, x3) - 50 + "px";
        line.style.top = y1 - 7 + "px";
    } else if (x1 === x3) {
        // Vertikale Linie
        line.style.left = x1 - width / 2 + "px";
        line.style.top = Math.min(y1, y3) - 7 + 134 + "px";
    } else {
        // Diagonale Linie
        line.style.left = Math.min(x1, x3) - 50 + "px";
        line.style.top = (y1 + y3) / 2 - 7 + "px";
    }
    line.style.transform = `rotate(${angle}rad)`; // Drehung der Linie, um sich an den Verlauf der Gewinnfelder anzupassen
    document.getElementById("content").appendChild(line); // einfügen der linie in die ID
}

function openOverlay() {
    let overlayRef = document.getElementById('overlay')
    overlayRef.classList.remove("d_none")
}

function closeOverlay() {
    let overlayRef = document.getElementById('overlay')
    overlayRef.classList.add("d_none")
    location.reload();
}

function chooseWinner(a, b, c) {
    let overlayText = document.getElementById("overlay_Text");
    if (fields[a] && fields[b] && fields[c] === 'circle') {
        overlayText.innerHTML = "Winner!";
    } else if (fields[a] && fields[b] && fields[c] === 'cross') {
        overlayText.innerHTML = "Loose!";
    }
}

function currentPlayerIndicator() {
    let crossElement = document.getElementById("cross");
    let circleElement = document.getElementById("circle");
    if (currentPlayer === 'circle') {
        circleElement.style.opacity = "1"; // Hervorheben
        crossElement.style.opacity = "0.2"; // Abdunkeln
    } else if (currentPlayer === 'cross') {
        crossElement.style.opacity = "1";
        circleElement.style.opacity = "0.2";
    }
}

function makeRandomMove() {
    if (currentPlayer !== 'cross') return; // Falls nicht Cross am Zug ist, beenden

    let emptyFields = fields
        .map((value, idx) => (value === null ? idx : null))
        .filter(idx => idx !== null); // Liste aller leeren Felder

    if (emptyFields.length === 0) return; // Falls keine freien Felder mehr da sind, beenden

    let bestMove = null;

    // 1. Prüfe, ob Cross gewinnen kann
    for (let combination of winningCombinations) {
        let [a, b, c] = combination;
        let values = [fields[a], fields[b], fields[c]];

        if (values.filter(v => v === 'cross').length === 2 && values.includes(null)) {
            bestMove = combination.find(idx => fields[idx] === null);
            break; // Sobald ein Gewinnzug gefunden wurde, beenden
        }
    }

    // 2. Falls kein Gewinnzug für Cross vorhanden ist, blockiere Circle
    if (bestMove === null) {
        for (let combination of winningCombinations) {
            let [a, b, c] = combination;
            let values = [fields[a], fields[b], fields[c]];

            if (values.filter(v => v === 'circle').length === 2 && values.includes(null)) {
                bestMove = combination.find(idx => fields[idx] === null);
                break; // Sobald ein Blockadezug gefunden wurde, beenden
            }
        }
    }

    // 3. Falls kein Gewinn- oder Blockadezug vorhanden ist, wähle ein zufälliges freies Feld
    if (bestMove === null) {
        bestMove = emptyFields[Math.floor(Math.random() * emptyFields.length)];
    }

    // Setze Cross an die berechnete Position
    fields[bestMove] = 'cross';
    let cell = document.querySelectorAll("td")[bestMove];
    cell.innerHTML = getCrossSVG();

    setTimeout(() => {
        let symbol = cell.querySelector("svg");
        if (symbol) {
            symbol.classList.add("animate");
        }
    }, 10);

    currentPlayer = 'circle'; // Spieler wechseln
    endGame(); // Überprüfe, ob das Spiel vorbei ist
    currentPlayerIndicator(); // Aktualisiere den Spieleranzeiger
}

function checkGameOver() {
    let overlayText = document.getElementById("overlay_Text");
    if (!fields.includes(null)) { // abfrage ob im array ein null enthalten ist. 
        openOverlay();
        overlayText.innerHTML = "Game Over!";
    } else return
}