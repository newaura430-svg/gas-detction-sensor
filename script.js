/* =========================================
   THINGSPEAK SETTINGS
========================================= */

const CHANNEL_ID = "3520693";


// If your ThingSpeak channel is PUBLIC,
// keep this as an empty string.

const READ_API_KEY = "FGDVPQXHH6LE7FAG";


// Gas threshold
const GAS_THRESHOLD = 1800;


// ESP32 ADC maximum
const ADC_MAX = 4095;


// Refresh time
const REFRESH_TIME = 15000;



/* =========================================
   ELEMENTS
========================================= */

const gasLevelElement =
    document.getElementById("gasLevel");

const gasStatusElement =
    document.getElementById("gasStatus");

const statusDescription =
    document.getElementById("statusDescription");

const statusCard =
    document.getElementById("statusCard");

const statusIcon =
    document.getElementById("statusIcon");

const meterBar =
    document.getElementById("meterBar");

const sensorStatus =
    document.getElementById("sensorStatus");

const lastUpdate =
    document.getElementById("lastUpdate");

const lastDate =
    document.getElementById("lastDate");

const alertBox =
    document.getElementById("alertBox");

const connectionDot =
    document.getElementById("connectionDot");

const connectionText =
    document.getElementById("connectionText");



/* =========================================
   THINGSPEAK URL
========================================= */

function getThingSpeakURL() {

    let url =
        `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds/last.json`;

    if (READ_API_KEY !== "") {

        url +=
            `?api_key=${READ_API_KEY}`;

    }

    return url;

}



/* =========================================
   GET DATA
========================================= */

async function getGasData() {

    try {

        console.log(
            "Getting ThingSpeak data..."
        );


        const response =
            await fetch(
                getThingSpeakURL()
            );


        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "ThingSpeak:",
            data
        );


        /* -----------------------------
           Gas Level
        ----------------------------- */

        const gasLevel =
            Number(data.field1);


        if (isNaN(gasLevel)) {

            throw new Error(
                "Invalid gas level"
            );

        }


        gasLevelElement.innerText =
            gasLevel;


        /* -----------------------------
           Meter
        ----------------------------- */

        let percentage =
            (gasLevel / ADC_MAX) * 100;


        percentage =
            Math.max(
                0,
                Math.min(
                    percentage,
                    100
                )
            );


        meterBar.style.width =
            `${percentage}%`;


        /* -----------------------------
           Gas Status
        ----------------------------- */

        let gasDetected;


        // Field 2 is preferred
        if (
            data.field2 !== null &&
            data.field2 !== undefined
        ) {

            gasDetected =
                Number(data.field2) === 1;

        }

        // Fallback to threshold
        else {

            gasDetected =
                gasLevel >= GAS_THRESHOLD;

        }


        updateStatus(
            gasDetected,
            gasLevel
        );


        /* -----------------------------
           Sensor
        ----------------------------- */

        sensorStatus.innerHTML = `

            <span class="live-dot"></span>

            ACTIVE

        `;


        /* -----------------------------
           Time
        ----------------------------- */

        updateTime(
            data.created_at
        );


        /* -----------------------------
           Connection
        ----------------------------- */

        setConnection(
            true
        );

    }


    catch (error) {

        console.error(
            "Error:",
            error
        );


        setConnection(
            false
        );

    }

}



/* =========================================
   UPDATE STATUS
========================================= */

function updateStatus(
    gasDetected,
    gasLevel
) {

    if (gasDetected) {

        // Card
        statusCard.className =
            "card status-card danger";


        // Status
        gasStatusElement.innerText =
            "🔴 GAS DETECTED";


        // Icon
        statusIcon.innerText =
            "⚠️";


        statusIcon.className =
            "card-icon";

        statusIcon.style.background =
            "rgba(239,68,68,0.1)";


        // Description
        statusDescription.innerText =
            "Danger! Gas level is above the safe threshold.";


        // Alert
        alertBox.classList.remove(
            "hidden"
        );


        // Meter
        meterBar.classList.add(
            "danger"
        );

    }


    else {

        // Card
        statusCard.className =
            "card status-card normal";


        // Status
        gasStatusElement.innerText =
            "🟢 NORMAL";


        // Icon
        statusIcon.innerText =
            "✓";


        statusIcon.className =
            "card-icon green";


        statusIcon.style.background =
            "";


        // Description
        statusDescription.innerText =
            "Gas level is within the safe range.";


        // Alert
        alertBox.classList.add(
            "hidden"
        );


        // Meter
        meterBar.classList.remove(
            "danger"
        );

    }

}



/* =========================================
   UPDATE TIME
========================================= */

function updateTime(
    timestamp
) {

    if (!timestamp) {

        lastUpdate.innerText =
            "--:--";

        lastDate.innerText =
            "Waiting for data...";

        return;

    }


    const date =
        new Date(timestamp);


    lastUpdate.innerText =
        date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    lastDate.innerText =
        date.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}



/* =========================================
   CONNECTION STATUS
========================================= */

function setConnection(
    connected
) {

    if (connected) {

        connectionDot.className =
            "status-dot online";


        connectionText.innerText =
            "Connected";

    }


    else {

        connectionDot.className =
            "status-dot offline";


        connectionText.innerText =
            "Connection Error";


        sensorStatus.innerHTML = `

            <span
                class="live-dot"
                style="
                    background:#ef4444;
                    box-shadow:0 0 10px #ef4444;
                "
            ></span>

            OFFLINE

        `;

    }

}



/* =========================================
   START
========================================= */

// Get data immediately
getGasData();


// Update every 15 seconds
setInterval(
    getGasData,
    REFRESH_TIME
);
