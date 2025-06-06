const container = document.getElementById("circle-container");
const message = document.getElementById("message");

const eingabeContainer = document.getElementById("eingabeContainer");
const keksEingabe = document.getElementById("keksEingabe");
const checkAntwortBtn = document.getElementById("checkAntwortBtn");
const buttonLeiste = document.getElementById("button-leiste");
const aufgabenStellung = document.getElementById("aufgabenstellung");

let personCount = 0;
let keksCount = personCount * randKeksMultiplikator();

let kekseProPerson = keksCount / personCount

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
        const tellerBild = document.createElement("img");
        tellerBild.src = `img/teller.png`;
        tellerBild.className = "tellerBild";
        teller.className = "teller";
        teller.id = `teller-${personIndex}`;

        tellerKekseIds[personIndex] = []

        teller.ondrop = handleDrop;
        teller.ondragover = (e) => e.preventDefault();

        person.appendChild(img);
        person.appendChild(teller);
        teller.appendChild(tellerBild);
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
    const keks = document.createElement("img");
    keks.src = `img/cookie.png`;
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
        message.style.display = "block";
        message.style.color = "#2e8b57";
        message.style.border = "2px solid #3cb371";
        message.textContent = "Aufgabe gelöst!";
    } else {
        message.style.display = "block";
        message.style.color = "red";
        message.style.border = "2px solid rgb(199, 12, 12)";
        message.textContent = "Leider falsch. Versuche es nochmal";
    }
};

function hideAverageInput() {
    eingabeContainer.style.display = "none";
    keksEingabe.value = "";
}

function randKeksMultiplikator(){
    return Math.floor(Math.random() * 4 + 1);
}

function changePerson(geklickterButton, i){
    personCount = i;
    keksCount = personCount * randKeksMultiplikator();
    kekseProPerson = keksCount / personCount
    message.style.display = "none";
    aufgabenStellung.style.display = "inline-block";

    const buttons = document.querySelectorAll('.image-button');
      buttons.forEach(button => {
        if (button === geklickterButton) {
          button.classList.remove('inactive');
        } else {
          button.classList.add('inactive');
        }
    });
    createScene();
}