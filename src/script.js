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
const configWrapper = document.getElementById("configGridWrapper");
const taskTitle = document.getElementById("taskTitle");
const moveRB = document.getElementById("moveRB");
const breakRB = document.getElementById("breakRB");
const mergeRB = document.getElementById("mergeRB");
const collectRB = document.getElementById("collectRB");
const configbox = document.getElementById("config");
const personNumberButtons = document.querySelectorAll(".personNumberButton");
const overlay = document.getElementById("overlay");


const params = new URLSearchParams(window.location.search);

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
const images = [];
Object.values(imageURLs).forEach(url => {
    const img = new Image();
    img.src = url;
    images.push(img);
});


const COOKIES_PER_ROW = 5;
const PERSON_COUNT_ADVANCED_MODE = 4;
const MAX_COOKIE_NUMBER = 20;
const MAX_COOKIES_PER_PLATE = 8;
const MAX_COOKIES_ON_TABLE = 20;

let alertWindowsOpen = 0;
let currentActiveButton = null;

const grabCursor = "grab";
const knifeCursor = `url(${imageURLs["breakCursorImage"]}) 12 12, auto`;
const glueCursor = `url(${imageURLs["mergeCursorImage"]}) 16 12, auto`;

let collectionClicks = 0;
let equalityErrors = 0;
let countErrors = 0;

let mode = "ausgleichen";
let isAdvanced = false;

let personCount = 0;
let cookieCount = 0;
let cookiesPerPerson = 0;
let minCookieNumber = 1;
let maxCookieNumber = 20;
let cookieImageNumber = cookieCount;

let plateCookieIds;
let allCookiesOnTable = false;

