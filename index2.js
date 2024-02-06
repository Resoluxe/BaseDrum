let totalRow= 1; // Number of seq-rows (Global)
let baseVal = 4; // Time Signature
let bpm = 120; // BPM (Global)
let pos = 1; // Current Position
let maxPos = 16; // maximum position (per pattern)
let maxPosAll = 16; //maximum position across all pages
let kbMode= false; // Keyboard Navigation Mode
let currentKBLocation = null; // Keyboard Cursor Location : Normally Array([row,col])
let currentPage = 1; // Current Page
let pageCount = 1; // Pattern Count
let loadedProject;
let intervalId;
let coll = document.getElementsByClassName("collapsible");
let selectedRow = 1; // Which row to import samples to

let canvasWidth = 500;
let canvasHeight = 200;


// Implementing Web Audio API
const audioContext = new AudioContext();
let audioBuffers = [];

let visualizer = new AnalyserNode(audioContext);
visualizer.connect(audioContext.destination)

visualizer.fftSize = 2048;
const bufferLength = visualizer.frequencyBinCount;

const dataArray = new Uint8Array(bufferLength);
visualizer.getByteTimeDomainData(dataArray);

const dataArrayWave = new Uint8Array(bufferLength);
visualizer.getByteTimeDomainData(dataArrayWave);

const canvasCtx = document.querySelector("#visualizer-canvas").getContext("2d");
const canvasCtxWave = document.querySelector("#wave-canvas").getContext("2d");

canvasCtx.fillStyle = "transparent";
canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);

canvasCtxWave.fillStyle = "transparent";
canvasCtxWave.fillRect(0, 0, canvasWidth, canvasHeight);

function draw() {

    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    requestAnimationFrame(draw);

    visualizer.getByteFrequencyData(dataArray);

    const barWidth= 10;
    let barHeight;
    let x = 0;


    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 1.5;

        canvasCtx.fillStyle = `rgb(${barHeight + 100} 50 50)`;
        canvasCtx.fillRect(x, canvasHeight - barHeight / 2, barWidth, barHeight);

        x += barWidth + 1;
    }
}

function drawWave() {

    canvasCtxWave.clearRect(0, 0, canvasWidth, canvasHeight);
    requestAnimationFrame(drawWave);

    visualizer.getByteTimeDomainData(dataArray);

    canvasCtxWave.lineWidth = 2;
    canvasCtxWave.strokeStyle = "rgb(0 0 0)";
    canvasCtxWave.beginPath();

    const sliceWidth = canvasWidth / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (canvasHeight / 3);

        if (i === 0) {
            canvasCtxWave.moveTo(x, y);
        } else {
            canvasCtxWave.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtxWave.lineTo(canvasWidth, canvasHeight / 2);
    canvasCtxWave.stroke();
}

let gainNodes = [];
for (let i = 1; i <= 32; i++) {
    gainNodes[i - 1] = new GainNode(audioContext);
    gainNodes[i - 1].gain.value = 0.5;
    gainNodes[i - 1].connect(visualizer);
}

async function getFile(filepath) {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

async function setupSample(filePath) {
    return await getFile(filePath);
}

function playSample(audioBuffer, row) {
    const sampleSource = new AudioBufferSourceNode(audioContext, {
        buffer: audioBuffer,
        playbackRate : 1,
    });
    sampleSource.connect(gainNodes[row - 1]);
    sampleSource.start(0);
    return sampleSource;
}

/* Commonly Used Functions */

document.querySelector("#load-cancel").onclick = function closeDialog() {
    document.getElementById("load-dialog").close();
}

document.querySelector("#kit-cancel").onclick = function closeDialog() {
    document.getElementById("kit-dialog").close();
}

document.querySelector("#preset-cancel").onclick = function closeDialog() {
    document.getElementById("preset-dialog").close();
}

document.querySelector("#load-own").onclick = function loadSample() {
    document.querySelector("#temp-input").click();
    document.getElementById("load-dialog").close();
}

document.querySelector("#temp-input").addEventListener('change', function loadSample(e) {
    let target = e.currentTarget;
    let file = target.files[0];

    if (target.files && file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            $('#audio-' + selectedRow.toString()).attr('src', e.target.result);
        }
        reader.readAsDataURL(file);
        for (let page=1; page <= pageCount; page++) {
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + selectedRow.toString() + "-" + page.toString() + " #new-inst-" + selectedRow.toString()).textContent = target.files[0].name;
        }

    }

});

