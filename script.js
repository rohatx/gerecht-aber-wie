const personenSlider = document.getElementById("personenSlider");
//const keksSlider = document.getElementById("keksSlider");
const personenAnzahlAnzeige = document.getElementById("personenAnzahlAnzeige");
const keksAnzahlAnzeige = document.getElementById("keksAnzahlAnzeige");


const container = document.getElementById("circle-container");
const message = document.getElementById("message");

const eingabeContainer = document.getElementById("eingabeContainer");
const keksEingabe = document.getElementById("keksEingabe");
const checkAntwortBtn = document.getElementById("checkAntwortBtn");
const antwortFeedback = document.getElementById("antwortFeedback");

let personCount = parseInt(personenSlider.value);
// let keksCount = parseInt(keksSlider.value);
let randomKeksMultiplicator = Math.floor(Math.random() * 4 + 1);
let keksCount = personCount * randomKeksMultiplicator;
personenAnzahlAnzeige.textContent = personCount;
keksAnzahlAnzeige.textContent = keksCount;
let kekseProPerson = keksCount / personCount

personenSlider.addEventListener("input", () => {
    personCount = parseInt(personenSlider.value);
    randomKeksMultiplicator = Math.floor(Math.random() * 4 + 1);
    keksCount = personCount * randomKeksMultiplicator;
    kekseProPerson = keksCount / personCount
    personenAnzahlAnzeige.textContent = personCount;
    keksAnzahlAnzeige.textContent = keksCount;
    createScene();
});

// keksSlider.addEventListener("input", () => {
//     keksCount = parseInt(keksSlider.value);
//     kekseProPerson = keksCount / personCount
//     keksAnzahlAnzeige.textContent = keksCount;
//     createScene();
// });

const KEKSE_PRO_REIHE = 4;
const PLATZ_PRO_KEKS = 20;

let tellerKekseIds;

function createScene() {
    container.innerHTML = "";
    tellerKekseIds = [];

    const radius = 250;
    for (let personIndex = 0; personIndex < personCount; personIndex++) {
        const angle = Math.PI * (personIndex / (personCount - 1));
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const person = document.createElement("div");

        const img = document.createElement("img");
        img.src = `img/person${personIndex + 1}.png`;
        img.className = "person-img";

        person.className = "person";
        person.style.left = `${x + 300 - 20}px`;
        person.style.top = `${150 - y - 20}px`;

        const teller = document.createElement("div");
        teller.className = "teller";
        teller.id = `teller-${personIndex}`;

        tellerKekseIds[personIndex] = []

        teller.ondrop = handleDrop;
        teller.ondragover = (e) => e.preventDefault();

        person.appendChild(img);
        person.appendChild(teller);
        container.appendChild(person);
    }

    distributeKekse();
}

function distributeKekse() {
    do {
        tellerKekseIds.forEach((_, i) => tellerKekseIds[i] = []);
        for (let i = 0; i < keksCount; i++) {
            keksId = `keks-${i}`;
            const tellerIndex = Math.floor(Math.random() * personCount);
            tellerKekseIds[tellerIndex].push(keksId);
        }
    } while (checkVictory(false))

    for (let tellerIndex = 0; tellerIndex < personCount; tellerIndex++) {
        for (let keksIndex = 0; keksIndex < tellerKekseIds[tellerIndex].length; keksIndex++) {
            createKeks(keksIndex, tellerIndex);
        }
    }
}

function createKeks(keksIndex, tellerIndex) {
    const teller = document.getElementById(`teller-${tellerIndex}`);
    const keks = document.createElement("div");
    keks.className = "keks";
    keks.id = tellerKekseIds[tellerIndex][keksIndex];
    keks.draggable = true;
    keks.dataset.tellerIndex = tellerIndex

    keks.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({
            id: keks.id,
            from: keks.dataset.tellerIndex
        }));
    };

    keks.style.left = `${(keksIndex % KEKSE_PRO_REIHE) * PLATZ_PRO_KEKS}px`;
    keks.style.top = `${Math.floor(keksIndex / KEKSE_PRO_REIHE) * PLATZ_PRO_KEKS}px`;

    teller.appendChild(keks);
}

function handleDrop(e) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const movingKeksId = data.id;
    const startTellerIndex = data.from;
    const zielTellerIndex = parseInt(e.currentTarget.id.split("-")[1], 10);
    console.log(startTellerIndex);
    console.log(zielTellerIndex);

    if (startTellerIndex == zielTellerIndex) return;

    const movingKeks = document.getElementById(movingKeksId);
    const fromTeller = document.getElementById(`teller-${startTellerIndex}`);
    const toTeller = e.currentTarget;

    fromTeller.removeChild(movingKeks);
    tellerKekseIds[startTellerIndex] = tellerKekseIds[startTellerIndex].filter(id => id.localeCompare(movingKeksId) != 0);
    for (let keksIndex = 0; keksIndex < tellerKekseIds[startTellerIndex].length; keksIndex++) {
        const leftKeks = document.getElementById(tellerKekseIds[startTellerIndex][keksIndex]);
        leftKeks.style.left = `${(keksIndex % KEKSE_PRO_REIHE) * PLATZ_PRO_KEKS}px`;
        leftKeks.style.top = `${Math.floor(keksIndex / KEKSE_PRO_REIHE) * PLATZ_PRO_KEKS}px`;
    }

    movingKeks.style.left = `${(tellerKekseIds[zielTellerIndex].length % KEKSE_PRO_REIHE) * PLATZ_PRO_KEKS}px`;
    movingKeks.style.top = `${Math.floor(tellerKekseIds[zielTellerIndex].length / KEKSE_PRO_REIHE) * PLATZ_PRO_KEKS}px`;

    toTeller.appendChild(movingKeks);
    tellerKekseIds[zielTellerIndex].push(movingKeksId);
    movingKeks.dataset.tellerIndex = zielTellerIndex;
    console.log(tellerKekseIds);

    checkVictory(true);
}

function checkVictory(withMessage) {
    const counts = tellerKekseIds.map(teller => teller.length);
    const allEqual = counts.every(count => count == counts[0]);
    if (allEqual) {
        if (withMessage) {
            message.textContent = "Aufgabe gelöst!";
            eingabeContainer.style.display = "block";
        }
        return true;
    } else {
        message.textContent = "";
        hideAverageInput();
        return false;
    }
}

checkAntwortBtn.onclick = () => {
    const eingabe = parseInt(keksEingabe.value);
    if (eingabe == kekseProPerson) {
        antwortFeedback.textContent = "Richtig!";
        antwortFeedback.style.color = "green";
    } else {
        antwortFeedback.textContent = "Leider falsch. Versuche es nochmal.";
        antwortFeedback.style.color = "red";
    }
};

function hideAverageInput() {
    eingabeContainer.style.display = "none";
    keksEingabe.value = "";
    antwortFeedback.textContent = "";
}

createScene();
