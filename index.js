let i = 0 // Number of seq-rows (Global)

// The Navigation Bar

document.getElementById('nuke-all').onclick = nukeAll;
document.getElementById('add-inst').onclick = addRow;
document.getElementById('play-all').onclick = togglePattern;

document.getElementById('conditional').onclick = changeConditionalIcon;

// The Sequencer

// Actual Functions //

function nukeAll() {
    let nuke_confirm = confirm("This will erase ALL patterns and instruments. Are you really sure?");
    if (nuke_confirm === true) {
        for (i; i >= 1; i--){
            document.querySelector('#grid-container').removeChild(document.querySelectorAll("div[id^='seq-row']")[i]);
        }
        i = 0;
    }
}

function addRow() {
    let new_row = document.querySelector("#seq-row").cloneNode(true);
    new_row.setAttribute("id", "seq-row-" + i.toString());
    let targetContainer= document.querySelector('#grid-container');
    targetContainer.appendChild(document.importNode(new_row, true));
    i++;
}

function togglePattern() {
    if (document.getElementById('play-all').style.backgroundColor === "lawngreen") {
        document.getElementById('play-all').style.backgroundColor = "gray";
    } else document.getElementById('play-all').style.backgroundColor = "lawngreen";
}


function changeConditionalIcon() {
    document.getElementById('conditional').textContent = ['⚀COND', '⚁COND', '⚂COND', '⚃COND', '⚄COND', '⚅COND'][Math.floor(6 * Math.random())];
}