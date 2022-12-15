// Verify devices permissions access

const devicesStatus = document.querySelector('.devices-status');

const snackbar = () => {
    setTimeout(() => {
        devicesStatus.classList.add('hide');
    }, 10000); // 10s before disappear
};
// Check access permissions
navigator.permissions.query({ name: 'microphone' }).then(function(result) {
    // console.log(result)
    if (result.state == 'granted') {
        devicesStatus.innerHTML = 'Devices Access Granted.';
        // Clear after 10s
        snackbar();
    } else if (result.state == 'prompt') {
        devicesStatus.innerHTML = 'Accept Access devices access request.';
        // Clear after 10s
        snackbar();
    } else if (result.state == 'denied') {
        devicesStatus.innerHTML = 'Please Enable Microphone Device.';
        // Clear after 10s
        snackbar();
    }
});

// Select buttons
const title = document.querySelector('.title');
const rec = document.querySelector('.rec');
const stop = document.querySelector('.stop');
const audioPlay = document.querySelector('.audio');
const stopwatch = document.querySelector('.stopwatch');

// Type of media to rec
let typeOfMedia = {
    audio: true
        //, video: true
};
// Create chunks audio container
let chunks = [];
// Media options
var options = {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
        mimeType: 'audio/webm'
    }
    // Download counter
let counter = 0;

var global = {};
function setGlobalRefInMainJs(globalInstance){
global = globalInstance;
}

//
// ─── REC FUNCTION ───────────────────────────────────────────────────────────────

// RecStream init
let recStream;

const recFunction = async() => {
    try {
        // Access to computer devices
        const mediaDevices = await navigator.mediaDevices.getUserMedia(typeOfMedia)
        if (mediaDevices.active === true) {
            // The MediaRecorder() constructor creates a new MediaRecorder object that will record a specified MediaStream. 
            recStream = new MediaRecorder(mediaDevices, options);
            //console.log(recStream)
            recStream.ondataavailable = e => {
                    // console.log(e)
                    // Push media data inside the array
                    chunks.push(e.data);
                    // If state inactive stop recording
                    if (recStream.state == 'inactive') {
                        // console.log(chunks)
                        // Create a new Blob with the array created
                        let blob = new Blob(chunks, { type: 'audio/webm' });
                        // Create a Playback and pass it the blob
                        var reader = new window.FileReader();
                        reader.readAsDataURL(blob); 
                        reader.onloadend = function() {
                        base64 = reader.result;
                        base64 = base64.split(',')[1];
                        var stringToPass = "data:audio/mpeg;base64," +base64;
                        global._addVideElement(stringToPass)
                        } 
                    }
                }
                // Start Recording in 1s
                // recStream.start(1000)
                // Start rec now
            recStream.start()
        }
    } catch (error) {
        if (error) console.log(error);
    }
}

// Link styles
let linkStyles = "display: block; padding: 15px; color: grey; text-decoration: none; "
    //
    //─── FUNCTION TO CREATE AN AUDIO ELEMENT TO PLAYBACK AND DOWNLOAD RECORDING ─────

window.createAudioElement = function (blobUrl) {
    let divStyles = "position: relative; display: flow-root; text-align: right; bottom: 970px; padding-bottom: 3px;padding-right: 10px;"
    // Create a div element
    const divEl = document.createElement('div');
    // Assign it a class
    divEl.className = 'div-audio'
        // Create an anchor tag
    // const downloadEl = document.createElement('a');
    // Give it styles
    // downloadEl.style = linkStyles;
    divEl.style = divStyles;
    //divEl Styles
        // divEl.style.position = 'relative'
        // // divEl.style.display = 'grid'
        // // divEl.style.left = '1150px'
        // // divEl.style.float = 'right'
        // // divEl.style.right = '50px'
        // // divEl.style.right = '0'
        // divEl.style.bottom = '950px'
        // // divEl.style.width = '50px'


    // Give it a progressive name
    // downloadEl.innerHTML = `Download - ${counter = counter + 1}`;
    // downloadEl.innerHTML = `Download`;
    // download = `Audio-${counter}.webm`;
    // Define href
    // downloadEl.href = blobUrl;
    // Create audio element
    const audioEl = document.createElement('audio');
    // Give it a class
    audioEl.className = 'audio'
        // Show controls play pause etc
    audioEl.controls = true;
    // Create source
    audioEl.style.width = '280px';
    const sourceEl = document.createElement('source');
    sourceEl.src = blobUrl;
    // Audio type
    sourceEl.type = 'audio/webm';
    // Append source on audio
    audioEl.appendChild(sourceEl);
    // document.body.appendChild(audioEl);
    // document.body.appendChild(downloadEl);
    // Append child
    divEl.appendChild(audioEl)
    // divEl.appendChild(downloadEl)
        // Append all in the body DOM
    document.body.appendChild(divEl);
}

// REC CLICK BUTTON EVENT LISTENER
rec.onclick = e => {
        // During registration disable rec button
        rec.disabled = true;
        // Change background color
        rec.style.backgroundColor = 'orange';
        // Animate rec button
        rec.classList.add('scale');
        // Enable stop button (default disabled)
        stop.disabled = false;
        // Change stop color back
        stop.style.background = '#292964';
        stop.style.color = '#ffffff';
        // Change title back color
        title.style.color = '#2196F3'
            // Start recording
        recFunction()
            // START STOPWATCH
        clearInterval(swInterval);
        swIternal = setInterval(stopwatchFunction, 1000);
    }
    // STOP REC BUTTON EVENT LISTENER
stop.onclick = e => {
    // Enable rec button
    rec.disabled = false;
    // Restore red color on rec button
    rec.style.backgroundColor = 'transparent';
    // Disable rec animation 
    rec.classList.remove('scale');
    // Disable stop button
    stop.disabled = true;
    // Change stop color back
    stop.style.backgroundColor = 'transparent';
    stop.style.color = 'black';
    // Change back title color
    title.style.color = '#313142'
        // STOP and Reset STOPWATCH
    clearInterval(swIternal);
    sec = 0;
    min = 0;
    // Stop Recording
    recStream.stop()

}

// STOPWATCH
let swInterval;
let displayStopwatch;
let sec = 0;
let min = 0;
let stopwatchFunction = () => {
    sec++
    if (sec <= 9) {
        sec = '0' + sec;
    }
    if (sec === 60) {
        sec = 0;
        min++
        if (min <= 9) {
            min = '0' + min;
        }
    }
    if (min === 60) {
        min = 0;
    }
    displayStopwatch = 'min: ' + min + ' : ' + 'sec: ' + sec;
    // Write output to the screen
    stopwatch.innerHTML = displayStopwatch;
};