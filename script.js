const circleContainer = document.getElementById("circleContainer");
const messageContainer = document.getElementById("messageContainer");
const message = document.getElementById("message");
const newTaskBtn = document.getElementById("newTaskBtn");;
const cookieNumberInputContainer = document.getElementById("cookieNumberInputContainer");
const cookieInput = document.getElementById("cookieInput");
const checkBtn = document.getElementById("checkBtn");
const gridWrapper = document.getElementById("gridWrapper");
const toolbox = document.getElementById("toolbox");
const toolboxWrapper = document.getElementById("toolboxGridWrapper");
const moveRB = document.getElementById("moveRB");
const breakRB = document.getElementById("breakRB");
const mergeRB = document.getElementById("mergeRB");
const collectRB = document.getElementById("collectRB");
const configbox = document.getElementById("config");
const personNumberButtons = document.querySelectorAll(".personNumberButton");

const imageURLs = {
    tableImage: getImageSRC("--tableImage"),
    plateImage: getImageSRC("--plateImage"),
    cookieImage: getImageSRC("--cookieImage"),
    cookieHalfLeftImage: getImageSRC("--cookieHalfLeftImage"),
    cookieHalfRightImage: getImageSRC("--cookieHalfRightImage"),
    twoPersonsImage: getImageSRC("--twoPersonsImage"),
    threePersonsImage: getImageSRC("--threePersonsImage"),
    fourPersonsImage: getImageSRC("--fourPersonsImage"),
    fivePersonsImage: getImageSRC("--fivePersonsImage"),
    sixPersonsImage: getImageSRC("--sixPersonsImage"),
    person1Image: getImageSRC("--person1Image"),
    person2Image: getImageSRC("--person2Image"),
    person3Image: getImageSRC("--person3Image"),
    person4Image: getImageSRC("--person4Image"),
    person5Image: getImageSRC("--person5Image"),
    person6Image: getImageSRC("--person6Image"),
    moveImage: getImageSRC("--moveImage"),
    breakImage: getImageSRC("--breakImage"),
    mergeImage: getImageSRC("--mergeImage"),
    collectImage: getImageSRC("--collectImage"),
    breakCursorImage: getImageSRC("--breakCursorImage"),
    mergeCursorImage: getImageSRC("--mergeCursorImage")
};

// Preload Images
Object.values(imageURLs).forEach(url => {
    const img = new Image();
    img.src = url;
});


const params = new URLSearchParams(window.location.search);

const grabCursor = "grab";
const knifeCursor = `url(${imageURLs["breakCursorImage"]}) 12 12, auto`;
const glueCursor = `url(${imageURLs["mergeCursorImage"]}) 16 12, auto`;

let collectionClicks = 0;
let equalityErrors = 0;
let countErrors = 0;
let isAdvanced = false;
let mode = "ausgleichen";

let personCount = 0;
let cookieCount = 0;
let minCookieNumber = 1;
let maxCookieNumber = 20;

let cookiesPerPerson = 0;

const COOKIES_PER_ROW = 6;
const PERSON_COUNT_ADVANCED_MODE = 4;
const MAX_COOKIE_NUMBER = 20;
const MAX_COOKIES_PER_PLATE = 8;
const MAX_COOKIES_ON_TABLE = 24;

let plateCookieIds;
let allCookiesOnTable = false;

let currentTool = "move";
let firstCollectionClickNeeded = false;
let cookieImageNumber = cookieCount;

