let totalRow= 1; // Number of seq-rows (Global)
let baseVal = 4; // Time Signature
let bpm = 120; // BPM (Global)
let pos = 1; // Current Position
let maxPos = 16; // maximum position (per pattern)
let maxPosAll = 16; //maximum position across all pages
let intervalId; // BPM interval (in timeout form)
let lastSelection;
let kbMode= false; // Keyboard Navigation Mode
let currentKBLocation = null; // Keyboard Cursor Location : Normally Array([row,col])
let currentPage = 1; // Current Page
let pageCount = 1; // Pattern Count
let loadedProject;
let coll = document.getElementsByClassName("collapsible");

/* Commonly Used Functions */

function toggleColor(current, active, inactive) {
    if (current.style.backgroundColor === active) {
        current.style.backgroundColor = inactive;
    } else if (current.style.backgroundColor === inactive) {
        current.style.backgroundColor = active;
    }
}

let convertStringToHTML = function (str) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, 'text/html');
    return doc.body;
};


// Toggle Column
function toggleColumn() {

    let tempPos= pos;

    for (let row = 1; row <= totalRow; row++) {

        let current_step = document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .step" + tempPos.toString());

        document.querySelector("#accent").style.backgroundColor = "gray";
        document.querySelector("#tempo").style.backgroundColor = "gray";
        document.querySelector("#page_right").style.backgroundColor = "gray";
        document.querySelector("#conditional").style.backgroundColor = "gray";

        if (pos === 1) {
            document.querySelector("#tempo").style.backgroundColor = "orange";
            document.querySelector("#page_right").style.backgroundColor = "orange";
        } else if (pos % baseVal === 1) {
            document.querySelector("#tempo").style.backgroundColor = "orange";
        }

        if (current_step.dataset.active === "yes") {
            if (Math.random() < current_step.dataset.cond) {
                current_step.textContent = current_step.dataset.sub;
                document.querySelector("#audio-" + row.toString()).volume = Number(current_step.dataset.acc);
                setTimeout(function () {
                    for (let sub = 1; sub <= Number(current_step.dataset.sub); sub++) {
                        setTimeout(function () {
                            toggleColor(document.querySelector("#accent"), "#" + Math.floor(Number(current_step.dataset.acc) * 255).toString(16) + "0000", "gray");
                            toggleColor(document.querySelector("#seq-row-" + row.toString() + "-" + currentPage.toString()  + " .row-clear"), 'yellow', 'gray');
                            toggleColor(current_step, 'yellow', 'lawngreen');
                            document.querySelector("#audio-" + row.toString()).currentTime = 0;
                            document.querySelector("#audio-" + row.toString()).play()
                        }, 60000 / (bpm * baseVal * sub));
                        toggleColor((document.querySelector("#seq-row-" + row.toString() + "-" + currentPage.toString()  + " .row-clear")), 'yellow', 'gray');
                        toggleColor(current_step, 'yellow', 'lawngreen');
                    }
                }, (60000 * Number(current_step.dataset.micro)) / (bpm * baseVal));
            } else {
                document.querySelector("#conditional").style.backgroundColor = "orange";
                current_step.textContent = "X";
            }
        }
    }

    pos++;

    if (pos > maxPos) {
        pos = 1;
    }
}

