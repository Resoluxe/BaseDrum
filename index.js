let totalRow= 1; // Number of seq-rows (Global)
let baseVal = 4; // Time Signature
let bpm = 120; // BPM (Global)
let pos = 1; // Current Position
let maxPos = 16; // maximum position (per pattern)
let maxPosAll = 16; //maximum position across all pages
let intervalId; // BPM interval (in timeout form)
let lastSelection;
let currentPage = 1; // Current Page
let pageCount = 1; // Pattern Count


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
                                toggleColor((document.querySelector("#seq-row-" + row.toString() + "-" + currentPage.toString()  + " .row-clear")), 'yellow', 'gray');
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
                            toggleColor((document.querySelector("#seq-row-" + row.toString() + "-" + currentPage.toString()  + " .row-clear")), 'yellow', 'gray');
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

    if (pos * currentPage > maxPosAll) {
        for (let page = 1; page <= pageCount; page++) {
            $("#pattern-" + page.toString()).addClass("invisible");
        }
        $("#pattern-1".toString()).removeClass("invisible");
        document.querySelector("#subptn").value = "1"
        currentPage = 1;
        pos = 1;
    }
    else if ((maxPosAll * currentPage) / pageCount < pos) {
        for (let page = 1; page <= pageCount; page++) {
            $("#pattern-" + page.toString()).addClass("invisible");
        }
        $("#pattern-" + (Number(document.querySelector("#subptn").value) + 1).toString()).removeClass("invisible");
        document.querySelector("#subptn").value = (Number(document.querySelector("#subptn").value) + 1).toString();
        currentPage++;
        pos = 1;
    }
}


/* Initialize Nav Bar */

document.querySelector("#play-all").style.backgroundColor = "gray";
document.querySelector("#loop").style.backgroundColor = "gray";
document.querySelectorAll(".nav-utils > *").forEach((element) => element.style.backgroundColor = "gray")
document.querySelector("#file-name").addEventListener('blur', function changeFileName () {
   document.querySelector("#project").dataset.name =  document.querySelector("#file-name").value;
});

// Upload Pattern

// Download pattern
function downloadInnerHtml(fileName, elId, mimeType) {
    let elHtml = document.getElementById(elId).innerHTML;
    let link = document.createElement('a');
    mimeType = mimeType || 'text/plain';

    link.setAttribute('download', fileName);
    link.setAttribute('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(elHtml));
    link.click();
}
$('#down-file').click(function(){
    downloadInnerHtml(document.querySelector("#file-name").value, 'index','text/html');
});

/* Initialize Row (for the subsequent sequencer rows) */

function initializeRow(page, row) {

    let clone = document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()).cloneNode(true);
    for (let i = 1; i <= maxPos; i++) {
        clone.querySelector(".steps .step" + i.toString()).textContent = "";
    }
    document.querySelector("#pattern-" + page.toString()).replaceChild(clone, document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()));

    // Make all buttons inactive before doing anything

    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()  + " .row-clear").style.backgroundColor = "gray";
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()  + " .mute").style.backgroundColor = "gray";
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()  + " .solo").style.backgroundColor = "gray";

    for (let step = 1; step <= maxPos; step++) {
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()  + " .step" + step.toString()).style.backgroundColor = "darkgray";
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()  + " .step" + step.toString()).style.border = "";
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()  + " .step" + step.toString()).style.color = "#7F0000";
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()  + " .step" + step.toString()).style.fontWeight = "bolder";
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()  + " .step" + step.toString()).dataset.active = "no";

        // Enable Toggling Steps
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()  + " .steps .step" + step.toString()).addEventListener('dblclick', function toggleStep() {

            toggleColor(this, "lawngreen", "darkgray");

            if (this.textContent === "") {
                this.textContent = document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString()  + " .step" + step.toString()).dataset.sub;
            } else {this.textContent = "";}

            if (this.getAttribute("data-active") === "no") {
                this.setAttribute("data-active", "yes");
            } else if (this.getAttribute("data-active") === "yes") {
                this.setAttribute("data-active", "no");
            }
        });


        // Enable Selecting Steps, and then interacting with their values (+ Triggers Sound)
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).addEventListener('click', function selectStep() {

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
            }

        });
    }

    // Enable Row Clear
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .row-clear").addEventListener('click', function rowClear() {
        for (let step = 1; step <= maxPos; step++) {
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + this.textContent + "-" + page.toString() + " .steps .step" + step.toString()).style.backgroundColor = "darkgray";
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + this.textContent + "-" + page.toString() + " .steps .step" + step.toString()).textContent = "";
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
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .mute").addEventListener('click', function muteRow()  {
        toggleColor(this, "red", "gray");
        document.querySelector("#pattern-" + page.toString() + " #audio-" + row.toString()).muted = this.style.backgroundColor === "red";
    });

    // Enable Solo Function
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .solo").addEventListener('click', function soloRow() {
        toggleColor(this, "orange", "gray");

        if (this.style.backgroundColor === "orange") {
            let otherRows = [...Array(totalRow).keys()].map((element) => element + 1).filter(function(x) { return x !== row; });
            for (let i = 0; i < otherRows.length; i++) {
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + otherRows[i].toString() + "-" + page.toString() + " .solo").style.backgroundColor = "gray";
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + otherRows[i].toString() + "-" + page.toString() + " .mute").style.backgroundColor = "red";
                document.querySelector("#pattern-" + page.toString() + " #audio-" + otherRows[i].toString() + "-" + page.toString()).muted = true;
            }
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .mute").style.backgroundColor = "gray";
            document.querySelector("#pattern-" + page.toString() + " #audio-" + row.toString() + "-" + page.toString()).muted = false;
        } else {
            for (let i = 1; i <= totalRow; i++) {
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + i.toString() + "-" + page.toString() + " .solo").style.backgroundColor = "gray";
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + i.toString() + "-" + page.toString() + " .mute").style.backgroundColor = "gray";
                document.querySelector("#pattern-" + page.toString() + " #audio-" + i.toString()).muted = false;
            }
        }
    });
}


