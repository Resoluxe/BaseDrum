let totalRow= 1; // Number of seq-rows (Global)
let bpm = 120; // BPM (Global)
let pos = 1; // Current Position (within 16)

function toggleColor(current, active, inactive) {
    if (current.style.backgroundColor === active) {
        current.style.backgroundColor = inactive;
    } else if (current.style.backgroundColor === inactive) {
        current.style.backgroundColor = active;
    }
}

function toggleColumn(position) {
    document.querySelectorAll(".step" + position.toString()).forEach((element) => toggleColor(element, "orange", "lawngreen"));
}

function patternPlay() {
    for (pos; pos <= 16; pos++) {
        if (pos === 1) {
            toggleColumn(1);
            toggleColumn(16);
        } else {
            toggleColumn(pos);
            toggleColumn(pos - 1)
            if (pos === 16) {
                pos = 1
            }
        }
    }
}

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

    //Display the Uploaded Sample when Uploading

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


document.querySelector("#bpm-label").addEventListener('input', function setBPM() {
    if (document.querySelector("#bpm").value > 0 || document.querySelector("#bpm").value === "") {
        bpm = 60000 / document.querySelector("#bpm").value;
    } else {
        alert("BPM must be higher than 0!");
        document.querySelector("#bpm").value = ""
    }
});

// Play through pattern

// Activate Conditional View + Change Icon
document.querySelector("#conditional").addEventListener('click', function toggleConditional() {
    this.textContent = ['⚀COND', '⚁COND', '⚂COND', '⚃COND', '⚄COND', '⚅COND'][Math.floor(6 * Math.random())];
    toggleColor(this, "lawngreen", "gray");
});