// Toggle Column (Through All Pages)
function toggleColumnAll() {

    let tempPos= pos;
    let tempPage = currentPage;

    for (let row = 1; row <= totalRow; row++) {

        let current_step = document.querySelector("#pattern-" + tempPage.toString() + " #seq-row-" + row.toString() + "-" + tempPage.toString() + " .step" + tempPos.toString());

        document.querySelector("#accent").style.backgroundColor = "gray";
        document.querySelector("#tempo").style.backgroundColor = "gray";
        document.querySelector("#page_right").style.backgroundColor = "gray";
        document.querySelector("#conditional").style.backgroundColor = "gray";

        if (pos === 1) {
            document.querySelector("#tempo").style.backgroundColor = "orange";
            document.querySelector("#page_right").style.backgroundColor = "orange";
        } else if (pos % baseVal === 1) {
            document.querySelector("#tempo").style.backgroundColor = "orange";
        }

        if (current_step.dataset.active === "yes") {
            if (Math.random() < current_step.dataset.cond) {
                current_step.textContent = current_step.dataset.sub;
                document.querySelector("#audio-" + row.toString()).volume = Number(current_step.dataset.acc);
                setTimeout(function () {
                    for (let sub = 1; sub <= Number(current_step.dataset.sub); sub++) {
                        setTimeout(function () {
                            toggleColor(document.querySelector("#accent"), "#" + Math.floor(Number(current_step.dataset.acc) * 255).toString(16) + "0000", "gray");
                            toggleColor(document.querySelector("#seq-row-" + row.toString() + "-" + tempPage.toString()  + " .row-clear"), 'yellow', 'gray');
                            toggleColor(current_step, 'yellow', 'lawngreen');
                            document.querySelector("#audio-" + row.toString()).currentTime = 0;
                            document.querySelector("#audio-" + row.toString()).play()
                        }, 60000 / (bpm * baseVal * sub));
                        toggleColor((document.querySelector("#seq-row-" + row.toString() + "-" + tempPage.toString()  + " .row-clear")), 'yellow', 'gray');
                        toggleColor(current_step, 'yellow', 'lawngreen');
                    }
                }, (60000 * Number(current_step.dataset.micro)) / (bpm * baseVal));
            } else {
                document.querySelector("#conditional").style.backgroundColor = "orange";
                current_step.textContent = "X";
            }
        }
    }

    pos++;

    if (pos > maxPos) {
        currentPage++;
        pos = 1;
        for (let page = 1; page <= pageCount; page++) {
            $("#pattern-" + page.toString()).addClass("invisible");
        }
        $("#pattern-" + currentPage.toString()).removeClass("invisible");
    }

    if (currentPage > pageCount) {
        currentPage = 1;
        pos = 1;
        for (let page = 1; page <= pageCount; page++) {
            $("#pattern-" + page.toString()).addClass("invisible");
        }
        $("#pattern-1".toString()).removeClass("invisible");
    }

    document.querySelector("#subptn").value = currentPage.toString();

}


/* Initialize Nav Bar */

document.querySelector("#play-all").style.backgroundColor = "gray";
document.querySelector("#loop").style.backgroundColor = "gray";
document.querySelectorAll(".nav-utils > *").forEach((element) => element.style.backgroundColor = "gray")
document.querySelector("#file-name").addEventListener('blur', function changeFileName () {
    document.querySelector("#project").dataset.name =  document.querySelector("#file-name").value;
});

// Upload Pattern

document.querySelector("#upload-input").onchange = function replaceProject() {

    let file = document.querySelector("#upload-input").files[0];
    const projectReader = new FileReader();
    projectReader.onload = () => {

        loadedProject = convertStringToHTML(projectReader.result).querySelector("#project");

        bpm = Number(loadedProject.dataset.tempo);
        baseVal = Number(loadedProject.dataset.sign);
        document.querySelector("#bpm").value = loadedProject.dataset.tempo;
        document.querySelector("#beat").value = loadedProject.dataset.sign;
        pageCount = loadedProject.children.length;
        maxPos = Number(loadedProject.dataset.steps);
        maxPosAll = pageCount * maxPos;
        document.querySelector("#project").dataset.name =  loadedProject.dataset.name;
        totalRow = loadedProject.querySelector("#pattern-1").children.length;

        document.querySelector("#grid-container").replaceChild(loadedProject, document.querySelector("#project"));

        for (let page = 1; page <= pageCount; page++) {
            $("#pattern-" + page.toString()).addClass("invisible");
            for (let row = 1; row <= totalRow; row++) {
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " #audio-" + row.toString()).setAttribute("src", "");
                initializeRow(page, row);
            }
        }
        $("#pattern-1").removeClass("invisible");

        document.querySelector("#file-name").value = document.querySelector("#project").dataset.name;
        document.querySelector("#subptn").value = 1;
        currentPage = 1;
        pos = 1;
        lastSelection = null;
        clearInterval(intervalId);
    };
    projectReader.readAsText(file);
}