document.querySelector("#load-preset").onclick = function browsePresets() {
    document.getElementById("load-dialog").close();
    document.getElementById("preset-dialog").showModal();
}

document.querySelector("#preset-list").onchange = function loadPreset() {
    document.getElementById("preset-dialog").close();
    $('#audio-' + selectedRow.toString()).attr('src', "./presets/" + this.value + ".wav");
    for (let page=1; page <= pageCount; page++) {
        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + selectedRow.toString() + "-" + page.toString() + " #new-inst-" + selectedRow.toString()).textContent = this.value;
    }
}

document.querySelector("#load-kit").onclick = function selectKit() {
    document.getElementById("load-dialog").close();
    document.getElementById("kit-dialog").showModal();
}

document.querySelector("#kit-78").onclick = function load78() {
    document.getElementById("kit-dialog").close();
    clearInterval(intervalId)
    $.get("./patterns/BDv1_1-78-example.html", function (data) {
        let copy78 = convertStringToHTML(data);
        document.querySelector("#grid-container").replaceChild(copy78.querySelector("#project"),document.querySelector("#project"));
        totalRow = 5;
        baseVal = 4;
        bpm = 120;
        pos = 1;
        maxPos = 16;
        maxPosAll = 16;
        currentKBLocation = null;
        currentPage = 1;
        pageCount = 1;
        document.querySelector("#file-name").value = "78-example"
        for (let row = 1; row <= totalRow; row++) {
            initializeRow(1,row);
        }
    });
}

document.querySelector("#kit-808").onclick = function load808() {
    document.getElementById("kit-dialog").close();
    clearInterval(intervalId)
    $.get("./patterns/BDv1_1-808-example.html", function (data) {
        let copy78 = convertStringToHTML(data);
        document.querySelector("#grid-container").replaceChild(copy78.querySelector("#project"),document.querySelector("#project"));
        totalRow = 9;
        baseVal = 4;
        bpm = 120;
        pos = 1;
        maxPos = 16;
        maxPosAll = 16;
        currentKBLocation = null;
        currentPage = 1;
        pageCount = 1;
        document.querySelector("#file-name").value = "808-example"
        for (let row = 1; row <= totalRow; row++) {
            initializeRow(1,row);
        }
    });
}

