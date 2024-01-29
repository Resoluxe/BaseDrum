let totalRow= 1; // Number of seq-rows (Global)
let baseVal = 4; // Time Signature
let bpm = 120; // BPM (Global)
let pos = 1; // Current Position
let maxPos = 16; // maximum position
let intervalId; // BPM interval
let lastSelection;



/* Commonly Used Functions */

function toggleColor(current, active, inactive) {
    if (current.style.backgroundColor === active) {
        current.style.backgroundColor = inactive;
    } else if (current.style.backgroundColor === inactive) {
        current.style.backgroundColor = active;
    }
}

// Toggle Column
function toggleColumn() {

    document.querySelectorAll(".step" + (pos - 1).toString()).forEach((element) => toggleColor(element, "yellow", "lawngreen"));

    document.querySelectorAll(".step" + pos.toString()).forEach((element) => toggleColor(element, "yellow", "lawngreen"));

    for (let row = 1; row <= totalRow; row++) {
        if (document.querySelector("#seq-row-" + row.toString() + " .step" + pos.toString()).style.backgroundColor === "yellow") {
            toggleColor(document.querySelector("#seq-row-" + row.toString() + " .row-clear"), "yellow", "gray");

            if (Math.random() < Number(document.querySelector("#seq-row-" + row.toString() + " .step" + pos.toString()).dataset.cond)) {

                document.querySelector("#audio-" + row.toString()).volume = Number(document.querySelector("#seq-row-" + row.toString() + " .step" + pos.toString()).dataset.acc);

                setTimeout(function () {
                    let subCount = Number(document.querySelector("#seq-row-" + row.toString() + " .step" + pos.toString()).dataset.sub);
                    for (let sub = 1; sub <= subCount; sub++) {
                        setTimeout(function () {
                            toggleColor(document.querySelector("#seq-row-" + row.toString() + " .row-clear"), "yellow", "gray");
                            document.querySelector("#audio-" + row.toString()).currentTime = 0;
                            document.querySelector("#audio-" + row.toString()).play();
                        }, 60000 / (bpm * baseVal * sub));
                    }
                }, (60000 * Number(document.querySelector("#seq-row-" + row.toString() + " .step" + pos.toString()).dataset.micro)) / (bpm * baseVal));
            } else {
                document.querySelector("#seq-row-" + row.toString() + " .step" + pos.toString()).textContent = 'X';
            }
        }
    }
    pos++;

    if (pos > maxPos) {
        pos = 1;
        document.querySelectorAll(".step" + maxPos.toString()).forEach((element) => toggleColor(element, "yellow", "lawngreen"));
    }
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

function initializeRow(row) {

    let clone = document.querySelector("#seq-row-" + row.toString()).cloneNode(true);
    for (let i = 1; i <= maxPos; i++) {
        clone.querySelector(".steps .step" + i.toString()).textContent = "";
    }
    document.querySelector("#pattern").replaceChild(clone, document.querySelector("#seq-row-" + row.toString()));

    // Make all buttons inactive before doing anything

    document.querySelector("#seq-row-" + row.toString() + " .row-clear").style.backgroundColor = "gray";
    document.querySelector("#seq-row-" + row.toString() + " .mute").style.backgroundColor = "gray";
    document.querySelector("#seq-row-" + row.toString() + " .solo").style.backgroundColor = "gray";

    for (let step = 1; step <= maxPos; step++) {
        document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).style.backgroundColor = "darkgray";
        document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).style.border = "";
        document.querySelector("#seq-row-" + row.toString() + " .step" + step.toString()).style.color = "#7F0000";
        document.querySelector("#seq-row-" + row.toString() + " .step" + step.toString()).style.fontWeight = "bolder";

        // Enable Toggling Steps
        document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).addEventListener('dblclick', function toggleStep() {

            toggleColor(this, "lawngreen", "darkgray");

            if (this.textContent === "") {
                this.textContent = document.querySelector("#seq-row-" + row.toString() + " .step" + step.toString()).dataset.sub;
            } else {this.textContent = "";}

            if (this.getAttribute("data-active") === "no") {
                this.setAttribute("data-active", "yes");
            } else if (this.getAttribute("data-active") === "yes") {
                this.setAttribute("data-active", "no");
            }
        });


        // Enable Selecting Steps, and then interacting with their values
        document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).addEventListener('click', function selectStep() {

            document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).style.border = "3px black solid";

            if (lastSelection) {
                lastSelection.style.border = "";
            }

            lastSelection = document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString());


            document.querySelector("#ac").value = document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).dataset.acc;
            document.querySelector("#cond").value = document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).dataset.cond;
            document.querySelector("#sub").value = document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).dataset.sub;
            document.querySelector("#micro").value = document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).dataset.micro;

            document.querySelector("#ac").onchange = function () {
                document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).dataset.acc = document.querySelector("#ac").value.toString();
                document.querySelector("#seq-row-" + row.toString() + " .step" + step.toString()).style.color = "#" + Math.floor(Number(document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).dataset.acc) * 255).toString(16) + "0000";
            }
            document.querySelector("#cond").onchange = function () {
                document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).dataset.cond = document.querySelector("#cond").value.toString();
            }
            document.querySelector("#sub").onchange = function () {
                document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).dataset.sub = document.querySelector("#sub").value.toString();
                document.querySelector("#seq-row-" + row.toString() + " .step" + step.toString()).textContent = document.querySelector("#seq-row-" + row.toString() + " .step" + step.toString()).dataset.sub;
            }
            document.querySelector("#micro").onchange = function () {
                document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).dataset.micro = document.querySelector("#micro").value.toString();
                document.querySelector("#seq-row-" + row.toString() + " .step" + step.toString()).style.paddingLeft = (5 + Number(document.querySelector("#seq-row-" + row.toString() + " .steps .step" + step.toString()).dataset.micro) * 10).toString() + "px";
            }

            if (this.style.backgroundColor === "darkgray") {
                document.querySelector("#ac").value = "0.5"
                document.querySelector("#cond").value = "1.0"
                document.querySelector("#sub").value = "1"
                document.querySelector("#micro").value = "0.00"
                document.querySelector("#seq-row-" + row.toString() + " .step" + step.toString()).dataset.acc = "0.5"
                document.querySelector("#seq-row-" + row.toString() + " .step" + step.toString()).dataset.cond = "1.0"
                document.querySelector("#seq-row-" + row.toString() + " .step" + step.toString()).dataset.sub = "1"
                document.querySelector("#seq-row-" + row.toString() + " .step" + step.toString()).dataset.micro = "0.00"
            }
        });
    }

    // Enable Row Clear
    document.querySelector("#seq-row-" + row.toString() + " .row-clear").addEventListener('click', function rowClear() {
        for (let step = 1; step <= maxPos; step++) {
            document.querySelector("#seq-row-" + this.textContent + " .steps .step" + step.toString()).style.backgroundColor = "darkgray";
            document.querySelector("#seq-row-" + this.textContent + " .steps .step" + step.toString()).textContent = "";
        }
    });

    // Enable Loading Samples
    let $audio = $('#audio-' + row.toString());
    $('#inst-' + row.toString()).on('change', function (e) {
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
    document.querySelector("#inst-" + row.toString()).addEventListener('change', function displaySample() {
        this.parentNode.querySelector("label[id^='new-inst-']").textContent = document.querySelector("#inst-" + row.toString()).value.replace("C:\\fakepath\\", "");
    });

    // Enable Mute Function
    document.querySelector("#seq-row-" + row.toString() + " .mute").addEventListener('click', function muteRow()  {
        toggleColor(this, "red", "gray");
        document.querySelector("#audio-" + row.toString()).muted = this.style.backgroundColor === "red";
    });

    // Enable Solo Function
    document.querySelector("#seq-row-" + row.toString() + " .solo").addEventListener('click', function soloRow() {
        toggleColor(this, "orange", "gray");

        if (this.style.backgroundColor === "orange") {
            let otherRows = [...Array(totalRow).keys()].map((element) => element + 1).filter(function(x) { return x !== row; });
            for (let i = 0; i < otherRows.length; i++) {
                document.querySelector("#seq-row-" + otherRows[i].toString() + " .solo").style.backgroundColor = "gray";
                document.querySelector("#seq-row-" + otherRows[i].toString() + " .mute").style.backgroundColor = "red";
                document.querySelector("#audio-" + otherRows[i].toString()).muted = true;
            }
            document.querySelector("#seq-row-" + row.toString() + " .mute").style.backgroundColor = "gray";
            document.querySelector("#audio-" + row.toString()).muted = false;
        } else {
            for (let i = 1; i <= totalRow; i++) {
                document.querySelector("#seq-row-" + i.toString() + " .solo").style.backgroundColor = "gray";
                document.querySelector("#seq-row-" + i.toString() + " .mute").style.backgroundColor = "gray";
                document.querySelector("#audio-" + i.toString()).muted = false;
            }
        }
    });
}


window.onload = function (){
    initializeRow(1);
}

/* Navigation Bar */

// Erase all pattern (Nuke)
document.querySelector("#nuke-all").addEventListener('click', function nukeAll() {
    let nukeConfirm = confirm("This will ERASE ALL patterns. Are you really sure?");
    if (nukeConfirm === true) {
        document.querySelectorAll(".steps button").forEach((element) => element.style.backgroundColor = "darkgray");
        document.querySelectorAll(".steps button").forEach((element) => element.dataset.acc = "0.5");
        document.querySelectorAll(".steps button").forEach((element) => element.dataset.cond = "1.0");
        document.querySelectorAll(".steps button").forEach((element) => element.dataset.sub = "1");
        document.querySelectorAll(".steps button").forEach((element) => element.dataset.micro = "0.0");

        document.querySelector("#ac").value = "0.5"
        document.querySelector("#cond").value = "1.0"
        document.querySelector("#sub").value = "1"
        document.querySelector("#micro").value = "0.0"
        document.querySelectorAll(".steps button").forEach((element) => element.textContent = "")
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

    initializeRow(totalRow);

});

// Remove the lowermost instrument
document.querySelector("#del-inst").addEventListener('click', function delInst() {
    if (totalRow > 1) {
        document.querySelector("#seq-row-" + totalRow.toString()).remove();
        totalRow--;
    }
});

// Add Column
document.querySelector("#add-col").addEventListener('click', function addCol() {

    maxPos ++;

    for (let row = 1; row <= totalRow; row++) {

        if (maxPos % baseVal === 1) {
            let divider = document.querySelector("#unique-divider").cloneNode(true);
            divider.removeAttribute("id");
            divider.setAttribute("class", "divider");
            document.querySelector("#seq-row-" + row.toString() + " .steps").appendChild(divider);
        }

        let newStep = document.querySelector(".step1").cloneNode(true);
        newStep.setAttribute("class", "step" + maxPos.toString());
        document.querySelector("#seq-row-" + row.toString() + " .steps").appendChild(newStep);

    }

    for (let i = 1; i <= totalRow; i++) {
        initializeRow(i);
    }

});

// Remove Column
document.querySelector("#del-col").addEventListener('click', function delCol() {
    if (maxPos > 1) {
        maxPos--;
        for (let row = 1; row <= totalRow; row++) {
            document.querySelector("#seq-row-" + row.toString() + " .steps").removeChild(document.querySelector("#seq-row-" + row.toString() + " .steps").lastElementChild);
            if (document.querySelector("#seq-row-" + row.toString() + " .steps").lastElementChild.textContent === "⎮") {
                document.querySelector("#seq-row-" + row.toString() + " .steps").removeChild(document.querySelector("#seq-row-" + row.toString() + " .steps").lastElementChild);
            }
            for (let i = 1; i <= totalRow; i++) {
                initializeRow(i);
            }
        }
    }
});


// Set BPM
document.querySelector("#bpm-label").addEventListener('input', function setBPM() {
    if (document.querySelector("#bpm").value > 0) {
        bpm = document.querySelector("#bpm").value
        clearInterval(intervalId);
        intervalId = setInterval(toggleColumn, 60000 / (bpm * baseVal));
    } else {
        alert("BPM must be higher than 0!");
        document.querySelector("#bpm").value = ""
        clearInterval(intervalId);
    }
});

// Play through pattern / Trigger Steps
document.querySelector("#play-all").onclick = function playPattern() {

    toggleColor(this, "lawngreen", "gray");

    if (this.style.backgroundColor === "lawngreen") {
        intervalId = setInterval(toggleColumn, 60000 / (bpm * baseVal));
    } else {clearInterval(intervalId);}

}

// Signature Change
document.querySelector("#beat").onchange = function beatChange() {

    baseVal = Number(this.value);
    let divider = document.querySelector(".divider").cloneNode(true);
    $(".divider").remove();

    for (let row = 1; row <= totalRow; row++) {
        for (let step = 1; step <= maxPos; step++) {
            if (step % baseVal === 0) {
                let dividerClone = divider.cloneNode(true);
                $(dividerClone).insertAfter("#seq-row-" + row.toString() + " .steps .step" + step.toString())
            }
        }
        initializeRow(row);
    }
}

// Emergency Stop (Work in Progress)
document.querySelector("#stop").onclick = function emergencyStop() {

}