document.querySelector("#upload").addEventListener('click', function uploadProject() {
    document.querySelector("#upload-input").click()
});

// Download pattern (as HTML)

function downloadInnerHtml(filename, elId, mimeType) {
    let elHtml = document.getElementById(elId).innerHTML;
    let link = document.createElement('a');
    mimeType = mimeType || 'text/plain';

    link.setAttribute('download', filename);
    link.setAttribute('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(elHtml));
    link.click();
}

$('#downloadLink').click(function(){
    downloadInnerHtml("BDv1 - " + document.querySelector("#project").dataset.name, 'grid-container','text/html');
});
document.querySelector("#download").addEventListener('click', function downloadPattern () {
    document.querySelector("#downloadLink").click();
});

/* Initialize Row (for the subsequent sequencer rows) */

function clearRow(page, row) {
    for (let step = 1; step <= maxPos; step++) {
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).style.backgroundColor = "darkgray";
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).textContent = "";
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).style.color = "#7f0000";
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).style.paddingLeft = "5px";
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.active = "no";
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.acc = "0.5"
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.cond = "1.0"
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.sub = "1"
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.micro = "0.00"
    }
}

function initializeRow(page, row) {

    let clone = document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()).cloneNode(true);
    for (let i = 1; i <= maxPos; i++) {
        clone.querySelector(".steps .step" + i.toString()).textContent = "";
    }

    document.querySelector("#pattern-" + page.toString()).replaceChild(clone, document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()));

    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .row-clear").style.backgroundColor = "gray";
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .mute").style.backgroundColor = "gray";
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .solo").style.backgroundColor = "gray";

    for (let step = 1; step <= maxPos; step++) {

        if (document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.active === "yes") {
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).style.backgroundColor = "lawngreen";
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).style.color = "#" + Math.floor(Number(document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.acc) * 255).toString(16) + "0000";
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).style.paddingLeft = (5 + Number(document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.micro) * 10).toString() + "px";
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).textContent = document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.sub;

        } else {
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).style.backgroundColor = "darkgray"
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).style.color = "#7f0000";
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).style.paddingLeft = (5 + Number(document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.micro) * 10).toString() + "px";
        }

        // Enable Toggling Steps
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).addEventListener('click', function toggleStep() {

            toggleColor(this, "lawngreen", "darkgray");

            if (this.textContent === "") {
                this.textContent = document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).dataset.sub;
            } else {
                this.textContent = "";
            }

            if (this.getAttribute("data-active") === "no") {
                this.setAttribute("data-active", "yes");
            } else if (this.getAttribute("data-active") === "yes") {
                this.setAttribute("data-active", "no");
            }

            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).style.border = "3px black solid";

            if (lastSelection) {
                lastSelection.style.border = "";
            }

            lastSelection = document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString());


            document.querySelector("#ac").value = document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.acc;
            document.querySelector("#cond").value = document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.cond;
            document.querySelector("#sub").value = document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.sub;
            document.querySelector("#micro").value = document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.micro;

            document.querySelector("#ac").onchange = function () {
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.acc = document.querySelector("#ac").value.toString();
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).style.color = "#" + Math.floor(Number(document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.acc) * 255).toString(16) + "0000";
            }
            document.querySelector("#cond").onchange = function () {
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.cond = document.querySelector("#cond").value.toString();
            }
            document.querySelector("#sub").onchange = function () {
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.sub = document.querySelector("#sub").value.toString();
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).textContent = document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).dataset.sub;
            }
            document.querySelector("#micro").onchange = function () {
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.micro = document.querySelector("#micro").value.toString();
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).style.paddingLeft = (5 + Number(document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.micro) * 10).toString() + "px";
            }

            if (this.style.backgroundColor === "darkgray") {
                document.querySelector("#ac").value = "0.5"
                document.querySelector("#cond").value = "1.0"
                document.querySelector("#sub").value = "1"
                document.querySelector("#micro").value = "0.00"
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).dataset.acc = "0.5"
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).dataset.cond = "1.0"
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).dataset.sub = "1"
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).dataset.micro = "0.00"
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).style.color = "#7f0000";
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .step" + step.toString()).style.paddingLeft = "5px";

            }
        });
    }

    // Enable Row Clear
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .row-clear").addEventListener('click', function rowClear() {
        for (let step = 1; step <= maxPos; step++) {
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + this.textContent + "-" + page.toString() + " .steps .step" + step.toString()).style.backgroundColor = "darkgray";
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + this.textContent + "-" + page.toString() + " .steps .step" + step.toString()).textContent = "";
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + this.textContent + "-" + page.toString() + " .steps .step" + step.toString()).dataset.active = "no"
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
    document.querySelector("#pattern-" + page.toString() + " #inst-" + row.toString()).addEventListener('change', function displaySample() {
        this.parentNode.querySelector("label[id^='new-inst-']").textContent = document.querySelector("#pattern-" + page.toString() + " #inst-" + row.toString()).value.replace("C:\\fakepath\\", "");
    });

    // Enable Mute Function
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .mute").addEventListener('click', function muteRow() {
        toggleColor(this, "red", "gray");
        document.querySelector("#pattern-" + page.toString() + " #audio-" + row.toString()).muted = this.style.backgroundColor === "red";
    });

    // Enable Solo Function
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .solo").addEventListener('click', function soloRow() {

        toggleColor(this, "orange", "gray");

        if (this.style.backgroundColor === "orange") {
            let otherRows = [...Array(totalRow).keys()].map((element) => element + 1).filter(function (x) {
                return x !== row;
            });
            for (let i = 0; i < otherRows.length; i++) {
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + otherRows[i].toString() + "-" + page.toString() + " .solo").style.backgroundColor = "gray";
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + otherRows[i].toString() + "-" + page.toString() + " .mute").style.backgroundColor = "red";
                document.querySelector("#pattern-" + page.toString() + " #audio-" + otherRows[i].toString()).muted = true;
            }
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .mute").style.backgroundColor = "gray";
            document.querySelector("#pattern-" + page.toString() + " #audio-" + row.toString()).muted = false;
        } else {
            for (let i = 1; i <= totalRow; i++) {
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + i.toString() + "-" + page.toString() + " .solo").style.backgroundColor = "gray";
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + i.toString() + "-" + page.toString() + " .mute").style.backgroundColor = "gray";
                document.querySelector("#pattern-" + page.toString() + " #audio-" + i.toString()).muted = false;
            }
        }
    });

    // Audition samples
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .continue").onclick = function auditionSample() {
        document.querySelector("#audio-" + row.toString()).currentTime = 0;
        document.querySelector("#audio-" + row.toString()).play()
    }
}

