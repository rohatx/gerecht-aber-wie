const container = document.getElementById("circle-container");
const message = document.getElementById("message");

const eingabeContainer = document.getElementById("eingabeContainer");
const keksEingabe = document.getElementById("keksEingabe");
const checkAntwortBtn = document.getElementById("checkAntwortBtn");
const buttonLeiste = document.getElementById("button-leiste");
const aufgabenStellung = document.getElementById("aufgabenstellung");
const gridWrapper = document.getElementById("grid-wrapper");
const toolbox = document.getElementById("toolbox");
const toolboxWrapper = document.getElementById("toolbox-grid-wrapper");
const collectRB = document.getElementById("collectRB");
const configbox = document.getElementById("config");

const checkVerteilungBtn = document.getElementById("checkVerteilungBtn");
const nameEingabe = document.getElementById("nameInput");
const newTaskBtn = document.getElementById("newTaskBtn");

const params = new URLSearchParams(window.location.search);

const grabCursor = "grab";
const knifeCursor = "url('img/knife.png') 12 12, auto";
const glueCursor = "url('img/glue.png') 12 12, auto";

let collectionClicks = 0;
let gleichmaessigkeitsfehler = 0;
let zaehlfehler = 0;
let isAdvanced = false;
let modus = "ausgleichen";

let personCount = 0;
let keksCount = 0;
let minAnzahlKekse = 1;
let maxAnzahlKekse = 20;

let kekseProPerson = 0;

const KEKSE_PRO_REIHE = 4;
const PLATZ_PRO_KEKS = 20;

let tellerKekseIds;

let currentTool = "move"; // Standard
let cookieImageNumber = keksCount;

window.addEventListener("load", () => {

    const twoPersonsImage = document.getElementById("two-persons").querySelector('img');;
    twoPersonsImage.src = getImageURL("--twoPersons-image");
    const threePersonsImage = document.getElementById("three-persons").querySelector('img');;
    threePersonsImage.src = getImageURL("--threePersons-image");
    const fourPersonsImage = document.getElementById("four-persons").querySelector('img');;
    fourPersonsImage.src = getImageURL("--fourPersons-image");
    const fivePersonsImage = document.getElementById("five-persons").querySelector('img');;
    fivePersonsImage.src = getImageURL("--fivePersons-image");
    const sixPersonsImage = document.getElementById("six-persons").querySelector('img');;
    sixPersonsImage.src = getImageURL("--sixPersons-image");

    const breakIMG = document.getElementById("breakIMG");
    breakIMG.src = getImageURL("--break-image");
    const mergeIMG = document.getElementById("mergeIMG");
    mergeIMG.src = getImageURL("--merge-image");
    const collectIMG = document.getElementById("collectIMG");
    collectIMG.src = getImageURL("--collect-image");

    document.getElementById("toolboxForm").reset();

    container.style.setProperty('cursor', grabCursor, 'important');

    const selectedToolRadio = document.querySelector(`input[name="tool"][value="${currentTool}"]`);
    if (selectedToolRadio) {
        selectedToolRadio.checked = true;
        selectedToolRadio.dispatchEvent(new Event("change"));
    }

    if (params.has("anzahl-kekse")) {
        const angaben = params.get("anzahl-kekse").split(",").map(str => str.trim());

        if (angaben.length == 2) {
            const min = parseFloat(angaben[0], 10);
            const max = parseFloat(angaben[1], 10);


            const istGueltig = !isNaN(min) && !isNaN(max) && Number.isInteger(min) && Number.isInteger(max) && min >= 1 && max >= min && max <= 20;

            if (istGueltig) {
                minAnzahlKekse = min;
                maxAnzahlKekse = max;
            } else {
                alert("Der Parameter \"anzahl-kekse\" enthält mindestens einen ungültigen Wert: Bitte ein gültiges Intervall *min,max* von ganzen Keksen angeben, wobei 1 ≤ min ≤ max ≤ 20. Es wird nun mit dem Intervall [1,20] gearbeitet.");
            }
        } else {
            alert("Der Parameter \"anzahl-kekse\" enthält einen ungültigen Wert. Bitte zwei Zahlen wie *3,8* durch Komma getrennt angeben. Es wird nun mit dem Intervall [1,20] gearbeitet.");
        }
    }

    if (params.has("modus")) {
        modusInput = params.get("modus");
        if (modusInput === "ausgleichen" || modusInput === "verteilen" || modusInput === "ausgleichen-verteilen") {
            modus = modusInput;
        } else {
            alert("Der Parameter \"modus\" enthält einen ungültigen Wert: Bitte zwischen *ausgleichen*, *verteilen* und *ausgleichen-verteilen* wählen. Es wird nun mit *ausgleichen* gearbeitet.");
        }
    }

    mitHalbenKeksen = params.get("mit-halben-keksen");
    if (mitHalbenKeksen === "true") {
        //Modus mit halben Keksen
        isAdvanced = true;
        document.body.classList.add("isAdvanced");
        personCount = 4;
        const personenauswahl = document.getElementById("anzahlPersonen");
        const personenauswahlsub = document.getElementById("anzahlPersonenSubtitle");
        personenauswahl.style.display = "none";
        personenauswahlsub.style.display = "none";
        const imageButtons = document.querySelectorAll('.image-button');
        imageButtons.forEach(el => {
            el.style.display = 'none';
        });

        createNewTask();
    } else {
        //Modus mit ganzen Keksen
        const personenauswahl = document.getElementById("anzahlPersonen");
        const personenauswahlsub = document.getElementById("anzahlPersonenSubtitle");
        personenauswahl.style.display = "flex";
        personenauswahlsub.style.display = "block";

        const elements = document.getElementsByClassName("image-button");
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = "inline-block";
        }

        if (mitHalbenKeksen !== "false" && mitHalbenKeksen != null) {
            alert("Der Parameter \"mit-halben-keksen\" enthält einen ungültigen Wert. Bitte entweder *true* oder *false* angeben. Es wird nun mit ganzen Keksen gearbeitet.");
        }
    }
});


