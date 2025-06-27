const container = document.getElementById("circle-container");
const message = document.getElementById("message");

const eingabeContainer = document.getElementById("eingabeContainer");
const keksEingabe = document.getElementById("keksEingabe");
const checkAntwortBtn = document.getElementById("checkAntwortBtn");
const buttonLeiste = document.getElementById("button-leiste");
const aufgabenStellung = document.getElementById("aufgabenstellung");
const toolbox = document.getElementById("toolbox");
const configbox = document.getElementById("config");

const checkVerteilungBtn = document.getElementById("checkVerteilungBtn");
const nameEingabe = document.getElementById("nameInput");

const scriptUrl = 'https://script.google.com/macros/s/AKfycbwnnInHSxcvNn7ykgIEQmmUMe8mgxFF_fpMLri3Qfby8aLSVMLFBTycdu3mpOL2wqwG/exec';
async function sendData() {
    const name = nameEingabe.value;
    const res = await fetch(scriptUrl + `?name=${encodeURIComponent(name)}&count=${collectionClicks}&isAdvanced=${isAdvanced}`, {
        method: 'POST'
    });
}

const params = new URLSearchParams(window.location.search);

let collectionClicks = 0;
let isAdvanced;
let keksEinsammelnMoglich;

let personCount = 0;
let keksCount = 0;

let kekseProPerson = 0;

const KEKSE_PRO_REIHE = 4;
const PLATZ_PRO_KEKS = 20;

let tellerKekseIds;

let currentTool = "move"; // Standard
let cookieImageNumber = keksCount;

window.addEventListener("load", () => {
    document.getElementById("toolboxForm").reset();

    document.querySelectorAll("*").forEach(el => {
        el.setAttribute("draggable", "false");
    });
    document.body.style.cursor = 'grab';
});