window.onload = function (){
    initializeRow(1, 1);
    document.querySelector("#subptn").value = 1
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
        document.querySelectorAll(".steps button").forEach((element) => element.dataset.active = "no");

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
    totalRow++;
    for (let page = 1; page <= pageCount; page++) {
        let new_row = document.querySelector("#seq-row-1-1").cloneNode(true);
        new_row.setAttribute("id", "seq-row-" + totalRow.toString() + "-" + page.toString());
        new_row.querySelector(".row-clear").textContent = totalRow.toString();
        new_row.querySelector("label").setAttribute("for", "inst-" + totalRow.toString());
        new_row.querySelector("label").setAttribute("id", "new-inst-" + totalRow.toString());
        new_row.querySelector("input").setAttribute("id", "inst-" + totalRow.toString());
        new_row.querySelector("audio").setAttribute("id", "audio-" + totalRow.toString());
        let targetContainer= document.querySelector('#pattern-' + page.toString());
        targetContainer.appendChild(document.importNode(new_row, true));
        initializeRow(page, totalRow);
        clearRow(page, totalRow);
    }
});

// Remove the lowermost instrument
document.querySelector("#del-inst").addEventListener('click', function delInst() {
    if (totalRow > 1) {
        for (let page = 1; page <= pageCount; page++) {
            document.querySelector("#seq-row-" + totalRow.toString() + "-" + page.toString()).remove();
        }
        totalRow--;
    }
});