document.querySelector("#kit-909").onclick = function load909() {
    document.getElementById("kit-dialog").close();
    clearInterval(intervalId)
    $.get("./patterns/BDv1_1-909-example.html", function (data) {
        let copy78 = convertStringToHTML(data);
        document.querySelector("#grid-container").replaceChild(copy78.querySelector("#project"),document.querySelector("#project"));
        totalRow = 4;
        baseVal = 4;
        bpm = 120;
        pos = 1;
        maxPos = 16;
        maxPosAll = 16;
        currentKBLocation = null;
        currentPage = 1;
        pageCount = 1;
        document.querySelector("#file-name").value = "909-example"
        for (let row = 1; row <= totalRow; row++) {
            initializeRow(1,row);
        }
    });
}
document.querySelector("#kit-LM2").onclick = function loadLM2() {
    document.getElementById("kit-dialog").close();
    clearInterval(intervalId)
    $.get("./patterns/BDv1_1-LM2-example.html", function (data) {
        let copy78 = convertStringToHTML(data);
        document.querySelector("#grid-container").replaceChild(copy78.querySelector("#project"),document.querySelector("#project"));
        totalRow = 6;
        baseVal = 4;
        bpm = 120;
        pos = 1;
        maxPos = 16;
        maxPosAll = 16;
        currentKBLocation = null;
        currentPage = 1;
        pageCount = 1;
        document.querySelector("#file-name").value = "LM2-example"
        for (let row = 1; row <= totalRow; row++) {
            initializeRow(1,row);
        }
    });
}

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

        if (document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .mute").style.backgroundColor === "red") {
            gainNodes[row - 1].gain.value = 0;
        } else {
            gainNodes[row - 1].gain.value = Number(current_step.dataset.acc);
        }

        if (current_step.dataset.active === "yes") {
            if (Math.random() < current_step.dataset.cond) {

                current_step.textContent = current_step.dataset.sub;
                toggleColor(document.querySelector("#accent"), "#" + Math.floor(Number(current_step.dataset.acc) * 255).toString(16) + "0000", "gray");

                setTimeout(function () {
                    for (let sub = 1; sub <= Number(current_step.dataset.sub); sub++) {
                        setTimeout(function () {
                            toggleColor(document.querySelector("#seq-row-" + row.toString() + "-" + currentPage.toString()  + " .row-clear"), 'yellow', 'gray');
                            toggleColor(current_step, 'yellow', 'lawngreen');
                            playSample(audioBuffers[row - 1], row);
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

        if (document.querySelector("#pattern-" + tempPage.toString() + " #seq-row-" + row.toString() + "-" + tempPage.toString() + " .mute").style.backgroundColor === "red") {
            gainNodes[row - 1].gain.value = 0;
        } else {
            gainNodes[row - 1].gain.value = Number(current_step.dataset.acc);
        }

        if (current_step.dataset.active === "yes") {
            if (Math.random() < current_step.dataset.cond) {
                current_step.textContent = current_step.dataset.sub;
                toggleColor(document.querySelector("#accent"), "#" + Math.floor(Number(current_step.dataset.acc) * 255).toString(16) + "0000", "gray");

                setTimeout(function () {
                    for (let sub = 1; sub <= Number(current_step.dataset.sub); sub++) {
                        setTimeout(function () {
                            toggleColor(document.querySelector("#seq-row-" + row.toString() + "-" + tempPage.toString()  + " .row-clear"), 'yellow', 'gray');
                            toggleColor(current_step, 'yellow', 'lawngreen');
                            playSample(audioBuffers[row - 1], row);
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
document.querySelector("#upload").onclick = function () {


    document.querySelector("#upload-input").click();
}

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
                initializeRow(page, row);
            }
        }
        $("#pattern-1").removeClass("invisible");

        document.querySelector("#file-name").value = document.querySelector("#project").dataset.name;
        document.querySelector("#subptn").value = 1;
        currentPage = 1;
        pos = 1;
        clearInterval(intervalId);
    };
    projectReader.readAsText(file);
}

// Download pattern (as HTML)

function downloadInnerHtml(filename, elId, mimeType) {

    let clonedProject = document.querySelector("#grid-container").cloneNode(true);

    for (let row = 1; row <= totalRow; row++) {
        if (clonedProject.querySelector("#audio-" + row.toString()).src.endsWith(".wav") === false) {
            clonedProject.querySelector("#audio-" + row.toString()).src = ""
        }
    }

    let elHtml = clonedProject.innerHTML;
    let link = document.createElement('a');
    mimeType = mimeType || 'text/plain';

    link.setAttribute('download', filename);
    link.setAttribute('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(elHtml));
    link.click();
}

$('#downloadLink').click(function(){
    downloadInnerHtml("BDv1_2 - " + document.querySelector("#project").dataset.name, 'grid-container','text/html');
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
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .continue").textContent = "►";

    document.querySelector("#audio-" + row.toString()).addEventListener('canplaythrough', function () {
        setupSample(document.querySelector("#audio-" + row.toString()).src).then((sample) => {
            audioBuffers[row - 1] = sample;
        });
    });


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

        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).onfocus = function(){
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).style.border = "5px " + "#" + Math.floor(Number(document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).dataset.acc) * 255).toString(16) + "0000" + " solid";
        }

        document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).onblur = function(){
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .steps .step" + step.toString()).style.border = "";
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

            playSample(audioBuffers[row - 1], row);

        });
    }

    // Enable Row Clear
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .row-clear").addEventListener('click', function rowClear() {
            for (let step = 1; step <= maxPos; step++) {
                document.querySelector("#seq-row-" + row.toString() + "-" + currentPage.toString()  + " .row-clear").style.backgroundColor = "gray";
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + this.textContent + "-" + page.toString() + " .steps .step" + step.toString()).style.backgroundColor = "darkgray";
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + this.textContent + "-" + page.toString() + " .steps .step" + step.toString()).textContent = "";
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + this.textContent + "-" + page.toString() + " .steps .step" + step.toString()).dataset.active = "no"
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + this.textContent + "-" + page.toString() + " .steps .step" + step.toString()).style.color = "#7f0000";
            }
    });

    // Enable Loading Samples / presets
    $('#inst-' + row.toString()).on('click', function chooseSample(e) {
        selectedRow = row;
        e.preventDefault();
        document.getElementById("load-dialog").showModal();
    });

    // Enable Mute Function
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .mute").addEventListener('click', function muteRow() {
        toggleColor(this, "red", "gray");
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
            }
            document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .mute").style.backgroundColor = "gray";
        } else {
            for (let i = 1; i <= totalRow; i++) {
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + i.toString() + "-" + page.toString() + " .solo").style.backgroundColor = "gray";
                document.querySelector("#pattern-" + page.toString() + " #seq-row-" + i.toString() + "-" + page.toString() + " .mute").style.backgroundColor = "gray";
            }
        }
    });

    // Audition samples
    document.querySelector("#pattern-" + page.toString() + " #seq-row-" + row.toString() + "-" + page.toString() + " .continue").onclick = function auditionSample() {
        playSample(audioBuffers[row - 1], row);
    }
}

