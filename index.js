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
        for (let i = (document.getElementById("grid-container").length - 1); i > 0; i--) {
            document.getElementById('seq-row-' + i.toString()).remove();
        }
    }
}

function addRow() {
    let new_row = document.querySelector("#row-template").content;
    new_row.id = "seq-row-" + (document.getElementById("grid-container").length - 1).toString();
    let targetContainer = document.querySelector('#grid-container');
    targetContainer.appendChild(document.importNode(new_row, true));
}

function togglePattern() {
    if (document.getElementById('play-all').style.backgroundColor === "lawngreen") {
        document.getElementById('play-all').style.backgroundColor = "gray";
    } else document.getElementById('play-all').style.backgroundColor = "lawngreen";
}


function changeConditionalIcon() {
    document.getElementById('conditional').textContent = ['⚀COND', '⚁COND', '⚂COND', '⚃COND', '⚄COND', '⚅COND'][Math.floor(6 * Math.random())];
}