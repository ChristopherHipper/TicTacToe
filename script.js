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

const winningCombinations = [ // ein Array in dem alle Gewinn Combinationen in Arrays drin sind
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
    cell.innerHTML = getCircleSVG(); // Füge den Kreis in das Feld ein
    setTimeout(() => { // Füge die Animationsklasse nachträglich hinzu
        let symbol = cell.querySelector("svg");
        if (symbol) {
            symbol.classList.add("animate");
        }
    }, 10);
    currentPlayer = 'cross'; // Wechsle den Spieler
    endGame()
    if (gameOver) return;   // wenn das Spiel durch diesen Zug beendet ist beende die Funktion
    currentPlayerIndicator();
    setTimeout(makeRandomMove, 800);
}

function endGame() {
    for (let combination of winningCombinations) { // eine For schleife die die indexes von winningCombination in die variable combination packt (erster durchgang index=0 ([0,1,2])...)
        const [a, b, c] = combination; // packt das array combination in die const die wie ein array aufgebaut ist. Um das Array passend zu übergeben 
        if (fields[a] && fields[a] === fields[b] && fields[a] === fields[c]) { // if abfrage ob die Gewinn Combinationen auch den selben wert hat 3x(circle oder crosses)
            drawWinningLine(a, c); // wenn true zeichne die linie dadurch
            gameOver = true;        // setzte Game over auf true
            openOverlay();          // öffne das overlay
            chooseWinner(a, b, c);  // und gebe den gewinner bekannt
            return;
        } else { checkGameOver() }  // falls false checke ob das spiel vorbei ist 
    }
}

function drawWinningLine(start, end) {  // funktion die eine linie durch die 3 passenden Symbole zeichnet 
    const lineColor = '#ffffff';
    const lineWidth = 5;
  
    const startCell = document.querySelectorAll(`td`)[start]; // greift auf die td mit den index von dem start gewinner indexes z.B. 0
    const endCell = document.querySelectorAll(`td`)[end];   // greift auf die td mit den index von dem ende des gewinner indexes z.B.2
    const startRect = startCell.getBoundingClientRect(); //getBoundingClientRect() gibt die position vom start td (bottom,height,left,right...)
    const endRect = endCell.getBoundingClientRect();//getBoundingClientRect() gibt die position vom end td (bottom,height,left,right...)
  
    const contentRect = document.getElementById('content').getBoundingClientRect();//getBoundingClientRect() gibt die position vom content container(bottom,height,left,right...)
  
    const lineLength = Math.sqrt( // berechnet die läng der linie mit dem Satz des Pythagoras
      Math.pow(endRect.left - startRect.left, 2) + Math.pow(endRect.top - startRect.top, 2)
    );
    const lineAngle = Math.atan2(endRect.top - startRect.top, endRect.left - startRect.left); // rechnet den winkel der linie aus
  
    const line = document.createElement('div'); // erzeugt ein div und stylet die linie
    line.style.position = 'absolute';
    line.style.width = `${lineLength}px`;
    line.style.height = `${lineWidth}px`;
    line.style.backgroundColor = lineColor;
    line.style.top = `${startRect.top + startRect.height / 2 - lineWidth / 2 - contentRect.top}px`;
    line.style.left = `${startRect.left + startRect.width / 2 - contentRect.left}px`;
    line.style.transform = `rotate(${lineAngle}rad)`;
    line.style.transformOrigin = `top left`;
    document.getElementById('content').appendChild(line); // der linien div wird in den container eingefügt
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

function chooseWinner(a, b, c) { // funktion die abfragt wer gewonnen hat. wenn die parameter circle sind hat der Spieler gewonnen. Wenn cross dann der PC
    let overlayText = document.getElementById("overlay_Text");
    if (fields[a] && fields[b] && fields[c] === 'circle') {
        overlayText.innerHTML = "Winner!";
    } else if (fields[a] && fields[b] && fields[c] === 'cross') {
        overlayText.innerHTML = "Loose!";
    }
}

function currentPlayerIndicator() { // zeigt im HTML an wer gerade dran ist. Wenn Cross soll circle abdunken und anders herum 
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
    let emptyFields = fields
        .map((value, idx) => (value === null ? idx : null)) // map geht durch das fields array. Value=Wert(corss,circle oder null) im array, idx=Index / If abfrage ist der wert=null? dann push den index in das neue Array. Wenn nicht push null in das neue Array
        .filter(newValue => newValue !== null); // filter entfernt alle null aus den neun array damit nur noch die indexes der freien felder da sind / newValue = wert im neuen array (index oder null) if abfrage newValue ist NICHT null / wenn true bleibt es im array wenn false dann raus schmeißen
    let bestMove = null;
    // 1. Prüfe, ob Cross gewinnen kann
    for (let combination of winningCombinations) { // for schleife durch gewinnCombinationen in die variable combination gespeichert
        let [a, b, c] = combination;                // beispile a=index0 b=index1 c=index3
        let values = [fields[a], fields[b], fields[c]]; // ein array in dem die combination gespeichert ist
        if (values.filter(v => v === 'cross').length === 2 && values.includes(null)) { // filtert dieses array wie viele cross in dem array sind wenn 2 crosses gefiltert sind && im value ein Null ist dann wäre das der bestmove
            bestMove = combination.find(idx => fields[idx] === null); // die combination in der die if abfrage true ist die gewinn combination / mit find suchen wir dann im combination array nach dem index der null ist. Der index ist dann best move
            break; // Sobald ein Gewinnzug gefunden wurde, beenden
        }
    }
    // 2. Falls kein Gewinnzug für Cross vorhanden ist, blockiere Circle
    if (bestMove === null) {    // das selbe wie oben nur anstatt cross circle
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

function checkGameOver() { // funktion die abfragt ob noch freier platz im array ist. Falls nicht overlay öffnen und spiel beenden
    let overlayText = document.getElementById("overlay_Text");
    if (!fields.includes(null)) { // abfrage ob im array ein null enthalten ist. Durch das ! dreht man die frage um
        openOverlay();
        overlayText.innerHTML = "Game Over!";
    } else return
}