window.onload = function (){
    initializeRow(1, 1);
    document.querySelector("#subptn").value = 1;
}

/* Navigation Bar */

// Erase all pattern (Nuke)
document.querySelector("#nuke-all").addEventListener('click', function nukeAll() {
    let nukeConfirm = confirm("This will ERASE ALL patterns. Are you really sure?");
    if (nukeConfirm === true) {
        clearInterval(intervalId);
        document.querySelector("#play-all").style.backgroundColor = "gray"
        document.querySelector("#loop").style.backgroundColor = "gray"
        document.querySelectorAll(".steps button").forEach((element) => element.style.backgroundColor = "darkgray");
        document.querySelectorAll(".steps button").forEach((element) => element.dataset.acc = "0.5");
        document.querySelectorAll(".steps button").forEach((element) => element.dataset.cond = "1.0");
        document.querySelectorAll(".steps button").forEach((element) => element.dataset.sub = "1");
        document.querySelectorAll(".steps button").forEach((element) => element.dataset.micro = "0.0");
        document.querySelectorAll(".steps button").forEach((element) => element.dataset.active = "no");

        document.querySelector("#ac").value = "0.5";
        document.querySelector("#cond").value = "1.0";
        document.querySelector("#sub").value = "1";
        document.querySelector("#micro").value = "0.0";
        document.querySelectorAll(".steps button").forEach((element) => element.textContent = "");
        document.querySelectorAll(".steps button").forEach((element) => element.style.color = "#7f0000");

        if (pageCount >= 2) {
            for (let i = 1; i < pageCount; i++) {
                document.querySelector("#del-page").click();
            }
        }
    }
});

// Randomize Steps (Chaos, Chaos!)
document.querySelector("#chaos").addEventListener('click', function totalChaos() {

    let chaosVal = prompt("Select a row to randomize \n (Enter '0' for randomize all)");
    if (parseInt(chaosVal) === 0) {
        let chaosConfirm = confirm("This will mix up ALL STEPS in this page. Are you really sure?");
        if (chaosConfirm === true) {
            clearInterval(intervalId);
            document.querySelector("#play-all").style.backgroundColor = "gray";
            document.querySelector("#loop").style.backgroundColor = "gray";

            for (let row = 1; row <= totalRow; row++) {
                document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .row-clear").click();
                for (let step = 1; step <= maxPos; step++) {
                    if (Math.random() > 0.75) {
                        document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .step" + step.toString()).click();
                    }
                }
            }
        }
    }  else if (parseInt(chaosVal) >= 1 && parseInt(chaosVal) <= totalRow) {
        document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + chaosVal.toString() + "-" + currentPage.toString() + " .row-clear").click();
        for (let step = 1; step <= maxPos; step++) {
            if (Math.random() > 0.75) {
                document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + chaosVal.toString() + "-" + currentPage.toString() + " .step" + step.toString()).click();
            }
        }
    } else if (parseInt(chaosVal) === -1) {
        let trueChaosConfirm = confirm("-TOP SECRET-\nThis will randomize all steps along with its parameters.\nCHECK YOUR VOLUME BEFORE PROCEEDING.\nAre you REALLY sure?");
        if (trueChaosConfirm === true) {
            clearInterval(intervalId);
            document.querySelector("#play-all").style.backgroundColor = "gray";
            document.querySelector("#loop").style.backgroundColor = "gray";

            for (let row = 1; row <= totalRow; row++) {
                document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .row-clear").click();
                for (let step = 1; step <= maxPos; step++) {
                    if (Math.random() > 0.75) {
                        document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .step" + step.toString()).click();
                        document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .step" + step.toString()).dataset.acc = Math.random().toString();
                        document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .step" + step.toString()).dataset.cond = Math.random().toString();
                        document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .step" + step.toString()).dataset.sub = Math.ceil(Math.random() * 5).toString();
                        document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .step" + step.toString()).dataset.micro = (Math.random() / 2).toString();

                        document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .step" + step.toString()).style.color = "#" + Math.floor(Number(document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .steps .step" + step.toString()).dataset.acc) * 255).toString(16) + "0000";
                        document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .step" + step.toString()).style.paddingLeft = (5 + Number(document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .steps .step" + step.toString()).dataset.micro) * 10).toString() + "px";
                        document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .steps .step" + step.toString()).textContent = document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .steps .step" + step.toString()).dataset.sub;
                    }
                }
            }

            alert("h a v e  f u n !");
        }
    }
});


