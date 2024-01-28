let totalRow= 1; // Number of seq-rows (Global)
let bpm = 60000 / 120; // BPM (Global)
let pos = 1; // Current Position (within 16)
let intervalId; // BPM interval
let subIntervalId; // Substep interval
let timerId; // MicroTiming Timeout
let lastSelection;

/* Commonly Used Functions */

function toggleColor(current, active, inactive) {
    if (current.style.backgroundColor === active) {
        current.style.backgroundColor = inactive;
    } else if (current.style.backgroundColor === inactive) {
        current.style.backgroundColor = active;
    }
}


// Toggle Column / Trigger steps
function toggleColumn() {

    if (pos > 16) {
        document.querySelectorAll(".step16").forEach((element) => toggleColor(element, "yellow", "lawngreen"));
        pos = 1;
    } else {
        document.querySelectorAll(".step" + (pos - 1).toString()).forEach((element) => toggleColor(element, "lawngreen", "yellow"));
    }
    document.querySelectorAll(".step" + pos.toString()).forEach((element) => toggleColor(element, "yellow", "lawngreen"));

    pos++;
}



/* Initialize Nav Bar */

document.querySelector("#play-all").style.backgroundColor = "gray";
document.querySelectorAll(".nav-utils > *").forEach((element) => element.style.backgroundColor = "gray")
document.querySelector("#file-name").addEventListener('blur', function changeFileName () {
   document.querySelector("#pattern").dataset.name =  document.querySelector("#file-name").value;
});

// Upload Pattern

// Download pattern


/* Initialize Row (for the subsequent sequencer rows) */

function initializeRow() {

    // Make all buttons inactive before doing anything
    for (let step = 1; step <= 16; step++) {
        document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).style.backgroundColor = "darkgray";
        document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).style.border = "";
    }

    document.querySelector("#seq-row-" + totalRow.toString() + " .mute").style.backgroundColor = "gray";
    document.querySelector("#seq-row-" + totalRow.toString() + " .solo").style.backgroundColor = "gray";


    // Toggle Step
    for (let step = 1; step <= 16; step++) {

        // Enable Toggling Steps
        document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).addEventListener('dblclick', function toggleStep() {
            toggleColor(this, "lawngreen", "darkgray");
        });

        // Enable Selecting Steps, and then interacting with their values
        document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).addEventListener('click', function selectStep() {

            document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).style.border = "3px black solid";

            if (lastSelection) {
                lastSelection.style.border = "";
            }

            lastSelection = document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString());

            if (this.getAttribute("data-active") === "no") {
                this.setAttribute("data-active", "yes");
            } else if (this.getAttribute("data-active") === "yes") {
                this.setAttribute("data-active", "no");
            }

            document.querySelector("#ac").value = document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).dataset.acc;
            document.querySelector("#cond").value = document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).dataset.cond;
            document.querySelector("#sub").value = document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).dataset.sub;
            document.querySelector("#micro").value = document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).dataset.micro;

            document.querySelector("#ac").onchange = function () {
                document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).dataset.acc = document.querySelector("#ac").value.toString()
            };
            document.querySelector("#cond").onchange = function () {
                document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).dataset.cond = document.querySelector("#cond").value.toString()
            };
            document.querySelector("#sub").onchange = function () {
                document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).dataset.sub = document.querySelector("#sub").value.toString()
            };
            document.querySelector("#micro").onchange = function () {
                document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).dataset.micro = document.querySelector("#micro").value.toString()
            };

            if (this.style.backgroundColor === "darkgray") {
                document.querySelector("#ac").value = "0.5"
                document.querySelector("#cond").value = "1.0"
                document.querySelector("#sub").value = "1"
                document.querySelector("#micro").value = "0.00"
                document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).dataset.acc = "0.5"
                document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).dataset.cond = "1.0"
                document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).dataset.sub = "1"
                document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).dataset.micro = "0.00"
            }
        });

        // Enable Row Clear
        document.querySelector("#seq-row-" + totalRow.toString() + " .row-clear").addEventListener('click', function rowClear() {
            for (let step = 1; step <= 16; step++) {
                document.querySelector("#seq-row-" + this.textContent + " .steps .step" + step.toString()).style.backgroundColor = "darkgray";
            }
        });

        // Enable Loading Samples
        let $audio = $('#audio-' + totalRow.toString());
        $('#inst-' + totalRow.toString()).on('change', function (e) {
            let target = e.currentTarget;
            let file = target.files[0];

            if (target.files && file) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    $audio.attr('src', e.target.result);
                }
                reader.readAsDataURL(file);
            }
        });

        // Display their names
        document.querySelector("#inst-" + totalRow.toString()).addEventListener('change', function displaySample() {
            this.parentNode.querySelector("label[id^='new-inst-']").textContent = document.querySelector("#inst-" + totalRow.toString()).value.replace("C:\\fakepath\\", "");
        });

        // Enable Mute Function
        document.querySelector("#seq-row-" + totalRow.toString() + " .mute").addEventListener('click', function muteRow() {
            toggleColor(this, "red", "gray");
        });

        // Enable Solo Function
        document.querySelector("#seq-row-" + totalRow.toString() + " .solo").addEventListener('click', function soloRow() {
            toggleColor(this, "orange", "gray");
        });
    }
}
initializeRow();