// Werkzeug-Auswahl
document.querySelectorAll('input[name="tool"]').forEach(radio => {
    radio.addEventListener('change', () => {
        currentTool = radio.value;
        if (currentTool === "move") {
            document.body.style.cursor = 'grab';
            document.querySelectorAll('.keks').forEach(keks => {
                if (keks.dataset.isWhole) {
                    keks.draggable = true;
                }
            });
            document.querySelectorAll('.half_keks').forEach(keks => {
                keks.draggable = true;
            });
        } else {
            if (currentTool === "select") {
                document.body.style.cursor = 'pointer';
            } else {
                document.body.style.cursor = 'cell';
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


function createScene() {
    keksEinsammelnMoglich = params.get("kekse-sammeln");
    isAdvanced = params.get("halbe-kekse");

    container.innerHTML = "";
    tellerKekseIds = [];
    collectionClicks = 0;

    const radius = 300;
    for (let personIndex = 0; personIndex < personCount; personIndex++) {
        const angle = Math.PI * (personIndex / (personCount - 1));
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const person = document.createElement("div");

        const img = document.createElement("img");
        img.src = `img/person${personIndex + 1}.png`;
        img.className = "person-img";

        person.className = "person";
        person.style.left = `${x + 360 - 60}px`;
        person.style.top = `${150 - y}px`;

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

    const dose = document.createElement("div");
    dose.className = "dose";
    dose.id = `teller-${personCount}`;
    container.appendChild(dose);
    dose.ondrop = handleDrop;
    dose.ondragover = (e) => e.preventDefault();

    const einsammelButton = document.createElement("button");
    // einsammelButton.className = "dose";
    einsammelButton.id = "einsammelButton";
    einsammelButton.textContent = "Kekse einsammeln"
    einsammelButton.onclick = function () {
        document.querySelectorAll('.keks, .half_keks').forEach(keks => {
            const zielTellerIndex = personCount; // letzte liste im Array ist die Dose
            tellerKekseIds[keks.dataset.tellerIndex] = tellerKekseIds[keks.dataset.tellerIndex].filter(id => id.localeCompare(keks.id) != 0);
            tellerKekseIds[zielTellerIndex].push(keks.id);
            keks.dataset.tellerIndex = zielTellerIndex;
            showCookies();
        });
        collectionClicks += 1
    };
    container.appendChild(einsammelButton);
    if (keksEinsammelnMoglich != null) {
        dose.style.display = 'flex';
        einsammelButton.style.display = 'flex';
    }
    einsammelButton.disabled = false;
    keksEingabe.disabled = false;
    checkAntwortBtn.disabled = false;

    tellerKekseIds.push([]); // fuer die Dose

    if (keksEinsammelnMoglich != null)
    {
        const dose = document.getElementsByClassName("dose")[0];
        const einsammelButton = document.getElementById("einsammelButton");
        if (dose != null) {
                dose.style.display = 'flex';
                einsammelButton.style.display = 'flex';
        }
    }

    distributeKekse();
    document.querySelectorAll('.keks').forEach(keks => {
        if (keks.dataset.isWhole) {
            keks.draggable = true;
        }
    });
    document.querySelectorAll('.half_keks').forEach(keks => {
        keks.draggable = true;
    });
}

function distributeKekse() {
    do {
        tellerKekseIds.forEach((_, i) => tellerKekseIds[i] = []);
        for (let i = 0; i < keksCount; i++) {
            keksId = `keks-${i}`;
            const tellerIndex = Math.floor(Math.random() * personCount);
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
    }
    showCookies();
}

function createKeks(keksIndex, tellerIndex, shouldBeHalf) {
    const keks = document.createElement("img");
    if (shouldBeHalf) {
        keks.src = `img/cookie_right.png`;
        keks.className = "half_keks";
        tellerKekseIds[tellerIndex].splice(keksIndex, 0, `keks-${cookieImageNumber}`);
        cookieImageNumber += 1;
    } else {
        keks.src = `img/cookie.png`;
        keks.className = "keks";
    }
    keks.id = tellerKekseIds[tellerIndex][keksIndex];
    keks.draggable = true;
    keks.dataset.tellerIndex = tellerIndex;
    keks.dataset.isWhole = !shouldBeHalf;

    keks.addEventListener('click', (e) => {
        if (currentTool === 'select') {
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
                keks.src = `img/cookie_left.png`;
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
    if (markedCookies.length > 0) {
        markedCookies.forEach(keks => {
            tellerKekseIds[keks.dataset.tellerIndex] = tellerKekseIds[keks.dataset.tellerIndex].filter(id => id.localeCompare(keks.id) != 0);
            tellerKekseIds[zielTellerIndex].push(keks.id);
            if (checkCookieDistribution(true)) {
                keks.dataset.tellerIndex = zielTellerIndex;
                keks.classList.remove('markiert');
                showCookies()
            } else {
                tellerKekseIds[zielTellerIndex] = tellerKekseIds[zielTellerIndex].filter(id => id.localeCompare(keks.id) != 0);
                tellerKekseIds[keks.dataset.tellerIndex].push(keks.id);
                alert("Es können nicht alle Kekse auf diesen Teller verschoben werden");
                return;
            }
        });
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
            document.getElementById("einsammelButton").disabled = true;
            document.querySelectorAll('.keks').forEach(keks => {
                if (keks.dataset.isWhole) {
                    keks.draggable = false;
                }
            });
            document.querySelectorAll('.half_keks').forEach(keks => {
                keks.draggable = false;
            });
        }
        return true;
    } else {
        if (withMessage) {
            message.style.display = "block";
            message.style.color = "red";
            message.style.border = "2px solid rgb(199, 12, 12)";
            message.textContent = "Leider falsch. Versuche es nochmal";
        }
        return false;
    }
}

checkVerteilungBtn.onclick = () => {
    checkVictory(true, true);
};

checkAntwortBtn.onclick = () => {
    const eingabe = parseFloat(keksEingabe.value);
    if (eingabe == kekseProPerson) {
        message.style.display = "block";
        message.style.color = "#2e8b57";
        message.style.border = "2px solid #3cb371";
        message.textContent = "Aufgabe gelöst!";
        keksEingabe.disabled = true;
        checkAntwortBtn.disabled = true;
        sendData();
    } else {
        message.style.display = "block";
        message.style.color = "red";
        message.style.border = "2px solid rgb(199, 12, 12)";
        message.textContent = "Leider falsch. Versuche es nochmal";
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

function randKeksMultiplikator() {
    if (isAdvanced !== null && (personCount % 2 == 0)) {
        return Math.floor(Math.random() * 8 + 1) / 2;
    }
    return Math.floor(Math.random() * 4 + 1);
}

function changePerson(geklickterButton, i) {
    personCount = i;
    keksCount = Math.floor(personCount * randKeksMultiplikator());
    kekseProPerson = keksCount / personCount
    cookieImageNumber = keksCount;
    hideEvaluation();
    aufgabenStellung.style.display = "inline-block";
    toolbox.style.display = "inline-block";
    configbox.style.display = "inline-block";
    checkVerteilungBtn.style.display = "inline-block";

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