window.addEventListener("load", () => {
    // load images
    const twoPersonsImage = document.getElementById("twoPersons").querySelector("img");
    twoPersonsImage.src = imageURLs["twoPersonsImage"];
    const threePersonsImage = document.getElementById("threePersons").querySelector("img");
    threePersonsImage.src = imageURLs["threePersonsImage"];
    const fourPersonsImage = document.getElementById("fourPersons").querySelector("img");
    fourPersonsImage.src = imageURLs["fourPersonsImage"];
    const fivePersonsImage = document.getElementById("fivePersons").querySelector("img");
    fivePersonsImage.src = imageURLs["fivePersonsImage"];
    const sixPersonsImage = document.getElementById("sixPersons").querySelector("img");
    sixPersonsImage.src = imageURLs["sixPersonsImage"];

    const moveIMG = document.getElementById("moveIMG");
    moveIMG.src = imageURLs["moveImage"];
    const breakIMG = document.getElementById("breakIMG");
    breakIMG.src = imageURLs["breakImage"];
    const mergeIMG = document.getElementById("mergeIMG");
    mergeIMG.src = imageURLs["mergeImage"];
    const collectIMG = document.getElementById("collectIMG");
    collectIMG.src = imageURLs["collectImage"];

    document.getElementById("toolboxForm").reset();

    circleContainer.style.cursor = grabCursor;

    const selectedToolRadio = document.querySelector(`input[name="tool"][value="${currentTool}"]`);
    if (selectedToolRadio) {
        selectedToolRadio.checked = true;
        selectedToolRadio.dispatchEvent(new Event("change"));
    }

    // Process the URL parameters
    if (params.has("anzahl-kekse")) {
        const cookieParams = params.get("anzahl-kekse").split(",").map(str => str.trim());

        if (cookieParams.length == 2) {
            const min = parseFloat(cookieParams[0], 10);
            const max = parseFloat(cookieParams[1], 10);


            const istValid = !isNaN(min) && !isNaN(max) && Number.isInteger(min) && Number.isInteger(max) && min >= 1 && max >= min && max <= MAX_COOKIE_NUMBER;

            if (istValid) {
                minCookieNumber = min;
                maxCookieNumber = max;
            } else {
                alert(`Der Parameter \"anzahl-kekse\" enthält mindestens einen ungültigen Wert: Bitte ein gültiges Intervall *min,max* von ganzen Keksen angeben, wobei 1 ≤ min ≤ max ≤ ${MAX_COOKIE_NUMBER}. Es wird nun mit dem Intervall [1,${MAX_COOKIE_NUMBER}] gearbeitet.`);
            }
        } else {
            alert(`Der Parameter \"anzahl-kekse\" enthält einen ungültigen Wert. Bitte zwei Zahlen wie *3,8* durch Komma getrennt angeben. Es wird nun mit dem Intervall [1,${MAX_COOKIE_NUMBER}] gearbeitet.`);
        }
    }

    if (params.has("modus")) {
        modeInput = params.get("modus");
        if (modeInput === "ausgleichen" || modeInput === "verteilen" || modeInput === "ausgleichen-verteilen") {
            mode = modeInput;
        } else {
            alert("Der Parameter \"mode\" enthält einen ungültigen Wert: Bitte zwischen *ausgleichen*, *verteilen* und *ausgleichen-verteilen* wählen. Es wird nun mit *ausgleichen* gearbeitet.");
        }
    }

    withHalfCookies = params.get("mit-halben-keksen");
    if (withHalfCookies === "true") {
        isAdvanced = true;
        document.body.classList.add("isAdvanced");
        personCount = PERSON_COUNT_ADVANCED_MODE;
        const personNumberHeadline = document.getElementById("personNumberTitle");
        personNumberHeadline.style.display = "none";

        // Hide the number of persons selection, as four persons are specified here.
        personNumberButtons.forEach(button => {
            button.style.display = "none";
        });

        createNewTask();
    } else {
        const personNumberHeadline = document.getElementById("personNumberTitle");
        personNumberHeadline.style.display = "block";

        personNumberButtons.forEach(button => {
            button.style.display = "inline-block";
        });

        if (withHalfCookies !== "false" && withHalfCookies != null) {
            alert("Der Parameter \"mit-halben-keksen\" enthält einen ungültigen Wert. Bitte entweder *true* oder *false* angeben. Es wird nun mit ganzen Keksen gearbeitet.");
        }
    }
});

// EventListener for the Toolbox
document.querySelectorAll("input[name='tool']").forEach(radio => {
    radio.addEventListener("change", () => {
        currentTool = radio.value;
        if (currentTool === "move") {
            circleContainer.style.cursor = grabCursor;
            document.querySelectorAll(".cookie").forEach(cookie => {
                if (cookie.dataset.isWhole) {
                    cookie.draggable = true;
                    cookie.removeEventListener("dragstart", suppressDragg);
                }
            });
            document.querySelectorAll(".halfCookie").forEach(cookie => {
                cookie.draggable = true;
                cookie.removeEventListener("dragstart", suppressDragg);
            });
        } else if (currentTool === "collect") {
            collectCookies();

            // After the first collection in distribution mode, everything should be activated.
            if (firstCollectionClickNeeded) {
                document.querySelectorAll(".cookie").forEach(cookie => {
                    cookie.draggable = true;
                    cookie.removeEventListener("dragstart", suppressDragg);
                });
                moveRB.querySelector("img").style.filter = "grayscale(0%)";
                moveRB.querySelector("input").disabled = false;
                moveRB.style.cursor = "pointer";
                breakRB.querySelector("img").style.filter = "grayscale(0%)";
                breakRB.querySelector("input").disabled = false;
                breakRB.style.cursor = "pointer";
                mergeRB.querySelector("img").style.filter = "grayscale(0%)";
                mergeRB.querySelector("input").disabled = false;
                mergeRB.style.cursor = "pointer";

                firstCollectionClickNeeded = false;
            }

            // When the cookies have been collected, the “move” tool should be selected.
            const moveRBInput = moveRB.querySelector("input");
            moveRBInput.checked = true;
            moveRBInput.dispatchEvent(new Event("change", { bubbles: true }));

            // As long as all the cookies are on the table, the collection function should be deactivated.
            allCookiesOnTable = true;
            collectRB.querySelector("img").style.filter = "grayscale(100%)";
            collectRB.querySelector("input").disabled = true;
            collectRB.style.cursor = "default";
        } else {
            if (currentTool === "break") {
                circleContainer.style.cursor = knifeCursor;
            } else {
                circleContainer.style.cursor = glueCursor;
            }
            document.querySelectorAll(".cookie").forEach(cookie => {
                cookie.draggable = false;
                cookie.addEventListener("dragstart", suppressDragg);
            });
            document.querySelectorAll(".halfCookie").forEach(cookie => {
                cookie.draggable = false;
                cookie.addEventListener("dragstart", suppressDragg);
            });
        }
    });
});