// Add Column
document.querySelector("#add-col").addEventListener('click', function addCol() {

    maxPos ++;
    document.querySelector("#project").dataset.step = maxPos.toString();

    for (let page = 1; page <= pageCount; page++) {
        for (let row = 1; row <= totalRow; row++) {

            if (maxPos % baseVal === 1) {
                let divider = document.querySelector("#unique-divider").cloneNode(true);
                divider.removeAttribute("id");
                divider.setAttribute("class", "divider");
                document.querySelector("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps").appendChild(divider);
            }

            let newStep = document.querySelector(".step-").cloneNode(true);
            newStep.setAttribute("style","display : inline");
            newStep.setAttribute("class", "step" + maxPos.toString());
            document.querySelector("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps").appendChild(newStep);

            initializeRow(page, row);
        }
    }
});

// Remove Column
document.querySelector("#del-col").addEventListener('click', function delCol() {
    if (maxPos > 1) {
        maxPos--;
        document.querySelector("#project").dataset.step = maxPos.toString();
        for (let page = 1; page <= pageCount; page++) {
            for (let row = 1; row <= totalRow; row++) {
                if (document.querySelector("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps").lastElementChild.textContent === "⎮") {
                    document.querySelector("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps").removeChild(document.querySelector("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps").lastElementChild);
                }
                document.querySelector("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps").removeChild(document.querySelector("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps").lastElementChild);
            }
        }
    }
});


// Set BPM
document.querySelector("#bpm-label").addEventListener('input', function setBPM() {
    if (document.querySelector("#bpm").value > 0) {
        bpm = document.querySelector("#bpm").value
        document.querySelector("#project").dataset.tempo = bpm.toString();
        clearInterval(intervalId);
        if (document.querySelector("#play-all").style.backgroundColor === "lawngreen") {
            intervalId = setInterval(toggleColumnAll, 60000 / (bpm * baseVal));
        }
    } else {
        alert("BPM must be higher than 0!");
        document.querySelector("#bpm").value = ""
        clearInterval(intervalId);
    }
});

// Play through whole project
document.querySelector("#play-all").onclick = function playPattern() {

    toggleColor(this, "lawngreen", "gray");

    if (document.querySelector("#loop").style.backgroundColor === "lawngreen") {
        document.querySelector("#loop").style.backgroundColor = "gray"
    }

    if (this.style.backgroundColor === "lawngreen") {
        clearInterval(intervalId);
        pos = 1;
        currentPage = 1;
        for (let page = 1; page <= pageCount; page++) {
            $("#pattern-" + page.toString()).addClass("invisible");
        }
        $("#pattern-1").removeClass("invisible");
        document.querySelector("#subptn").value = "1"
        intervalId = setInterval(toggleColumnAll, 60000 / (bpm * baseVal));
    } else {clearInterval(intervalId);}
}

// Loop through one pattern
document.querySelector("#loop").onclick = function loopPattern() {

    toggleColor(this, "lawngreen", "gray");

    if (document.querySelector("#play-all").style.backgroundColor === "lawngreen") {
        document.querySelector("#play-all").style.backgroundColor = "gray"
    }

    if (this.style.backgroundColor === "lawngreen") {
        clearInterval(intervalId);
        pos = 1;
        intervalId = setInterval(toggleColumn, 60000 / (bpm * baseVal));
    } else {clearInterval(intervalId);}
}