function kekseEinsammeln() {
    document.querySelectorAll('.keks, .half_keks').forEach(keks => {
        const zielTellerIndex = personCount; // letzte liste im Array ist die Dose
        tellerKekseIds[keks.dataset.tellerIndex] = tellerKekseIds[keks.dataset.tellerIndex].filter(id => id.localeCompare(keks.id) != 0);
        tellerKekseIds[zielTellerIndex].push(keks.id);
        keks.dataset.tellerIndex = zielTellerIndex;
        showCookies();
    });
    collectionClicks += 1
}


// Werkzeug-Auswahl
document.querySelectorAll('input[name="tool"]').forEach(radio => {
    radio.addEventListener('change', () => {
        currentTool = radio.value;
        if (currentTool === "move") {
            container.style.setProperty('cursor', grabCursor, 'important');
            document.querySelectorAll('.keks').forEach(keks => {
                if (keks.dataset.isWhole) {
                    keks.draggable = true;
                }
            });
            document.querySelectorAll('.half_keks').forEach(keks => {
                keks.draggable = true;
            });
        } else if (currentTool === "collect") {
            kekseEinsammeln();
            const moveRBInput = document.getElementById('moveRB').querySelector('input');
            moveRBInput.checked = true;
            moveRBInput.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            if (currentTool === "break") {
                container.style.cursor = knifeCursor;
            } else {
                container.style.cursor = glueCursor;
            }
            document.querySelectorAll('.keks').forEach(keks => {
                keks.draggable = false;
            });
            document.querySelectorAll('.half_keks').forEach(keks => {
                keks.draggable = false;
            });
        }
    });
});