window.onload = function (){
    initializeRow(1, 1);
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

    for (let page = 1; page <= pageCount; page++) {
        for (let row = 1; row <= totalRow; row++) {

            if (maxPos % baseVal === 1) {
                let divider = document.querySelector("#unique-divider").cloneNode(true);
                divider.removeAttribute("id");
                divider.setAttribute("class", "divider");
                document.querySelector("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps").appendChild(divider);
            }

            let newStep = document.querySelector(".step1").cloneNode(true);
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
        for (let page = 1; page <= pageCount; page++) {
            for (let row = 1; row <= totalRow; row++) {
                document.querySelector("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps").removeChild(document.querySelector("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps").lastElementChild);
                if (document.querySelector("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps").lastElementChild.textContent === "⎮") {
                    document.querySelector("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps").removeChild(document.querySelector("#seq-row-" + row.toString() + "-" + page.toString()  + " .steps").lastElementChild);
                }
            }
        }
    }
});


// Set BPM
document.querySelector("#bpm-label").addEventListener('input', function setBPM() {
    if (document.querySelector("#bpm").value > 0) {
        bpm = document.querySelector("#bpm").value
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

    if (this.style.backgroundColor === "lawngreen") {
        clearInterval(intervalId);
        pos = 1;
        intervalId = setInterval(toggleColumn, 60000 / (bpm * baseVal));
    } else {clearInterval(intervalId);}
}

// Signature Change
document.querySelector("#beat").onchange = function beatChange() {

    baseVal = Number(this.value);

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
    if (pageCount > 1) {
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
    if (Number(document.querySelector("#subptn").value) < pageCount) {
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
    }
    $("#pattern-" + pageCount).removeClass("invisible");
    document.querySelector("#subptn").value = pageCount.toString();

}

document.querySelector("#del-page").onclick = function delPage() {
    if (pageCount > 1) {
        pageCount--;
        maxPosAll = maxPosAll * pageCount;
        document.querySelector("#project").removeChild(document.querySelector("#project").lastElementChild);
        for (let page = 1; page <= pageCount; page++) {
            $("#pattern-" + page.toString()).addClass("invisible");
        }
        if (Number(document.querySelector("#subptn").value) === pageCount) {
            $("#pattern-1").removeClass("invisible");
            document.querySelector("#subptn").value = "1";
        } else {
            $("#pattern-" + pageCount.toString()).removeClass("invisible");
            document.querySelector("#subptn").value = pageCount.toString();
        currentPage = 1;
        }
    } else {
        alert("Cannot delete Page 1!");
    }
}

document.querySelector("#subptn").onchange = function pageNav() {
    if (this.value > 0 && this.value < pageCount) {
        for (let page = 1; page <= pageCount; page++) {
            $("#pattern-" + page.toString()).addClass("invisible");
        }
        $("#pattern-" + Number(this.value)).removeClass("invisible");
    } else {
        alert("Page out of bounds!")
    }
}