// Signature Change
document.querySelector("#beat").onchange = function beatChange() {

    baseVal = Number(this.value);
    document.querySelector("#project").dataset.sign = baseVal.toString();

    let divider = document.querySelector(".divider").cloneNode(true);
    $(".divider").remove();

    for (let page = 1; page <= pageCount; page++) {
        for (let row = 1; row <= totalRow; row++) {
            for (let step = 1; step <= maxPos; step++) {
                if (step % baseVal === 0) {
                    let dividerClone = divider.cloneNode(true);
                    $(dividerClone).insertAfter("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps .step" + step.toString());
                }
            }
        }
    }
}


document.querySelector("#page_left").onclick = function pageLeft() {
    if (currentPage > 1 && document.querySelector("#subptn").value !== null) {
        for (let page = 1; page <= pageCount; page++) {
            $("#pattern-" + page.toString()).addClass("invisible");
        }
        $("#pattern-" + (Number(document.querySelector("#subptn").value) - 1).toString()).removeClass("invisible");
        document.querySelector("#subptn").value = (Number(document.querySelector("#subptn").value) - 1).toString();
        currentPage--;
    } else {
        alert("No more pages to load!");
    }
}

document.querySelector("#page_right").onclick = function pageRight() {
    if (Number(document.querySelector("#subptn").value) < pageCount && document.querySelector("#subptn").value !== null) {
        for (let page = 1; page <= pageCount; page++) {
            $("#pattern-" + page.toString()).addClass("invisible");
        }
        $("#pattern-" + (Number(document.querySelector("#subptn").value) + 1).toString()).removeClass("invisible");
        document.querySelector("#subptn").value = (Number(document.querySelector("#subptn").value) + 1).toString();
        currentPage++;
    } else {
        alert("No more pages to load!");
    }
}

document.querySelector("#add-page").onclick = function addPage() {
    let newPtn = document.querySelector("#pattern-" + pageCount).cloneNode(true);
    pageCount++;
    currentPage++;
    maxPosAll = maxPos * pageCount;
    newPtn.setAttribute("id", "pattern-" + pageCount);
    for (let row = 1; row <= totalRow; row++) {
        newPtn.querySelector("#seq-row-" + row.toString() + "-" + (pageCount - 1).toString()).setAttribute("id", "seq-row-" + row.toString() + "-" + pageCount.toString());
    }
    let targetContainer= document.querySelector('#project');
    targetContainer.appendChild(document.importNode(newPtn, true));


    for (let row = 1; row <= totalRow; row++) {
        document.querySelector("#new-inst-" + row.toString()).textContent = document.querySelector("#pattern-1" + " #inst-" + row.toString()).value.replace("C:\\fakepath\\", "");
        initializeRow(pageCount, row);
    }

    for (let page = 1; page <= pageCount; page++) {
        $("#pattern-" + page.toString()).addClass("invisible");
        for (let row = 1; row <= totalRow; row++) {
            document.querySelectorAll(".continue").forEach((element) => element.textContent = ">");
            document.querySelectorAll(".continue").forEach((element) => element.style.backgroundColor = "lawngreen");
        }
    }
    $("#pattern-" + pageCount).removeClass("invisible");

    for (let row = 1; row <= totalRow; row++) {
        document.querySelector("#seq-row-" + row.toString() + "-" + pageCount.toString() + " .continue").textContent = "<";
        document.querySelector("#seq-row-" + row.toString() + "-" + pageCount.toString() + " .continue").style.backgroundColor = "red";
    }

    document.querySelector("#subptn").value = pageCount.toString();

}

document.querySelector("#del-page").onclick = function delPage() {
    if (pageCount > 1) {
        pageCount--;
        maxPosAll = maxPosAll * pageCount;
        pos = 1;
        document.querySelector("#project").removeChild(document.querySelector("#project").lastElementChild);
        for (let page = 1; page <= pageCount; page++) {
            $("#pattern-" + page.toString()).addClass("invisible");
            for (let row = 1; row <= totalRow; row++) {
                document.querySelectorAll(".continue").forEach((element) => element.textContent = ">");
                document.querySelectorAll(".continue").forEach((element) => element.style.backgroundColor = "lawngreen");
            }
        }
        if (Number(document.querySelector("#subptn").value) === pageCount) {
            $("#pattern-1").removeClass("invisible");
            document.querySelector("#subptn").value = "1";
            currentPage = 1;
        } else {
            $("#pattern-" + pageCount.toString()).removeClass("invisible");
        }
        for (let row = 1; row <= totalRow; row++) {
            document.querySelector("#seq-row-" + row.toString() + "-" + pageCount.toString() + " .continue").textContent = "<";
            document.querySelector("#seq-row-" + row.toString() + "-" + pageCount.toString() + " .continue").style.backgroundColor = "red";
        }
    } else {
        alert("Cannot delete Page 1!");
    }
}