let currentTool = "move";
let firstCollectionNeeded = false;


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
                showAlert(`<p>Der GET-Parameter \"anzahl-kekse\" enthält mindestens einen ungültigen Wert.</p>
                    <p>Bitte ein gültiges Intervall <i>min</i>,<i>max</i> von ganzen Keksen angeben, wobei 1 ≤ <i>min</i> ≤ <i>max</i> ≤ ${MAX_COOKIE_NUMBER}.</p>
                    <p>Es wird nun mit dem Intervall [1,${MAX_COOKIE_NUMBER}] gearbeitet.</p>`);
            }
        } else {
            showAlert(`<p>Der Parameter \"anzahl-kekse\" enthält einen ungültigen Wert.</p>
                <p>Bitte zwei ganze Zahlen durch ein Komma getrennt angeben (z. B. 3,8).</p>
                <p>Es wird nun mit dem Intervall [1,${MAX_COOKIE_NUMBER}] gearbeitet.</p>`);
        }
    }

    if (params.has("modus")) {
        modeInput = params.get("modus");
        if (modeInput === "ausgleichen" || modeInput === "verteilen" || modeInput === "ausgleichen-verteilen") {
            mode = modeInput;
        } else {
            showAlert(`<p>Der GET-Parameter \"modus\" enthält einen ungültigen Wert.</p>
                <p>Bitte zwischen \"ausgleichen\", \"verteilen\" und \"ausgleichen-verteilen\" wählen.</p>
                <p>Es wird nun in dem Modus \"ausgleichen\" gearbeitet.</p>`);
        }
    }

    let withHalfCookies = params.get("mit-halben-keksen");
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
        personNumberHeadline.style.display = "flex";

        personNumberButtons.forEach(button => {
            button.style.display = "inline-block";
        });

        if (withHalfCookies !== "false" && withHalfCookies != null) {
            showAlert(`<p>Der Parameter \"mit-halben-keksen\" enthält einen ungültigen Wert.</p>
                <p>Bitte entweder \"true\" oder \"false\" angeben.</p>
                <p>Es wird nun nur mit ganzen Keksen gearbeitet.</p>`);
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
            if (firstCollectionNeeded) {
                document.querySelectorAll(".cookie").forEach(cookie => {
                    cookie.draggable = true;
                    cookie.removeEventListener("dragstart", suppressDragg);
                });
                changeToolActivity(true, moveRB);
                changeToolActivity(true, breakRB);
                changeToolActivity(true, mergeRB);

                firstCollectionNeeded = false;
            }

            // When the cookies have been collected, the “move” tool should be selected.
            const moveRBInput = moveRB.querySelector("input");
            moveRBInput.checked = true;
            moveRBInput.dispatchEvent(new Event("change", { bubbles: true }));

            // As long as all the cookies are on the table, the collection function should be deactivated.
            allCookiesOnTable = true;
            changeToolActivity(false, collectRB);
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
 * Displays a pop-up information message.
 * 
 * @param {String} message - The message text that is displayed.
 */
function showAlert(message) {
    overlay.style.display = "block";

    const customAlert = document.createElement("div");
    customAlert.className = "customAlert";
    const alertMessage = document.createElement("div");
    alertMessage.className = "alertMessage";
    alertMessage.innerHTML = message;
    const okBtn = document.createElement("button");
    okBtn.className = "button";
    okBtn.classList.add("okBtn");
    okBtn.addEventListener("click", () => hideCustomAlert(customAlert));
    okBtn.textContent = "OK";

    customAlert.appendChild(alertMessage);
    customAlert.appendChild(okBtn);
    overlay.appendChild(customAlert);

    alertWindowsOpen += 1;
}

/**
 * Hides passed pop-up information message.
 * 
 * @param {HTMLDivElement} alertWindow - The alert window to be removed.
 */
function hideCustomAlert(alertWindow) {
    alertWindow.remove();
    alertWindowsOpen -= 1;
    if (alertWindowsOpen == 0) {
        overlay.style.display = "none";
    }
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
    taskTitle.style.display = "inline-block";
    toolbox.style.display = "inline-block";
    configbox.style.display = "inline-block";

    plateCookieIds.push([]); // for the table

    if (mode === "verteilen" || mode === "ausgleichen-verteilen") {
        // The collection tool is only available in this modes.
        table.style.display = "flex";
        collectRB.style.display = "flex";
        if (!toolboxWrapper.classList.contains("withCollectionTool")) {
            toolboxWrapper.classList.add("withCollectionTool");
        }
    }

    if (isAdvanced) {
        // The break and merge tool should only be available in half cookie mode.
        breakRB.style.display = "flex";
        mergeRB.style.display = "flex";
    }

    distributeCookies(false);
    changeToolActivity(true, moveRB);
    changeToolActivity(true, collectRB);
    if (mode === "verteilen") {
        // In this mode, the cookies should be collected first before further actions can be carried out.

        changeToolActivity(false, breakRB);
        changeToolActivity(false, mergeRB);
        firstCollectionNeeded = true;

        taskTitle.textContent = "Sammle die Kekse auf dem Tisch und verteile sie anschließend gerecht.";
    } else {
        // The move tool should always be selected at the start. (except in distribute mode "verteilen")
        const moveRBInput = document.getElementById("moveRB").querySelector("input");
        moveRBInput.checked = true;
        moveRBInput.dispatchEvent(new Event("change", { bubbles: true }));

        changeToolActivity(true, breakRB);
        changeToolActivity(true, mergeRB);

        taskTitle.textContent = "Verteile die Kekse gerecht an alle Personen.";
    }

    document.querySelectorAll("img:not(.cookie)").forEach(el => {
        el.draggable = false;
        el.addEventListener("dragstart", suppressDragg);
    });

    personNumberButtons.forEach(button => {
        button.disabled = true;
        if (button === currentActiveButton) {
            button.classList.remove("inactive");
        } else {
            button.classList.add("inactive");
        }
    });
}

/**
 * Move all cookies to the table.
 */
function collectCookies() {
    document.querySelectorAll(".cookie, .halfCookie").forEach(cookie => {
        const targetPlateIndex = personCount; // last list in the array is the table
        plateCookieIds[cookie.dataset.plateIndex] =
            plateCookieIds[cookie.dataset.plateIndex]
                .filter(id => id.localeCompare(cookie.id) != 0);
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
function distributeCookies(startOnTable) {
    // Create a new cookie distribution until no plate is overfilled
    // and the cookies are not yet evenly distributed.
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
                createCookie(platePositionIndex, platePositionIndex, plateIndex);
            }
        }
    }

    const table = document.getElementById(`plate-${personCount}`);
    // Place the cookies on the table when they are supposed to be there.
    for (let tablePositionIndex = 0; tablePositionIndex < MAX_COOKIES_ON_TABLE; tablePositionIndex++) {
        const cookieWrapper = document.createElement("div");
        cookieWrapper.className = "cookieWrapper";
        cookieWrapper.classList.add(`number-${tablePositionIndex}`);

        cookieWrapper.style.left = `${(tablePositionIndex % COOKIES_PER_ROW) * 40 + 20}px`;
        cookieWrapper.style.top = `${Math.floor(tablePositionIndex / COOKIES_PER_ROW) * 40}px`;

        table.appendChild(cookieWrapper);
        if (tablePositionIndex < plateCookieIds[plateCookieIds.length - 1].length) {
            createCookie(tablePositionIndex, tablePositionIndex, plateCookieIds.length - 1);
        }
    }
    showCookies();
}

/**
 * Creates a cookie HTML element and adds corresponding EventListeners to it.
 *
 * @param {int} platePositionIndex - The total position of the cookie in the array of the plate
 * @param {int} wapperIndex - The position of the cookie on the plate
 * @param {int} plateIndex - The index of the plate on which the cookie is placed
 * @param {Boolean} shouldBeHalf - Determines whether a half cookie should be created.
 */
function createCookie(platePositionIndex, wrapperIndex, plateIndex, shouldBeHalf) {
    const cookie = document.createElement("img");
    cookie.alt = `cookie-${cookieImageNumber}`;
    if (shouldBeHalf) {
        // Create a half cookie.
        cookie.src = imageURLs["cookieHalfRightImage"];
        cookie.className = "halfCookie";
        // If a half cookie is created, the break tool is active, which is why it should not be able to be dragged.
        cookie.draggable = false;
        cookie.addEventListener("dragstart", suppressDragg);
        plateCookieIds[plateIndex].splice(platePositionIndex, 0, `cookie-${cookieImageNumber}`);
        cookieImageNumber += 1;
    } else {
        cookie.src = imageURLs["cookieImage"];
        cookie.className = "cookie";
    }
    cookie.id = plateCookieIds[plateIndex][platePositionIndex];
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
                showAlert(`<p>Ein halber Keks
                    kann nicht noch einmal gebrochen werden.</p>`);
            } else {
                const platePositionIndexNew = plateCookieIds[
                    cookie.dataset.plateIndex]
                    .findIndex(cookieId => cookieId === cookie.id);

                createCookie(platePositionIndexNew + 1, wrapperIndex,
                    cookie.dataset.plateIndex, true);

                cookie.dataset.isWhole = false;
                cookie.src = imageURLs["cookieHalfLeftImage"];
                cookie.className = "halfCookie";
                showCookies();
            }
        } else if (currentTool === "merge") {
            // If possible, join two cookie halves together again.
            if (cookie.dataset.isWhole === "false") {
                const cookieWrapper = cookie.parentElement;
                const otherHalf = Array.from(cookieWrapper.children)
                    .find(cookieHalf => cookieHalf !== cookie);

                if (otherHalf !== undefined) {
                    const otherHalfIndex = plateCookieIds[cookie.dataset.plateIndex]
                        .findIndex(cookieId => cookieId === otherHalf.id);

                    plateCookieIds[cookie.dataset.plateIndex]
                        .splice(otherHalfIndex, 1);

                    cookieWrapper.removeChild(otherHalf);
                    cookie.dataset.isWhole = true;
                    cookie.src = imageURLs["cookieImage"];
                    cookie.className = "cookie";
                    showCookies();
                } else {
                    showAlert(`<p>Lege erst zwei halbe Kekse nebeneinander,
                        um sie dann zusammenzufügen.</p>`);
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
    const cookieWrapper = document.getElementById(`plate-${plateIndex}`)
        .querySelector(`.number-${wrapperIndex}`);
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

    if (firstCollectionNeeded && targetPlateIndex != personCount) {
        // If the cookies are to be collected first, they must not yet be moved to other plates.
        showAlert("<p>Lege zuerst alle Kekse auf den Tisch.</p>")
        return;
    }

    const movingCookie = document.getElementById(movingCookieId);
    movingCookie.classList.add("marked");
    cookiesToMove = document.querySelectorAll(".cookie.marked, .halfCookie.marked");

    // Move one or several cookie(s) at the same time.
    for (let i = 0; i < cookiesToMove.length; i++) {
        let currentCookie = cookiesToMove[i];
        plateCookieIds[currentCookie.dataset.plateIndex] =
            plateCookieIds[currentCookie.dataset.plateIndex]
                .filter(id => id.localeCompare(currentCookie.id) != 0);
        plateCookieIds[targetPlateIndex].push(currentCookie.id);
        if (checkCookieDistribution(true)) {
            currentCookie.dataset.plateIndex = targetPlateIndex;
            currentCookie.classList.remove("marked");
            showCookies();
        } else {
            plateCookieIds[targetPlateIndex] = plateCookieIds[targetPlateIndex]
                .filter(id => id.localeCompare(currentCookie.id) != 0);
            plateCookieIds[currentCookie.dataset.plateIndex].push(currentCookie.id);
            if (i == 0) {
                showAlert("<p>Der Zielteller ist schon voll.</p>");
            } else {
                showAlert(`<p>Es können nicht alle Kekse
                    auf diesen Teller verschoben werden.</p>`);
            }
            break;
        }
    }

    allCookiesOnTable = true;
    for (let plateIndex = 0; plateIndex < personCount; plateIndex++) {
        if (plateCookieIds[plateIndex].length > 0) {
            // In this case, a cookie has been moved to a plate, which should activate the collection tool.
            allCookiesOnTable = false;
            changeToolActivity(true, collectRB);
            break;
        }
    }
    if (allCookiesOnTable) {
        changeToolActivity(false, collectRB);

        if (firstCollectionNeeded) {
            firstCollectionNeeded = false;
        }
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
    // Sum to check whether all the cookies have been distributed.
    const sum = counts.slice(0, -1).reduce((acc, value) => acc + value, 0);

    if (allEqual && sum == cookieCount) {
        if (withMessage) {
            // Deactivate all options to change the cookie distribution.
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

            changeToolActivity(false, moveRB);
            changeToolActivity(false, breakRB);
            changeToolActivity(false, mergeRB);
            changeToolActivity(false, collectRB);
        }
        return true;
    } else {
        if (withMessage) {
            if (!allEqual) {
                let person1index = null;
                let person2index = null;
                // Search for two persons who have a different number of cookies.
                let pairFound = false;
                for (let i = 0; i < counts.length - 1; i++) {
                    for (let j = i + 1; j < counts.length - 1; j++) {
                        if (counts[i] != counts[j]) {
                            person1index = i;
                            person2index = j;
                            pairFound = true;
                            break;
                        }
                    }
                    if (pairFound) break;
                }

                let name1 = getComputedStyle(document.documentElement)
                    .getPropertyValue(`--person${person1index + 1}Name`);
                let name2 = getComputedStyle(document.documentElement)
                    .getPropertyValue(`--person${person2index + 1}Name`);

                let cookieNumber1 = "1 Keks";
                let cookieNumber2 = "1 Keks";
                if (counts[person1index] != 1) cookieNumber1 =
                    `${counts[person1index]} Kekse`;
                if (counts[person2index] != 1) cookieNumber2 =
                    `${counts[person2index]} Kekse`;

                displayMessage(false,
                    `${name1} hat ${cookieNumber1} und ${name2} hat ${cookieNumber2}. 
                    Das ist nicht gerecht. Versuche es noch einmal.`);
            } else {
                displayMessage(false,
                    `Es liegen noch Kekse auf dem Tisch. Verteile alle Kekse gerecht. 
                    Versuche es noch einmal.`);
            }
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
    if (identifier) formData.append("identifier", identifier);
    else formData.append("identifier", "");

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
        let numberInput = cookieInput.value;
        if (!cookieInput.validity.valid) {
            displayMessage(false, `Du hast die Kekse richtig verteilt. 
                Trage eine Zahl ein, wie viele Kekse jede Person bekommt.`);
        } else if (numberInput === "") {
            displayMessage(false, `Du hast die Kekse richtig verteilt. 
                Trage auch ein, wie viele Kekse jede Person bekommt.`);
        } else {
            numberInput = parseFloat(numberInput);
            if (numberInput == cookiesPerPerson) {
                if (cookiesPerPerson == 1) {
                    displayMessage(true,
                        `Richtig! Du hast die Kekse gerecht verteilt. 
                        Jede Person hat ${cookiesPerPerson} Keks.`);
                } else {
                    displayMessage(true,
                        `Richtig! Du hast die Kekse gerecht verteilt. 
                        Jede Person hat ${cookiesPerPerson} Kekse.`);
                }
                cookieInput.disabled = true;
                checkBtn.disabled = true;

                personNumberButtons.forEach(button => {
                    button.disabled = false;
                    button.classList.remove("inactive");
                });

                sendData();
            } else {
                displayMessage(false, `Du hast die Kekse gerecht verteilt. 
                    Überprüfe, wie viele Kekse pro Kind verteilt wurden 
                    und ändere deine Eingabe.`);
                countErrors += 1;
            }
        }
    }
};


function displayMessage(isCorrect, messageToDisplay) {
    if (isCorrect) {
        messageContainer.style.color = "var(--messageRightFontColor)";
        messageContainer.style.border = "0.15rem solid var(--messageRightBorderColor)";
        newTaskBtn.style.display = "inline-block";
    } else {
        messageContainer.style.color = "var(--messageWrongFontColor)";
        messageContainer.style.border = "0.15rem solid var(--messageWrongBorderColor)";
        newTaskBtn.style.display = "none";
    }
    message.textContent = messageToDisplay;
    messageContainer.style.display = "block";
}

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
                if (cookieWrapper_children.length == 0 && cookie.dataset.isWhole === "false") {
                    // For cookie halves, the left half should be displayed first.
                    cookie.src = imageURLs["cookieHalfLeftImage"];
                    cookieWrapper.appendChild(cookie);
                    cookie.style.left = "0px";
                    cookie.style.top = "-1px";
                    break;
                } else if (cookieWrapper_children.length == 1 && cookieWrapper_children[0].dataset.isWhole === "false" && cookie.dataset.isWhole === "false") {
                    // If one half is already on the plate, the right half can be added.
                    cookie.src = imageURLs["cookieHalfRightImage"];
                    cookieWrapper.appendChild(cookie);
                    cookie.style.left = "18px";
                    cookie.style.top = "1px";
                    break;
                } else if (cookieWrapper_children.length == 0) {
                    // A whole cookie is added to the plate.
                    cookieWrapper.appendChild(cookie);
                    cookie.style.left = "0px";
                    cookie.style.top = "0px";
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
    let minCookieMultiplier = 0;
    let maxCookieMultiplier = 0;
    if (isAdvanced) {
        // For the mode with half cookies

        for (let totalCookies = minCookieNumber; totalCookies <= maxCookieNumber; totalCookies++) {
            let cookiesPerPerson = totalCookies / personCount;
            if (Number.isInteger(cookiesPerPerson)) continue; // no whole number averages
            if (Number.isInteger(cookiesPerPerson * 2)) {
                if (minCookieMultiplier == 0 || cookiesPerPerson < minCookieMultiplier) minCookieMultiplier = cookiesPerPerson;
                if (maxCookieMultiplier == 0 || cookiesPerPerson > maxCookieMultiplier) maxCookieMultiplier = cookiesPerPerson;
            }
        }
        if (maxCookieMultiplier == 0) {
            if (params.has("anzahl-kekse")) {
                showAlert(`<p>Für die vorhandene Personenzahl ist keine passende Keksanzahl in dem Intervall vorhanden.</p>
                    <p>Das Intervall wird auf [${personCount * 0.5}, ${Math.min(personCount * (MAX_COOKIES_PER_PLATE - 0.5), MAX_COOKIE_NUMBER)}] gesetzt.</p>`);
            }
            minCookieMultiplier = 0.5;
            maxCookieMultiplier = Math.min(MAX_COOKIES_PER_PLATE - 0.5, Math.floor(MAX_COOKIE_NUMBER * 2 / personCount) / 2);
            if (Number.isInteger(maxCookieMultiplier)) maxCookieMultiplier -= 0.5;
        }
        if (maxCookieMultiplier > MAX_COOKIES_PER_PLATE - 0.5) {
            if (params.has("anzahl-kekse")) {
                showAlert(`<p>Für die vorhandene Personenzahl sind zu viele Kekse vorgegeben.</p>
                    <p>Die maximale Anzahl wird auf ${Math.min(personCount * (MAX_COOKIES_PER_PLATE - 0.5), MAX_COOKIE_NUMBER)} gesetzt.</p>`);
            }
            minCookieMultiplier = Math.min(minCookieMultiplier, MAX_COOKIES_PER_PLATE - 0.5);
            maxCookieMultiplier = Math.min(maxCookieMultiplier, MAX_COOKIES_PER_PLATE - 0.5);
        }

        return Math.floor(Math.random() * (maxCookieMultiplier - minCookieMultiplier + 1)) + minCookieMultiplier;
    }

    // For the mode without half cookies.

    for (let totalCookies = minCookieNumber; totalCookies <= maxCookieNumber; totalCookies++) {
        let cookiesPerPerson = totalCookies / personCount;
        if (Number.isInteger(cookiesPerPerson)) {
            if (minCookieMultiplier == 0 || cookiesPerPerson < minCookieMultiplier) minCookieMultiplier = cookiesPerPerson;
            if (maxCookieMultiplier == 0 || cookiesPerPerson > maxCookieMultiplier) maxCookieMultiplier = cookiesPerPerson;
        }
    }
    if (maxCookieMultiplier == 0 || maxCookieMultiplier == 1) {
        if (params.has("anzahl-kekse")) {
            showAlert(`<p>Für die vorhandene Personenzahl ist keine passende Keksanzahl in dem Intervall vorhanden.</p>
                <p>Das Intervall wird auf [${personCount * 2}, ${Math.min(personCount * (MAX_COOKIES_PER_PLATE - 1), MAX_COOKIE_NUMBER)}] gesetzt.</p>`);
        }
        minCookieMultiplier = 2;
        maxCookieMultiplier = Math.min(MAX_COOKIES_PER_PLATE - 1, Math.floor(MAX_COOKIE_NUMBER / personCount));
    } else if (minCookieMultiplier == 1) {
        if (params.has("anzahl-kekse")) {
            showAlert(`<p>Für die vorhandene Personenzahl sind als untere Grenze zu wenige Kekse vorgegeben.</p>
                <p>Die minimale Anzahl wird auf ${personCount * 2} gesetzt.</p>`);
        }
        minCookieMultiplier = 2;
    }
    if (maxCookieMultiplier > MAX_COOKIES_PER_PLATE - 1) {
        if (params.has("anzahl-kekse")) {
            showAlert(`<p>Für die vorhandene Personenzahl sind zu viele Kekse vorgegeben.</p>
                <p>Die maximale Anzahl wird auf ${Math.min(personCount * (MAX_COOKIES_PER_PLATE - 1), MAX_COOKIE_NUMBER)} gesetzt.</p>`);
        }
        minCookieMultiplier = Math.min(minCookieMultiplier, MAX_COOKIES_PER_PLATE - 1);
        maxCookieMultiplier = Math.min(maxCookieMultiplier, MAX_COOKIES_PER_PLATE - 1);
    }
    return Math.floor(Math.random() * (maxCookieMultiplier - minCookieMultiplier + 1)) + minCookieMultiplier;
}

/**
 * Changes the number of people.
 * 
 * @param {HTMLButtonElement} clickedButton - The clicked number button by the user.
 * @param {int} personNumber - The selected person number by the user.
 */
function changePerson(clickedButton, personNumber) {
    personCount = personNumber;
    currentActiveButton = clickedButton;
    createNewTask();
}

/**
 * Changes the activity of the radio button.
 * 
 * @param {Boolean} shouldBeActive - Determines whether the tool should be active.
 * @param {HTMLLabelElement} radioButton - the label wrapper from the radio button
 */
function changeToolActivity(shouldBeActive, radioButton) {
    if (shouldBeActive) {
        radioButton.querySelector("img").style.filter = "grayscale(0%)";
        radioButton.querySelector("input").disabled = false;
        radioButton.style.cursor = "pointer";
    } else {
        radioButton.querySelector("img").style.filter = "grayscale(100%)";
        radioButton.querySelector("input").disabled = true;
        radioButton.style.cursor = "default";
    }
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