// Add an instrument row
document.querySelector("#add-inst").addEventListener('click', function addRow() {

    // Add a new row
    if (totalRow < 32) {
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
    } else {
        alert("Cannot add more rows!");
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


// Set BPM (with direct input)
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

// Signature Change (with direct input)
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

// Play through whole project
document.querySelector("#play-all").onclick = function playPattern() {

    toggleColor(document.querySelector("#play-all"), "lawngreen", "gray");

    if (document.querySelector("#loop").style.backgroundColor === "lawngreen") {
        document.querySelector("#loop").style.backgroundColor = "gray"
    }

    if (document.querySelector("#play-all").style.backgroundColor === "lawngreen") {
        clearInterval(intervalId);
        pos = 1;
        currentPage = 1;
        for (let page = 1; page <= pageCount; page++) {
            $("#pattern-" + page.toString()).addClass("invisible");
        }
        $("#pattern-1").removeClass("invisible");
        document.querySelector("#subptn").value = "1"
        intervalId = setInterval(toggleColumnAll, 60000 / (bpm * baseVal));
        draw();
        drawWave();
    } else {clearInterval(intervalId);}
}

// Loop through one pattern
document.querySelector("#loop").onclick = function loopPattern() {

    toggleColor(document.querySelector("#loop"), "lawngreen", "gray");

    if (document.querySelector("#play-all").style.backgroundColor === "lawngreen") {
        document.querySelector("#play-all").style.backgroundColor = "gray"
    }

    if (document.querySelector("#loop").style.backgroundColor === "lawngreen") {
        clearInterval(intervalId);
        pos = 1;
        intervalId = setInterval(toggleColumn, 60000 / (bpm * baseVal));
        draw();
        drawWave();
    } else {clearInterval(intervalId);}
}


// Page Navigation
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
        initializeRow(pageCount, row);
    }

    for (let page = 1; page <= pageCount; page++) {
        $("#pattern-" + page.toString()).addClass("invisible");
        for (let row = 1; row <= totalRow; row++) {
            document.querySelectorAll(".continue").forEach((element) => element.style.backgroundColor = "lawngreen");
            document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + row.toString() + "-" + currentPage.toString() + " .row-clear").click();
        }
    }
    $("#pattern-" + pageCount).removeClass("invisible");

    for (let row = 1; row <= totalRow; row++) {
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


// Collapsible Manual
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

        document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + currentKBLocation[0].toString() + "-" + currentPage.toString() + " .step" + currentKBLocation[1].toString()).focus();

        if (currentKBLocation !== null && event.key === " ") {
            event.preventDefault();
            if (currentKBLocation[1] + baseVal <= maxPos) {
                document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + currentKBLocation[0].toString() + "-" + currentPage.toString() + " .step" + currentKBLocation[1].toString()).click();
                currentKBLocation[1] = currentKBLocation[1] + baseVal;
                document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + currentKBLocation[0].toString() + "-" + currentPage.toString() + " .step" + currentKBLocation[1].toString()).focus();
            } else {
                document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + currentKBLocation[0].toString() + "-" + currentPage.toString() + " .step" + currentKBLocation[1].toString()).click();
                currentKBLocation[1] = currentKBLocation[1] % baseVal;
                document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + currentKBLocation[0].toString() + "-" + currentPage.toString() + " .step" + currentKBLocation[1].toString()).focus();
            }
        }

        if (event.key === "p") {
            document.querySelector("#play-all").click();
        }

        if (event.key === "o") {
            document.querySelector("#loop").click();
        }

        if (event.key === "m") {
            document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + currentKBLocation[0].toString() + "-" + currentPage.toString() + " .mute").click();
        }

        if (event.key === "s") {
            document.querySelector("#pattern-" + currentPage.toString() + " #seq-row-" + currentKBLocation[0].toString() + "-" + currentPage.toString() + " .solo").click();
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