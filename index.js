let totalRow= 1; // Number of seq-rows (Global)
let bpm = 120; // BPM (Global)
let pos = 1; // Current Position (within 16)
let intervalId;

function toggleColor(current, active, inactive) {
    if (current.style.backgroundColor === active) {
        current.style.backgroundColor = inactive;
    } else if (current.style.backgroundColor === inactive) {
        current.style.backgroundColor = active;
    }
}

function toggleColumn() {

    document.querySelectorAll(".step" + (pos - 1).toString()).forEach((element) => toggleColor(element, "lawngreen", "orange"));
    document.querySelectorAll(".step" + pos.toString()).forEach((element) => toggleColor(element, "orange", "lawngreen"));

    if (pos === 17) {
        pos = 1;
    } else { pos++; }
}

/* Initialize Nav Bar */

document.querySelector("#play-all").style.backgroundColor = "gray";
document.querySelectorAll(".nav-utils > *").forEach((element) => element.style.backgroundColor = "gray")


function initializeRow() {

    // Make all buttons inactive before doing anything
    for (let step = 1; step <= 16; step++) {
        document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).style.backgroundColor = "darkgray";
    }
    document.querySelector("#seq-row-" + totalRow.toString() + " .mute").style.backgroundColor = "gray";
    document.querySelector("#seq-row-" + totalRow.toString() + " .solo").style.backgroundColor = "gray";


    // Enable Row Clear
    document.querySelector("#seq-row-" + totalRow.toString() + " .row-clear").addEventListener('click', function rowClear() {
        for (let step = 1; step <= 16; step++) {
            document.querySelector("#seq-row-" + this.textContent + " .steps .step" + step.toString()).style.backgroundColor = "darkgray";
        }
    });

    // Enable Mute Function
    document.querySelector("#seq-row-" + totalRow.toString() + " .mute").addEventListener('click', function muteRow() {
        toggleColor(this, "red", "gray");
    });

    // Enable Solo Function
    document.querySelector("#seq-row-" + totalRow.toString() + " .solo").addEventListener('click', function soloRow() {
        toggleColor(this, "orange", "gray");
    });

    // Toggle Step
    for (let step = 1; step <= 16; step++) {
        document.querySelector("#seq-row-" + totalRow.toString() + " .steps .step" + step.toString()).addEventListener('click', function toggleStep() {
            toggleColor(this, "lawngreen", "darkgray");
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
    }
});


// Add an instrument
document.querySelector("#add-inst").addEventListener('click', function addRow() {

    // Add a new row
    let new_row = document.querySelector("#seq-row-1").cloneNode(true);
    totalRow++;
    new_row.setAttribute("id", "seq-row-" + totalRow.toString());
    new_row.querySelector(".row-clear").textContent = totalRow.toString();
    new_row.querySelector("label").setAttribute("for", "inst-" + totalRow.toString());
    new_row.querySelector("label").setAttribute("id", "new-inst-" + totalRow.toString());
    new_row.querySelector("input").setAttribute("id", "inst-" + totalRow.toString());
    let targetContainer= document.querySelector('#grid-container');
    targetContainer.appendChild(document.importNode(new_row, true));
    initializeRow();

});

// Remove the lowest instrument
document.querySelector("#del-inst").addEventListener('click', function delInst() {
    if (totalRow > 1) {
        document.querySelector("#seq-row-" + totalRow.toString()).remove();
        totalRow--;
    }
});

// Set BPM
document.querySelector("#bpm-label").addEventListener('input', function setBPM() {
    if (document.querySelector("#bpm").value > 0 || document.querySelector("#bpm").value === "") {
        bpm = document.querySelector("#bpm").value / 60000;
    } else {
        alert("BPM must be higher than 0!");
        document.querySelector("#bpm").value = ""
    }
});

// Play through pattern
document.querySelector("#play-all").onclick = function playPattern(){
    toggleColor(this, "lawngreen", "gray");
    if (document.querySelector("#play-all").style.backgroundColor === "lawngreen") {
        if (!intervalId) {
            intervalId = setInterval(toggleColumn, bpm);
        }
    } else {
        clearInterval(intervalId);
        intervalId = null;
    }
};

// Activate Conditional View + Change Icon
document.querySelector("#conditional").addEventListener('click', function toggleConditional() {
    toggleColor(this, "lawngreen", "gray");
    this.textContent = ['⚀COND', '⚁COND', '⚂COND', '⚃COND', '⚄COND', '⚅COND'][Math.floor(6 * Math.random())];
});