/**
 * Reads the URL of the CSS variable and outputs the corresponding path.
 *
 * @param {String} variableName - The name of the CSS variable
 * @returns {String} The path to the picture
 */
function getImageSRC(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).replace(/url\(["']?|["']?\)/g, '');
}

/**
 * Builds the WebApp user interface.
 */
function createScene() {
    circleContainer.innerHTML = "";
    plateCookieIds = [];
    collectionClicks = 0;
    equalityErrors = 0;
    countErrors = 0;

    // The people are arranged in a semicircle.
    const radius = 300;
    for (let personIndex = 0; personIndex < personCount; personIndex++) {
        const angle = Math.PI * (personIndex / (personCount - 1));
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const person = document.createElement("div");

        const personImage = document.createElement("img");
        personImage.src = imageURLs[`person${personIndex + 1}Image`];
        personImage.className = "personImg";
        personImage.alt = `Person ${personIndex + 1}`

        const name = document.createElement("div");
        name.className = "name";
        name.textContent = getComputedStyle(document.documentElement).getPropertyValue(`--person${personIndex + 1}Name`);

        person.className = "person";
        person.style.left = `${x + 360 - 60}px`;
        person.style.top = `${500 - y - 200}px`;
        if (personCount == 2) {
            person.style.top = `${y}px`;
        }

        const plate = document.createElement("div");
        const plateImage = document.createElement("img");
        plateImage.src = imageURLs["plateImage"];
        plateImage.alt = `Teller ${personIndex + 1}`;
        plateImage.className = "plateImg";
        plate.className = "plate";
        plate.id = `plate-${personIndex}`;

        plateCookieIds[personIndex] = []

        plate.ondrop = handleDrop;
        plate.ondragover = (e) => e.preventDefault();

        person.appendChild(personImage);
        person.appendChild(plate);
        person.appendChild(name);
        plate.appendChild(plateImage);
        circleContainer.appendChild(person);
    }

    const table = document.createElement("div");
    const tableImage = document.createElement("img");
    tableImage.src = imageURLs["tableImage"];
    tableImage.alt = "Tisch";
    tableImage.className = "tableImg";
    table.className = "table";
    table.id = `plate-${personCount}`;
    table.appendChild(tableImage);
    circleContainer.appendChild(table);
    table.ondrop = handleDrop;
    table.ondragover = (e) => e.preventDefault();

    if (personCount == 2) {
        // If there are only two people, there is no real circle arrangement.
        circleContainer.style.height = "200px";
        table.style.top = "40px";
        if (!gridWrapper.classList.contains("twoPersonGrid")) {
            gridWrapper.classList.add("twoPersonGrid");
        }
    }
    else {
        circleContainer.style.height = "500px";
        table.style.top = "340px";
        if (gridWrapper.classList.contains("twoPersonGrid")) {
            gridWrapper.classList.remove("twoPersonGrid");
        }
    }
    cookieNumberInputContainer.style.display = "flex";
    cookieInput.disabled = false;
    checkBtn.disabled = false;
    toolbox.style.display = "inline-block";
    configbox.style.display = "inline-block";

    plateCookieIds.push([]); // for the table

    if (mode === "verteilen" || mode === "ausgleichen-verteilen") {
        // The collection tool is only available in this modes.
        table.style.display = "flex";
        collectRB.style.display = "flex";
        if (!toolboxWrapper.classList.contains("anotherTool")) {
            toolboxWrapper.classList.add("anotherTool");
        }
    }

    distributeKekse(false);
    let shouldBeDraggable = true;
    if (mode === "verteilen") {
        // In this mode, the cookies should be collected first before further actions can be carried out.
        shouldBeDraggable = false;

        moveRB.querySelector("img").style.filter = "grayscale(100%)";
        moveRB.querySelector("input").disabled = true;
        moveRB.style.cursor = "default";
        breakRB.querySelector("img").style.filter = "grayscale(100%)";
        breakRB.querySelector("input").disabled = true;
        breakRB.style.cursor = "default";
        mergeRB.querySelector("img").style.filter = "grayscale(100%)";
        mergeRB.querySelector("input").disabled = true;
        mergeRB.style.cursor = "default";
        firstCollectionClickNeeded = true;
    } else {
        // The move tool should always be selected at the start. (except in distribute mode "verteilen")
        const moveRBInput = document.getElementById("moveRB").querySelector("input");
        moveRBInput.checked = true;
        moveRBInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
    document.querySelectorAll("img").forEach(el => {
        el.draggable = false;
        el.addEventListener("dragstart", suppressDragg);
    });
    document.querySelectorAll(".cookie").forEach(cookie => {
        if (cookie.dataset.isWhole) {
            cookie.draggable = shouldBeDraggable;
        }
        if (shouldBeDraggable) {
            cookie.removeEventListener("dragstart", suppressDragg);
        }
    });

    personNumberButtons.forEach(button => {
        button.disabled = true;
    });
}

/**
 * Add all cookies to the table.
 */
function collectCookies() {
    document.querySelectorAll(".cookie, .halfCookie").forEach(cookie => {
        const targetPlateIndex = personCount; // last list in the array is the table
        plateCookieIds[cookie.dataset.plateIndex] = plateCookieIds[cookie.dataset.plateIndex].filter(id => id.localeCompare(cookie.id) != 0);
        plateCookieIds[targetPlateIndex].push(cookie.id);
        cookie.dataset.plateIndex = targetPlateIndex;
        showCookies();
    });
    collectionClicks += 1
}

/**
 * Distribute the cookies on the plates or place them on the table.
 *
 * @param {Boolean} startOnTable - Determines whether all the cookies should be on the table first
 */
function distributeKekse(startOnTable) {
    // Create a new cookie distribution until no plate is overfilled and the cookies are not yet evenly distributed.
    do {
        plateCookieIds.forEach((_, i) => plateCookieIds[i] = []);
        for (let i = 0; i < cookieCount; i++) {
            cookieId = `cookie-${i}`;
            let plateIndex = plateCookieIds.length - 1;
            if (!startOnTable) {
                plateIndex = Math.floor(Math.random() * personCount);
            }
            plateCookieIds[plateIndex].push(cookieId);
        }
    } while (!checkCookieDistribution(false) || checkEquality(false, false))

    // Place the cookies on their plates in a circle.
    for (let plateIndex = 0; plateIndex < personCount; plateIndex++) {
        const plate = document.getElementById(`plate-${plateIndex}`);
        for (let platePositionIndex = 0; platePositionIndex < MAX_COOKIES_PER_PLATE; platePositionIndex++) {
            const cookieWrapper = document.createElement("div");
            cookieWrapper.className = "cookieWrapper";
            cookieWrapper.classList.add(`number-${platePositionIndex}`);

            const radius = 60;
            const centerX = 60;
            const centerY = 60;
            const angle = (2 * Math.PI / MAX_COOKIES_PER_PLATE) * platePositionIndex - Math.PI / 2;
            cookieWrapper.style.left = `${centerX + (radius - 25) * Math.cos(angle) - 18}px`;
            cookieWrapper.style.top = `${centerY + (radius - 25) * Math.sin(angle) - 18}px`;

            plate.appendChild(cookieWrapper);
            if (platePositionIndex < plateCookieIds[plateIndex].length) {
                createKeks(platePositionIndex, platePositionIndex, plateIndex);
            }
        }
    }

    const table = document.getElementById(`plate-${personCount}`);
    // Place the cookies on the table when they are supposed to be there.
    for (let tablePositionIndex = 0; tablePositionIndex < MAX_COOKIES_ON_TABLE; tablePositionIndex++) {
        const cookieWrapper = document.createElement("div");
        cookieWrapper.className = "cookieWrapper";
        cookieWrapper.classList.add(`number-${tablePositionIndex}`);

        cookieWrapper.style.left = `${(tablePositionIndex % COOKIES_PER_ROW) * 40}px`;
        cookieWrapper.style.top = `${Math.floor(tablePositionIndex / COOKIES_PER_ROW) * 40}px`;

        table.appendChild(cookieWrapper);
        if (tablePositionIndex < plateCookieIds[plateCookieIds.length - 1].length) {
            createKeks(tablePositionIndex, tablePositionIndex, plateCookieIds.length - 1);
        }
    }
    showCookies();
}

/**
 * Creates a cookie HTML element and adds corresponding EventListeners to it.
 *
 * @param {int} placePositionIndex - The total position of the cookie in the array of the plate
 * @param {int} wapperIndex - The position of the cookie on the plate
 * @param {int} plateIndex - The index of the plate on which the cookie is placed
 * @param {Boolean} shouldBeHalf - Determines whether a half cookie should be created.
 */
function createKeks(placePositionIndex, wrapperIndex, plateIndex, shouldBeHalf) {
    const cookie = document.createElement("img");
    cookie.alt = `cookie-${cookieImageNumber}`;
    if (shouldBeHalf) {
        // Create a half cookie.
        cookie.src = imageURLs["cookieHalfRightImage"];
        cookie.className = "halfCookie";
        // If a half cookie is created, the break tool is active, which is why it should not be able to be dragged.
        cookie.draggable = false;
        cookie.addEventListener("dragstart", suppressDragg);
        plateCookieIds[plateIndex].splice(placePositionIndex, 0, `cookie-${cookieImageNumber}`);
        cookieImageNumber += 1;
    } else {
        cookie.src = imageURLs["cookieImage"];
        cookie.className = "cookie";
    }
    cookie.id = plateCookieIds[plateIndex][placePositionIndex];
    cookie.dataset.plateIndex = plateIndex;
    cookie.dataset.isWhole = !shouldBeHalf;

    cookie.addEventListener("click", (e) => {
        if (currentTool === "move") {
            if (cookie.classList.contains("marked")) {
                cookie.classList.remove("marked");
            } else {
                cookie.classList.add("marked");
            }
        } else if (currentTool === "break") {
            // If the cookie has not yet been broken, break the cookie in half.
            if (cookie.dataset.isWhole === "false") {
                alert("Ein halber Keks kann nicht noch einmal gebrochen werden!");
            } else {
                const placePositionIndexNew = plateCookieIds[cookie.dataset.plateIndex].findIndex(cookieId => cookieId === cookie.id);
                createKeks(placePositionIndexNew + 1, wrapperIndex, cookie.dataset.plateIndex, true);
                cookie.dataset.isWhole = false;
                cookie.src = imageURLs["cookieHalfLeftImage"];
                cookie.className = "halfCookie";
                showCookies();
            }
        } else if (currentTool === "merge") {
            // If possible, join two cookie halves together again.
            if (cookie.dataset.isWhole === "false") {
                const cookieWrapper = cookie.parentElement;
                const otherHalf = Array.from(cookieWrapper.children).find(cookieHalf => cookieHalf !== cookie);
                if (otherHalf !== undefined) {
                    const otherHalfIndex = plateCookieIds[cookie.dataset.plateIndex].findIndex(cookieId => cookieId === otherHalf.id);
                    plateCookieIds[cookie.dataset.plateIndex].splice(otherHalfIndex, 1);
                    cookieWrapper.removeChild(otherHalf);
                    cookie.dataset.isWhole = true;
                    cookie.src = imageURLs["cookieImage"];
                    cookie.className = "cookie";
                    cookie.style.left = "0px";
                    cookie.style.top = "0px";
                    showCookies();
                } else {
                    alert("Lege erst zwei halbe Kekse nebeneinander, um sie dann zusammenzufügen!");
                }
            }
        }
    });

    cookie.addEventListener("dragstart", (e) => {
        if (currentTool === "move") {
            // Pass the moved cookie its ID and the ID of the starting plate.
            e.dataTransfer.setData("text/plain", JSON.stringify({
                id: cookie.id,
                from: cookie.dataset.plateIndex
            }));
        }
    });
    const cookieWrapper = document.getElementById(`plate-${plateIndex}`).querySelector(`.number-${wrapperIndex}`);
    cookieWrapper.appendChild(cookie);
}

/**
 * Prevents an element from being dragged.
 *
 * @param {DragEvent} e - The event object that is passed from the browser.
 */
function suppressDragg(e) {
    e.preventDefault();
}

/**
 * Handle when a cookie is released.
 *
 * @param {DragEvent} e - The event object that is passed from the browser.
 */
function handleDrop(e) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const movingCookieId = data.id;
    const startTellerIndex = data.from;
    const targetPlateIndex = parseInt(e.currentTarget.id.split("-")[1], 10);

    // If the cookie is not moved to a new plate, nothing should happen.
    if (startTellerIndex == targetPlateIndex) return;

    const movingCookie = document.getElementById(movingCookieId);

    markedCookies = document.querySelectorAll(".cookie.marked, .halfCookie.marked");
    if (markedCookies.length > 1) {
        // Move several cookies at the same time.
        for (let i = 0; i < markedCookies.length; i++) {
            currentCookie = markedCookies[i];
            plateCookieIds[currentCookie.dataset.plateIndex] = plateCookieIds[currentCookie.dataset.plateIndex].filter(id => id.localeCompare(currentCookie.id) != 0);
            plateCookieIds[targetPlateIndex].push(currentCookie.id);
            if (checkCookieDistribution(true)) {
                currentCookie.dataset.plateIndex = targetPlateIndex;
                currentCookie.classList.remove("marked");
                showCookies()
            } else {
                plateCookieIds[targetPlateIndex] = plateCookieIds[targetPlateIndex].filter(id => id.localeCompare(currentCookie.id) != 0);
                plateCookieIds[currentCookie.dataset.plateIndex].push(currentCookie.id);
                if (i == 0) {
                    alert("Der Zielteller ist schon voll!");
                } else {
                    alert("Es können nicht alle Kekse auf diesen Teller verschoben werden");
                }
                return;
            }
        }
    } else {
        // Move just one cookie.
        plateCookieIds[startTellerIndex] = plateCookieIds[startTellerIndex].filter(id => id.localeCompare(movingCookieId) != 0);
        plateCookieIds[targetPlateIndex].push(movingCookieId);
        if (checkCookieDistribution(true)) {
            movingCookie.dataset.plateIndex = targetPlateIndex;
            showCookies()
        } else {
            plateCookieIds[targetPlateIndex] = plateCookieIds[targetPlateIndex].filter(id => id.localeCompare(movingCookieId) != 0);
            plateCookieIds[startTellerIndex].push(movingCookieId);
            alert("Der Zielteller ist schon voll!");

        }
    }

    allCookiesOnTable = true;
    for (let plateIndex = 0; plateIndex < personCount; plateIndex++) {
        if (plateCookieIds[plateIndex].length > 0) {
            // In this case, a cookie has been moved to a plate, which should activate the collection tool.
            allCookiesOnTable = false;
            collectRB.querySelector("img").style.filter = "grayscale(0%)";
            collectRB.querySelector("input").disabled = false;
            collectRB.style.cursor = "pointer";
            break;
        }
    }
    if (allCookiesOnTable) {
        collectRB.querySelector("img").style.filter = "grayscale(100%)";
        collectRB.querySelector("input").disabled = true;
        collectRB.style.cursor = "default";
    }

    hideEvaluation();
}

/**
 * Check that there are the same number of cookies on all plates and all cookies are distributed.
 *
 * @param {Boolean} withHalfCookies - Determines whether half cookies must be taken into account.
 * @param {Boolean} withMessage - Determines whether a message is to be issued.
 * @returns {Boolean} - Is the distribution equal?
 */
function checkEquality(withHalfCookies, withMessage) {
    const counts = calculateCookieCounts(withHalfCookies);
    const allEqual = counts.slice(0, -1).every(count => count == counts[0]);
    // sum to check whether all the cookies have been distributed.
    const sum = counts.slice(0, -1).reduce((acc, value) => acc + value, 0);
    if (allEqual && sum == cookieCount) {
        if (withMessage) {
            document.querySelectorAll(".cookie").forEach(cookie => {
                if (cookie.dataset.isWhole) {
                    cookie.draggable = false;
                    cookie.addEventListener("dragstart", suppressDragg);
                }
            });
            document.querySelectorAll(".halfCookie").forEach(cookie => {
                cookie.draggable = false;
                cookie.addEventListener("dragstart", suppressDragg);
            });
        }
        return true;
    } else {
        if (withMessage) {
            if (!allEqual) {
                let person1index = null;
                let person2index = null;

                // Search for two children who have a different number of cookies.
                for (let i = 0; i < counts.length - 1; i++) {
                    for (let j = i + 1; j < counts.length - 1; j++) {
                        if (counts[i] != counts[j]) {
                            person1index = i;
                            person2index = j;
                        }
                    }
                }

                let name1, name2;
                let cookieNumber1, cookieNumber2;

                name1 = getComputedStyle(document.documentElement).getPropertyValue(`--person${person1index + 1}Name`);
                name2 = getComputedStyle(document.documentElement).getPropertyValue(`--person${person2index + 1}Name`);

                if (counts[person1index] == 1) cookieNumber1 = "1 Keks";
                else cookieNumber1 = `${counts[person1index]} Kekse`;

                if (counts[person2index] == 1) cookieNumber2 = "1 Keks";
                else cookieNumber2 = `${counts[person2index]} Kekse`;

                message.textContent = `${name1} hat ${cookieNumber1} und ${name2} hat ${cookieNumber2}. Das ist nicht gerecht. Versuche es noch einmal.`;
            } else {
                message.textContent = `Es liegen noch Kekse auf dem Tisch. Du sollst alle Kekse verteilen. Versuche es noch einmal.`;
            }
            messageContainer.style.color = "var(--messageWrongFontColor)";
            messageContainer.style.border = "0.15rem solid var(--messageWrongBorderColor)";
            newTaskBtn.style.display = "none";
            equalityErrors += 1;
        }
        return false;
    }
}

/**
 * Sends the data to the server.
 */
function sendData() {
    const formData = new FormData();

    const identifier = params.get("kuerzel");
    if (identifier) {
        formData.append("identifier", identifier);
    } else {
        formData.append("identifier", "");
    }
    formData.append("mode", mode);
    formData.append("withHalf", isAdvanced);
    formData.append("equalityErrors", equalityErrors);
    formData.append("countErrors", countErrors);
    formData.append("collectionClicks", collectionClicks);

    fetch("writeData.php", {
        method: "POST",
        body: formData
    }).then(r => r.text())
        .then(console.log)
        .catch(console.error);
}

/**
 * Checks whether the given solution (distribution, cookie number) is correct and shows a corresponding message.
 */
function checkSolution() {
    if (checkEquality(true, true)) {
        const eingabe = parseFloat(cookieInput.value);
        if (eingabe == cookiesPerPerson) {
            messageContainer.style.color = "var(--messageRightFontColor)";
            messageContainer.style.border = "0.15rem solid var(--messageRightBorderColor)";
            if (cookiesPerPerson == 1) {
                message.textContent = `Richtig! Du hast die Kekse gerecht verteilt und jede Person hat ${cookiesPerPerson} Keks.`;
            } else {
                message.textContent = `Richtig! Du hast die Kekse gerecht verteilt und jede Person hat ${cookiesPerPerson} Kekse.`;
            }
            newTaskBtn.style.display = "inline-block";

            cookieInput.disabled = true;
            checkBtn.disabled = true;
            personNumberButtons.forEach(button => {
                button.disabled = false;
                button.classList.remove("inactive");
            });

            sendData();
        } else {
            messageContainer.style.color = "var(--messageWrongFontColor)";
            messageContainer.style.border = "0.15rem solid var(--messageWrongBorderColor)";
            message.textContent = "Deine Lösung ist teilweise richtig. Du hast die Kekse gerecht verteilt. Überprüfe, wie viele Kekse pro Kind verteilt wurden und ändere deine Eingabe.";
            newTaskBtn.style.display = "none";
            countErrors += 1;
        }
    }

    messageContainer.style.display = "block";
};

/**
 * Displays the new cookie distribution in the GUI.
 */
function showCookies() {
    // Save the cookie references so that they can still be accessed after removal.
    const savedCookies = [];
    for (let cookieIndex = 0; cookieIndex < cookieImageNumber; cookieIndex++) {
        const cookie = document.getElementById(`cookie-${cookieIndex}`);
        if (cookie != null) {
            savedCookies.push(cookie);
            cookie.remove();
        }
    }

    for (let plateIndex = 0; plateIndex < plateCookieIds.length; plateIndex++) {
        for (let cookieIndex = 0; cookieIndex < plateCookieIds[plateIndex].length; cookieIndex++) {
            const cookie = savedCookies.find(cookie => cookie.id === plateCookieIds[plateIndex][cookieIndex]);
            for (let positionIndex = 0; positionIndex < plateCookieIds[plateIndex].length; positionIndex++) {
                const cookieWrapper = document.getElementById(`plate-${plateIndex}`).querySelector(`.number-${positionIndex}`);
                const cookieWrapper_children = cookieWrapper.children;
                if (cookieWrapper_children.length == 0) {
                    // For cookie halves, the left half should be displayed first.
                    if (cookie.dataset.isWhole === "false") {
                        cookie.src = imageURLs["cookieHalfLeftImage"];
                        cookie.style.left = "0px";
                        cookie.style.top = "-1px";
                    }
                    cookieWrapper.appendChild(cookie);
                    break;
                } else if (cookieWrapper_children.length == 1 && cookieWrapper_children[0].dataset.isWhole === "false" && cookie.dataset.isWhole === "false") {
                    cookie.src = imageURLs["cookieHalfRightImage"];
                    cookieWrapper.appendChild(cookie);
                    cookie.style.left = "18px";
                    cookie.style.top = "1px";
                    break;
                }
            }
        }
    }
}

/**
 * Check that the maximum number of cookies is not exceeded on all plates.
 * 
 * @param {Boolean} withHalfCookies - Determines whether half cookies must be taken into account.
 * @returns {Boolean} - Is the cookie distribution valid?
 */
function checkCookieDistribution(withHalfCookies) {
    const counts = calculateCookieCounts(withHalfCookies);
    if (counts.slice(0, -1).some(count => count > MAX_COOKIES_PER_PLATE)) {
        return false;
    }
    return true;
}

/**
 * Count the number of cookies on each plate.
 * 
 * @param {Boolean} withHalfCookies - Determines whether half cookies must be taken into account.
 * @returns {intArray} - The number of cookies on each plate.
 */
function calculateCookieCounts(withHalfCookies) {
    let counts = []
    if (withHalfCookies) {
        for (let plateIndex = 0; plateIndex < plateCookieIds.length; plateIndex++) {
            sum = 0;
            for (let cookieIndex = 0; cookieIndex < plateCookieIds[plateIndex].length; cookieIndex++) {
                const cookieId = plateCookieIds[plateIndex][cookieIndex];
                const cookie = document.getElementById(cookieId);
                if (cookie.dataset.isWhole === "true") {
                    sum += 1;
                } else {
                    sum += 0.5;
                }
            }
            counts.push(sum);
        }
    } else {
        counts = plateCookieIds.map(plate => plate.length);
    }
    return counts;
}

/**
 * Hides the feedback messages.
 */
function hideEvaluation() {
    messageContainer.style.display = "none";
    cookieInput.value = "";
}

/**
 * Determines the number of cookies per person based on the specified cookie range.
 * 
 * @returns {float} - The number of cookies per person
 */
function determineCookieMultiplier() {
    let minKekseMultiplier = 0;
    let maxKekseMultiplier = 0;
    if (isAdvanced) {
        // For the mode with half cookies

        for (let totalCookies = minCookieNumber; totalCookies <= maxCookieNumber; totalCookies++) {
            let cookiesPerPerson = totalCookies / personCount;
            if (Number.isInteger(cookiesPerPerson * 2)) {
                if (minKekseMultiplier == 0 || cookiesPerPerson < minKekseMultiplier) minKekseMultiplier = cookiesPerPerson;
                if (maxKekseMultiplier == 0 || cookiesPerPerson > maxKekseMultiplier) maxKekseMultiplier = cookiesPerPerson;
            }
        }
        if (minKekseMultiplier == 0 && maxKekseMultiplier == 0) {
            if (params.has("anzahl-kekse")) {
                alert(`Für die vorhandene Personenzahl ist keine passende Keksanzahl in dem Intervall vorhanden. Das Intervall wird auf [${personCount * 0.5}, ${Math.min(personCount * (MAX_COOKIES_PER_PLATE - 0.5), MAX_COOKIE_NUMBER)}] gesetzt.`);
            }
            minKekseMultiplier = 0.5;
            maxKekseMultiplier = Math.min(MAX_COOKIES_PER_PLATE - 0.5, Math.floor(MAX_COOKIE_NUMBER * 2 / personCount) / 2)
        }
        if (minKekseMultiplier == 0) {
            if (params.has("anzahl-kekse")) {
                alert(`Für die vorhandene Personenzahl sind zu wenig Kekse vorgegeben. Die minimale Anzahl wird auf ${personCount * 0.5} gesetzt.`);
            }
            minKekseMultiplier = Math.max(minKekseMultiplier, 0.5);
            maxKekseMultiplier = Math.max(maxKekseMultiplier, 0.5);
        }
        if (maxKekseMultiplier > MAX_COOKIES_PER_PLATE - 0.5) {
            if (params.has("anzahl-kekse")) {
                alert(`Für die vorhandene Personenzahl sind zu viele Kekse vorgegeben. Die maximale Anzahl wird auf ${Math.min(personCount * (MAX_COOKIES_PER_PLATE - 0.5), MAX_COOKIE_NUMBER)} gesetzt.`);
            }
            minKekseMultiplier = Math.min(minKekseMultiplier, MAX_COOKIES_PER_PLATE - 0.5);
            maxKekseMultiplier = Math.min(maxKekseMultiplier, MAX_COOKIES_PER_PLATE - 0.5);
        }
        return Math.floor(Math.random() * ((maxKekseMultiplier - minKekseMultiplier) * 2 + 1)) / 2 + minKekseMultiplier;
    }

    // For the mode without half cookies.

    for (let totalCookies = minCookieNumber; totalCookies <= maxCookieNumber; totalCookies++) {
        let cookiesPerPerson = totalCookies / personCount;
        if (Number.isInteger(cookiesPerPerson)) {
            if (minKekseMultiplier == 0 || cookiesPerPerson < minKekseMultiplier) minKekseMultiplier = cookiesPerPerson;
            if (maxKekseMultiplier == 0 || cookiesPerPerson > maxKekseMultiplier) maxKekseMultiplier = cookiesPerPerson;
        }
    }
    if (minKekseMultiplier == 0 && maxKekseMultiplier == 0) {
        if (params.has("anzahl-kekse")) {
            alert(`Fuer die vorhandene Personenzahl ist keine passende Keksanzahl in dem Intervall vorhanden. Das Intervall wird auf [${personCount * 1}, ${Math.min(personCount * (MAX_COOKIES_PER_PLATE - 1), MAX_COOKIE_NUMBER)}] gesetzt.`);
        }
        minKekseMultiplier = 1;
        maxKekseMultiplier = Math.min(MAX_COOKIES_PER_PLATE - 1, Math.floor(MAX_COOKIE_NUMBER / personCount));
    }
    if (minKekseMultiplier == 0) {
        if (params.has("anzahl-kekse")) {
            alert(`Fuer die vorhandene Personenzahl sind zu wenig Kekse vorgegeben. Die minimale Anzahl wird auf ${personCount * 1} gesetzt.`);
        }
        minKekseMultiplier = Math.max(minKekseMultiplier, 1);
        maxKekseMultiplier = Math.max(maxKekseMultiplier, 1);
    }
    if (maxKekseMultiplier > MAX_COOKIES_PER_PLATE - 1) {
        if (params.has("anzahl-kekse")) {
            alert(`Fuer die vorhandene Personenzahl sind zu viele Kekse vorgegeben. Die maximale Anzahl wird auf ${Math.min(personCount * (MAX_COOKIES_PER_PLATE - 1), MAX_COOKIE_NUMBER)} gesetzt.`);
        }
        minKekseMultiplier = Math.min(minKekseMultiplier, MAX_COOKIES_PER_PLATE - 1);
        maxKekseMultiplier = Math.min(maxKekseMultiplier, MAX_COOKIES_PER_PLATE - 1);
    }
    return Math.floor(Math.random() * (maxKekseMultiplier - minKekseMultiplier + 1)) + minKekseMultiplier;
}

/**
 * Changes the number of people and highlights the selection.
 * 
 * @param {HTMLButtonElement} geklickterButton - The clicked number button by the user.
 * @param {int} personNumber - The selected person number by the user.
 */
function changePerson(clickedButton, personNumber) {
    personCount = personNumber;

    personNumberButtons.forEach(button => {
        if (button === clickedButton) {
            button.classList.remove("inactive");
        } else {
            button.classList.add("inactive");
        }
    });
    createNewTask();
}

/**
 * Starts a new task in which the new number of cookies is determined and the entire GUI is refreshed.
 */
function createNewTask() {
    const cookieMultiplier = determineCookieMultiplier();
    cookieCount = Math.floor(personCount * cookieMultiplier);
    cookiesPerPerson = cookieCount / personCount
    cookieImageNumber = cookieCount;
    hideEvaluation();
    createScene();
}