document.querySelector("#subptn").onchange = function pageNav() {
    if (this.value > 0 && this.value < pageCount) {
        currentPage = Number(this.value);
        for (let page = 1; page <= pageCount; page++) {
            $("#pattern-" + page.toString()).addClass("invisible");
        }
        $("#pattern-" + Number(this.value)).removeClass("invisible");
    } else {
        alert("Page out of bounds!")
    }
}

for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        let content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}

// Keyboard Input Support

// Keyboard input support
document.addEventListener('keydown', function kbControl(event) {

    if (kbMode === false && event.key === "k") {
        kbMode = true;
        document.querySelector("#kb-indicator").textContent = "ON";
        document.querySelector("#kb-indicator").style.color = "red";
    } else if (kbMode === true && event.key === "k") {
        kbMode = false;
        document.querySelector("#kb-indicator").textContent = "OFF";
        document.querySelector("#kb-indicator").style.color = "black";
    }

    if (kbMode === true) {
        if (currentKBLocation === null) {
            currentKBLocation = [1,1];
        } else if (currentKBLocation[1] > 1 && event.key === "ArrowLeft") {
            currentKBLocation[1]--;
        }  else if (currentKBLocation[1] < maxPos && event.key === "ArrowRight") {
            currentKBLocation[1]++;
        } else if (currentKBLocation[0] > 1 && event.key === "ArrowUp") {
            currentKBLocation[0]--;
        } else if (currentKBLocation[0] < totalRow && event.key === "ArrowDown") {
            currentKBLocation[0]++;
        }
        document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + currentKBLocation[0].toString() + "-" + currentPage.toString() + " .step" + (currentKBLocation[1]).toString()).focus();

        if (currentKBLocation !== null && event.key === "Space") {
            document.activeElement.click();
        }

        if (event.key === "p") {
            document.querySelector("#play-all").click();
        }

        if (event.key === "o") {
            document.querySelector("#loop").click();
        }

        if (event.key === "m") {
            document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + currentKBLocation[0].toString() + "-" + currentPage.toString() + " .mute").click()
        }

        if (event.key === "s") {
            document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + currentKBLocation[0].toString() + "-" + currentPage.toString() + " .solo").click()
        }

        if (event.key === "l") {
            document.querySelector("#new-inst-" + currentKBLocation[0].toString()).click();
        }

        if (event.key === "=") {
            document.querySelector("#add-inst").click();
        }

        if (event.key === "-") {
            document.querySelector("#del-inst").click();
        }

        if (event.key === "[") {
            document.querySelector("#del-col").click();
        }

        if (event.key === "]") {
            document.querySelector("#add-col").click();
        }

        if (event.key === ",") {
            document.querySelector("#page_left").click();
        }

        if (event.key === ".") {
            document.querySelector("#page_right").click();
        }

        if (event.key === "a") {
            document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + currentKBLocation[0].toString() + "-" + currentPage.toString() + " .continue").click();
        }

        if (event.key === "q") {
            document.querySelector("#ac").focus()
        }

        if (event.key === "w") {
            document.querySelector("#cond").focus()
        }

        if (event.key === "e") {
            document.querySelector("#sub").focus()
        }

        if (event.key === "r") {
            document.querySelector("#micro").focus()
        }

        if (event.key === "t") {
            document.querySelector("#bpm").focus()
        }

        if (event.key === "y") {
            document.querySelector("#beat").focus()
        }
    }
});