function getImageURL(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).replace(/url\(["']?|["']?\)/g, '');
}


function createScene() {
    container.innerHTML = "";
    tellerKekseIds = [];
    collectionClicks = 0;
    gleichmaessigkeitsfehler = 0;
    zaehlfehler = 0;

    const radius = 300;
    for (let personIndex = 0; personIndex < personCount; personIndex++) {
        const angle = Math.PI * (personIndex / (personCount - 1));
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const person = document.createElement("div");

        const img = document.createElement("img");
        img.src = getImageURL(`--person${personIndex + 1}-image`);
        img.className = "person-img";

        const name = document.createElement("div");
        name.id = "name";
        name.textContent = getComputedStyle(document.documentElement).getPropertyValue(`--person${personIndex + 1}-name`);

        person.className = "person";
        person.style.left = `${x + 360 - 60}px`;
        person.style.top = `${500 - y - 200}px`;
        if (personCount == 2) {
            person.style.top = `${y}px`;
        }

        const teller = document.createElement("div");
        const tellerBild = document.createElement("img");
        const tellerImageURL = getImageURL("--plate-image");
        tellerBild.src = tellerImageURL;
        tellerBild.className = "tellerBild";
        teller.className = "teller";
        teller.id = `teller-${personIndex}`;

        tellerKekseIds[personIndex] = []

        teller.ondrop = handleDrop;
        teller.ondragover = (e) => e.preventDefault();

        person.appendChild(img);
        person.appendChild(teller);
        person.appendChild(name);
        teller.appendChild(tellerBild);
        container.appendChild(person);
    }

    const dose = document.createElement("div");
    dose.className = "dose";
    dose.id = `teller-${personCount}`;
    container.appendChild(dose);
    dose.ondrop = handleDrop;
    dose.ondragover = (e) => e.preventDefault();
    if (personCount == 2) {
        container.style.height = "200px";
        dose.style.top = "40px";
        if (!gridWrapper.classList.contains('twoPersonGrid')) {
            gridWrapper.classList.add('twoPersonGrid');
        }
    }
    else {
        container.style.height = "500px";
        dose.style.top = "340px";
        if (gridWrapper.classList.contains('twoPersonGrid')) {
            gridWrapper.classList.remove('twoPersonGrid');
        }
    }

    keksEingabe.disabled = false;
    checkAntwortBtn.disabled = false;
    newTaskBtn.style.display = "flex";
    aufgabenStellung.style.display = "flex";
    toolbox.style.display = "inline-block";
    configbox.style.display = "inline-block";
    checkVerteilungBtn.style.display = "inline-block";

    tellerKekseIds.push([]); // fuer die Dose

    if (modus === "ausgleichen-verteilen") {
        dose.style.display = "flex";
        collectRB.style.display = "flex";
        if (!toolboxWrapper.classList.contains('anotherTool')) {
            toolboxWrapper.classList.add('anotherTool');
        }
    }
    if (modus === "verteilen") {
        dose.style.display = 'flex';
        distributeKekse(true);
    } else {
        distributeKekse(false);
    }
    document.querySelectorAll("*").forEach(el => {
        el.setAttribute("draggable", "false");
    });
    document.querySelectorAll('.keks').forEach(keks => {
        if (keks.dataset.isWhole) {
            keks.draggable = true;
        }
    });
    document.querySelectorAll('.half_keks').forEach(keks => {
        keks.draggable = true;
    });
    if (gridWrapper.classList.contains('checkCount')) {
        gridWrapper.classList.remove('checkCount');
    }

    const moveRBInput = document.getElementById('moveRB').querySelector('input');
    moveRBInput.checked = true;
    moveRBInput.dispatchEvent(new Event('change', { bubbles: true }));
}

function distributeKekse(startOnTable) {
    do {
        tellerKekseIds.forEach((_, i) => tellerKekseIds[i] = []);
        for (let i = 0; i < keksCount; i++) {
            keksId = `keks-${i}`;
            let tellerIndex = tellerKekseIds.length - 1;
            if (!startOnTable) {
                tellerIndex = Math.floor(Math.random() * personCount);
            }
            tellerKekseIds[tellerIndex].push(keksId);
        }
    } while (!checkCookieDistribution(false) || checkVictory(false, false))

    for (let tellerIndex = 0; tellerIndex < personCount; tellerIndex++) {
        const teller = document.getElementById(`teller-${tellerIndex}`);
        for (let keksIndex = 0; keksIndex < 8; keksIndex++) {
            const keks_wrapper = document.createElement("div");
            keks_wrapper.className = "keks_wrapper";
            keks_wrapper.classList.add(`number-${keksIndex}`);

            const radius = 60;
            const centerX = 60;
            const centerY = 60;
            const angle = (2 * Math.PI / 8) * keksIndex - Math.PI / 2;
            keks_wrapper.style.left = `${centerX + (radius - 25) * Math.cos(angle) - 18}px`;
            keks_wrapper.style.top = `${centerY + (radius - 25) * Math.sin(angle) - 18}px`;

            teller.appendChild(keks_wrapper);
            if (keksIndex < tellerKekseIds[tellerIndex].length) {
                createKeks(keksIndex, tellerIndex);
            }
        }
    }
    const dose = document.getElementById(`teller-${personCount}`);
    for (let keksIndex = 0; keksIndex < 24; keksIndex++) {
        const keks_wrapper = document.createElement("div");
        keks_wrapper.className = "keks_wrapper";
        keks_wrapper.classList.add(`number-${keksIndex}`);

        keks_wrapper.style.left = `${(keksIndex % 6) * 40}px`;
        keks_wrapper.style.top = `${Math.floor(keksIndex / 6) * 40}px`;

        dose.appendChild(keks_wrapper);
        if (keksIndex < tellerKekseIds[tellerKekseIds.length - 1].length) {
            createKeks(keksIndex, tellerKekseIds.length - 1);
        }
    }
    showCookies();
}

function createKeks(keksIndex, tellerIndex, shouldBeHalf) {
    const keks = document.createElement("img");
    if (shouldBeHalf) {
        keks.src = getImageURL("--cookieHalfRight-image");
        keks.className = "half_keks";
        tellerKekseIds[tellerIndex].splice(keksIndex, 0, `keks-${cookieImageNumber}`);
        cookieImageNumber += 1;
    } else {
        keks.src = getImageURL("--cookie-image");
        keks.className = "keks";
    }
    keks.id = tellerKekseIds[tellerIndex][keksIndex];
    keks.draggable = true;
    keks.dataset.tellerIndex = tellerIndex;
    keks.dataset.isWhole = !shouldBeHalf;

    keks.addEventListener('click', (e) => {
        if (currentTool === 'move') {
            if (keks.classList.contains('markiert')) {
                keks.classList.remove('markiert');
            } else {
                keks.classList.add('markiert');
            }
        } else if (currentTool === 'break') {
            if (keks.dataset.isWhole === "false") {
                alert("Ein halber Keks kann nicht noch einmal gebrochen werden!");
            } else {
                const keksIndexNeu = tellerKekseIds[keks.dataset.tellerIndex].findIndex(keksId => keksId === keks.id);
                createKeks(keksIndexNeu + 1, keks.dataset.tellerIndex, true);
                keks.dataset.isWhole = false;
                keks.src = getImageURL("--cookieHalfLeft-image");
                keks.className = "half_keks";
                showCookies();
            }
        } else if (currentTool === 'merge') {
            if (keks.dataset.isWhole === "false") {
                const cookieWrapper = keks.parentElement;
                const otherHalf = Array.from(cookieWrapper.children).find(cookieHalf => cookieHalf !== keks);
                const otherHalfIndex = tellerKekseIds[keks.dataset.tellerIndex].findIndex(keksId => keksId === otherHalf.id);
                tellerKekseIds[keks.dataset.tellerIndex].splice(otherHalfIndex, 1);
                cookieWrapper.removeChild(otherHalf);
                keks.dataset.isWhole = true;
                keks.src = `img/cookie.png`;
                keks.className = "keks";
                keks.style.left = '0px';
                keks.style.top = '0px';
                showCookies();
            }
        }
    });

    // Drag Start
    keks.addEventListener('dragstart', (e) => {
        if (currentTool === 'move') {
            e.dataTransfer.setData("text/plain", JSON.stringify({
                id: keks.id,
                from: keks.dataset.tellerIndex
            }));
        }


    });

    const keks_wrapper = document.getElementById(`teller-${tellerIndex}`).querySelector(`.number-${keksIndex}`);
    keks_wrapper.appendChild(keks);
}

function handleDrop(e) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const movingKeksId = data.id;
    const startTellerIndex = data.from;
    const zielTellerIndex = parseInt(e.currentTarget.id.split("-")[1], 10);
    if (startTellerIndex == zielTellerIndex) return;

    const movingKeks = document.getElementById(movingKeksId);
    const fromTeller = document.getElementById(`teller-${startTellerIndex}`);
    const toTeller = e.currentTarget;

    markedCookies = document.querySelectorAll('.keks.markiert, .half_keks.markiert');
    if (markedCookies.length > 1) {
        for (let i = 0; i < markedCookies.length; i++) {
            currentCookie = markedCookies[i];
            tellerKekseIds[currentCookie.dataset.tellerIndex] = tellerKekseIds[currentCookie.dataset.tellerIndex].filter(id => id.localeCompare(currentCookie.id) != 0);
            tellerKekseIds[zielTellerIndex].push(currentCookie.id);
            if (checkCookieDistribution(true)) {
                currentCookie.dataset.tellerIndex = zielTellerIndex;
                currentCookie.classList.remove('markiert');
                showCookies()
            } else {
                tellerKekseIds[zielTellerIndex] = tellerKekseIds[zielTellerIndex].filter(id => id.localeCompare(currentCookie.id) != 0);
                tellerKekseIds[currentCookie.dataset.tellerIndex].push(currentCookie.id);
                if (i == 0) {
                    alert("Der Zielteller ist schon voll!");
                } else {
                    alert("Es können nicht alle Kekse auf diesen Teller verschoben werden");
                }
                return;
            }
        }
    } else {
        tellerKekseIds[startTellerIndex] = tellerKekseIds[startTellerIndex].filter(id => id.localeCompare(movingKeksId) != 0);
        tellerKekseIds[zielTellerIndex].push(movingKeksId);
        if (checkCookieDistribution(true)) {
            movingKeks.dataset.tellerIndex = zielTellerIndex;
            showCookies()
        } else {
            tellerKekseIds[zielTellerIndex] = tellerKekseIds[zielTellerIndex].filter(id => id.localeCompare(movingKeksId) != 0);
            tellerKekseIds[startTellerIndex].push(movingKeksId);
            alert("Der Zielteller ist schon voll!");

        }
    }

    hideEvaluation();
}

function checkVictory(withMessage, withHalfCookies) {
    const counts = calculateCookieCounts(withHalfCookies);
    const allEqual = counts.slice(0, -1).every(count => count == counts[0]);
    const sum = counts.slice(0, -1).reduce((acc, value) => acc + value, 0);
    if (allEqual && sum == keksCount) {
        if (withMessage) {
            eingabeContainer.style.display = "block";
            document.querySelectorAll('.keks').forEach(keks => {
                if (keks.dataset.isWhole) {
                    keks.draggable = false;
                }
            });
            document.querySelectorAll('.half_keks').forEach(keks => {
                keks.draggable = false;
            });
            const gridWrapper = document.getElementById("grid-wrapper");
            if (!gridWrapper.classList.contains('checkCount')) {
                gridWrapper.classList.add('checkCount');
            }
        }
        return true;
    } else {
        if (withMessage) {
            if (!allEqual) {
                let personAindex = null;
                let personBindex = null;

                for (let i = 0; i < counts.length - 1; i++) {
                    for (let j = i + 1; j < counts.length - 1; j++) {
                        if (counts[i] !== counts[j]) {
                            personAindex = i;
                            personBindex = j;
                        }
                    }
                }

                let name1, name2;
                let kekszahl1, kekszahl2;

                name1 = namen[personAindex];
                name2 = namen[personBindex];

                if (counts[personAindex] === 1) kekszahl1 = "1 Keks";
                else kekszahl1 = `${counts[personAindex]} Kekse`;

                if (counts[personBindex] === 1) kekszahl2 = "1 Keks";
                else kekszahl2 = `${counts[personBindex]} Kekse`;

                message.textContent = `Leider falsch. Du solltest die Kekse gerecht verteilen. ${name1} hat ${kekszahl1} und ${name2} hat ${kekszahl2}. Das ist nicht gerecht. Versuche es noch einmal.`;
            } else {
                message.textContent = `Leider falsch. Du solltest alle Kekse gerecht verteilen. Aktuell liegen noch Kekse auf dem Tisch. Versuche es noch einmal.`;
            }
            gleichmaessigkeitsfehler += 1;
            message.style.display = "block";
            message.style.color = "var(--messageWrong-font-color)";
            message.style.border = "0.15rem solid var(--messageWrong-border-color)";
        }
        return false;
    }
}

function sendData() {
    const name = nameEingabe.value.trim();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('mode', modus);
    formData.append('withHalf', isAdvanced);
    formData.append('gFehler', gleichmaessigkeitsfehler);
    formData.append('zFehler', zaehlfehler);
    formData.append('collectionClicks', collectionClicks);

    fetch('writeData.php', {
        method: 'POST',
        body: formData
    }).then(r => r.text())
        .then(console.log)
        .catch(console.error);
}

checkVerteilungBtn.onclick = () => {
    checkVictory(true, true);
};

checkAntwortBtn.onclick = () => {
    const eingabe = parseFloat(keksEingabe.value);
    if (eingabe == kekseProPerson) {
        message.style.display = "block";
        message.style.color = "var(--messageRight-font-color)";
        message.style.border = "0.15rem solid var(--messageRight-border-color)";
        message.textContent = "Aufgabe gelöst!";
        keksEingabe.disabled = true;
        checkAntwortBtn.disabled = true;
        sendData();
    } else {
        message.style.display = "block";
        message.style.color = "var(--messageWrong-font-color)";
        message.style.border = "0.15rem solid var(--messageWrong-border-color)";
        message.textContent = "Leider falsch. Schau es dir nochmal an.";
        zaehlfehler += 1;
    }
};

function showCookies() {
    const gespeicherteKekse = [];
    for (let keksIndex = 0; keksIndex < cookieImageNumber; keksIndex++) {
        const keks = document.getElementById(`keks-${keksIndex}`);
        if (keks != null) {
            gespeicherteKekse.push(keks);     // Speichere Referenz
            keks.remove();
        }
    }
    for (let tellerIndex = 0; tellerIndex < tellerKekseIds.length; tellerIndex++) {
        for (let keksIndex = 0; keksIndex < tellerKekseIds[tellerIndex].length; keksIndex++) {
            const keks = gespeicherteKekse.find(keks => keks.id === tellerKekseIds[tellerIndex][keksIndex]);
            for (let positionIndex = 0; positionIndex < tellerKekseIds[tellerIndex].length; positionIndex++) {
                const keks_wrapper = document.getElementById(`teller-${tellerIndex}`).querySelector(`.number-${positionIndex}`);
                const keks_wrapper_children = keks_wrapper.children;
                if (keks_wrapper_children.length == 0) {
                    if (keks.dataset.isWhole === "false") {
                        keks.src = `img/cookie_left.png`;
                        keks.style.left = '-4px';
                    }
                    keks_wrapper.appendChild(keks);
                    break;
                } else if (keks_wrapper_children.length == 1 && keks_wrapper_children[0].dataset.isWhole === "false" && keks.dataset.isWhole === "false") {
                    keks.src = `img/cookie_right.png`;
                    keks_wrapper.appendChild(keks);
                    keks.style.left = '14px';
                    keks.style.top = '2px';
                    break;
                }
            }
        }
    }
}

function checkCookieDistribution(withHalfCookies) {
    const counts = calculateCookieCounts(withHalfCookies);
    if (counts.slice(0, -1).some(count => count > 8)) {
        return false;
    }
    return true;
}

function calculateCookieCounts(withHalfCookies) {
    let counts = []
    if (withHalfCookies) {
        for (let tellerIndex = 0; tellerIndex < tellerKekseIds.length; tellerIndex++) {
            sum = 0;
            for (let keksIndex = 0; keksIndex < tellerKekseIds[tellerIndex].length; keksIndex++) {
                const keksId = tellerKekseIds[tellerIndex][keksIndex];
                const keks = document.getElementById(keksId);
                if (keks.dataset.isWhole === "true") {
                    sum += 1;
                } else {
                    sum += 0.5;
                }
            }
            counts.push(sum);
        }
    } else {
        counts = tellerKekseIds.map(teller => teller.length);
    }
    return counts;
}

function hideEvaluation() {
    message.style.display = "none";
    eingabeContainer.style.display = "none";
    keksEingabe.value = "";
}

function determineCookieMultiplikator() {
    let minKekseMultiplikator = 0;
    let maxKekseMultiplikator = 0;
    if (isAdvanced) {
        for (let totalCookies = minAnzahlKekse; totalCookies <= maxAnzahlKekse; totalCookies++) {
            let perPerson = totalCookies / personCount;
            if (Number.isInteger(perPerson * 2)) {
                if (minKekseMultiplikator == 0 || perPerson < minKekseMultiplikator) minKekseMultiplikator = perPerson;
                if (maxKekseMultiplikator == 0 || perPerson > maxKekseMultiplikator) maxKekseMultiplikator = perPerson;
            }
        }
        if (minKekseMultiplikator == 0 && maxKekseMultiplikator == 0) {
            if (params.has("anzahl-kekse")) {
                alert(`Für die vorhandene Personenzahl ist keine passende Keksanzahl in dem Intervall vorhanden. Das Intervall wird auf [${personCount * 0.5}, ${Math.min(personCount * 7.5, 20)}] gesetzt.`);
            }
            minKekseMultiplikator = 0.5;
            maxKekseMultiplikator = Math.min(7.5, Math.floor(20 * 2 / personCount) / 2)
        }
        if (minKekseMultiplikator == 0) {
            if (params.has("anzahl-kekse")) {
                alert(`Für die vorhandene Personenzahl sind zu wenig Kekse vorgegeben. Die minimale Anzahl wird auf ${personCount * 0.5} gesetzt.`);
            }
            minKekseMultiplikator = Math.max(minKekseMultiplikator, 0.5);
            maxKekseMultiplikator = Math.max(maxKekseMultiplikator, 0.5);
        }
        if (maxKekseMultiplikator > 7.5) {
            if (params.has("anzahl-kekse")) {
                alert(`Für die vorhandene Personenzahl sind zu viele Kekse vorgegeben. Die maximale Anzahl wird auf ${Math.min(personCount * 7.5, 20)} gesetzt.`);
            }
            minKekseMultiplikator = Math.min(minKekseMultiplikator, 7.5);
            maxKekseMultiplikator = Math.min(maxKekseMultiplikator, 7.5);
        }
        return Math.floor(Math.random() * ((maxKekseMultiplikator - minKekseMultiplikator) * 2 + 1)) / 2 + minKekseMultiplikator;
    }
    for (let totalCookies = minAnzahlKekse; totalCookies <= maxAnzahlKekse; totalCookies++) {
        let perPerson = totalCookies / personCount;
        if (Number.isInteger(perPerson)) {
            if (minKekseMultiplikator == 0 || perPerson < minKekseMultiplikator) minKekseMultiplikator = perPerson;
            if (maxKekseMultiplikator == 0 || perPerson > maxKekseMultiplikator) maxKekseMultiplikator = perPerson;
        }
    }
    if (minKekseMultiplikator == 0 && maxKekseMultiplikator == 0) {
        if (params.has("anzahl-kekse")) {
            alert(`Fuer die vorhandene Personenzahl ist keine passende Keksanzahl in dem Intervall vorhanden. Das Intervall wird auf [${personCount * 1}, ${Math.min(personCount * 7, 20)}] gesetzt.`);
        }
        minKekseMultiplikator = 1;
        maxKekseMultiplikator = Math.min(7, Math.floor(20 / personCount));
    }
    if (minKekseMultiplikator == 0) {
        if (params.has("anzahl-kekse")) {
            alert(`Fuer die vorhandene Personenzahl sind zu wenig Kekse vorgegeben. Die minimale Anzahl wird auf ${personCount * 1} gesetzt.`);
        }
        minKekseMultiplikator = Math.max(minKekseMultiplikator, 1);
        maxKekseMultiplikator = Math.max(maxKekseMultiplikator, 1);
    }
    if (maxKekseMultiplikator > 7) {
        if (params.has("anzahl-kekse")) {
            alert(`Fuer die vorhandene Personenzahl sind zu viele Kekse vorgegeben. Die maximale Anzahl wird auf ${Math.min(personCount * 7, 20)} gesetzt.`);
        }
        minKekseMultiplikator = Math.min(minKekseMultiplikator, 7);
        maxKekseMultiplikator = Math.min(maxKekseMultiplikator, 7);
    }
    return Math.floor(Math.random() * (maxKekseMultiplikator - minKekseMultiplikator + 1)) + minKekseMultiplikator;
}

function changePerson(geklickterButton, i) {
    personCount = i;

    const buttons = document.querySelectorAll('.image-button');
    buttons.forEach(button => {
        if (button === geklickterButton) {
            button.classList.remove('inactive');
        } else {
            button.classList.add('inactive');
        }
    });
    createNewTask();
}

function createNewTask() {
    const keksMultiplikator = determineCookieMultiplikator();
    keksCount = Math.floor(personCount * keksMultiplikator);
    kekseProPerson = keksCount / personCount
    cookieImageNumber = keksCount;
    hideEvaluation();
    createScene();
}