/* Navigation Bar */

// Erase all pattern (Nuke)
document.querySelector("#nuke-all").addEventListener('click', function nukeAll() {
    let nukeConfirm = confirm("This will ERASE ALL patterns. Are you really sure?");
    if (nukeConfirm === true) {
        document.querySelectorAll(".steps button").forEach((element) => element.style.backgroundColor = "darkgray");
        document.querySelectorAll(".steps button").forEach((element) => element.dataset.acc = "0.5");
        document.querySelectorAll(".steps button").forEach((element) => element.dataset.cond = "1.0");
        document.querySelector("#ac").value = "0.5"
        document.querySelector("#cond").value = "1.0"
    }
});


// Add an instrument row
document.querySelector("#add-inst").addEventListener('click', function addRow() {

    // Add a new row
    let new_row = document.querySelector("#seq-row-1").cloneNode(true);
    totalRow++;
    new_row.setAttribute("id", "seq-row-" + totalRow.toString());
    new_row.querySelector(".row-clear").textContent = totalRow.toString();
    new_row.querySelector("label").setAttribute("for", "inst-" + totalRow.toString());
    new_row.querySelector("label").setAttribute("id", "new-inst-" + totalRow.toString());
    new_row.querySelector("input").setAttribute("id", "inst-" + totalRow.toString());
    new_row.querySelector("audio").setAttribute("id", "audio-" + totalRow.toString());
    let targetContainer= document.querySelector('#pattern');
    targetContainer.appendChild(document.importNode(new_row, true));
    initializeRow();

});

// Remove the lowermost instrument
document.querySelector("#del-inst").addEventListener('click', function delInst() {
    if (totalRow > 1) {
        document.querySelector("#seq-row-" + totalRow.toString()).remove();
        totalRow--;
    }
});

// Set BPM
document.querySelector("#bpm-label").addEventListener('input', function setBPM() {
    if (document.querySelector("#bpm").value > 0 || document.querySelector("#bpm").value === "") {
        bpm = 60000 / document.querySelector("#bpm").value;
        clearInterval(intervalId);
        intervalId = null;
        intervalId = setInterval(toggleColumn, bpm);
    } else {
        alert("BPM must be higher than 0!");
        document.querySelector("#bpm").value = ""
        clearInterval(intervalId);
        intervalId = null;
    }
});

// Play through pattern / Trigger Steps
document.querySelector("#play-all").onclick = function playPattern() {
    toggleColor(this, "lawngreen", "gray");
    if (this.style.backgroundColor === "lawngreen") {
        clearInterval(intervalId);
        intervalId = setInterval(toggleColumn, bpm);
    } else {
        clearInterval(intervalId);
        intervalId = null;
    }
}