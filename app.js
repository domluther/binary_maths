function convert() {

    let inputBase = getInputBase();
    // Will need to iterate through when there is more than 1 input box, currently hardcode just one.
    let inputValue = getInputValue();
    let bitLength = getBitLength();
    if (inputBase === '10') {
        setCurrentNumber(inputValue);
        for (let i = 1; i <= bitLength; i++) {
            let currentNumber = getCurrentNumber();
            fillOutput(currentNumber, bitLength, i, false);
        }
    }
    else if (inputBase === '2') {
        // Remove spaces. Pad with 0s
        for (let i = 1; i <= bitLength; i++) {
            fillOutput(inputValue, bitLength, i, false);
        }
    }
    document.getElementById("stepButton").style.visibility="hidden";

}

function stepThrough() {
    let inputValue;
    let currentStep;
    let bitLength = getBitLength()

    // If first step
    if (getCurrentStep() === '') {
        currentStep = 1;
        setCurrentStep(currentStep);
        inputValue = getInputValue();
        fillOutput(inputValue, bitLength, getCurrentStep(), true);
    }
    else if (getCurrentStep() < bitLength) {
        setCurrentStep(getCurrentStep() + 1);

        if (getInputBase() === '10') {
            inputValue = getCurrentNumber();
        }
        else
        {
            inputValue = getInputValue();
        }
        fillOutput(inputValue, bitLength, getCurrentStep(), true);
    }
}

function fillOutput(inputValue, bitLength, step, verbose) {
    // Iterate through the value and convert it
    let inputBase = getInputBase();
    let outputBase = getOutputBase();
    let i = bitLength - step;
    let outputBox = document.getElementById("binaryOutputBox" + i);
    if (step != 1) {
        let j = i + 1;
        let oldOutputBox = document.getElementById("binaryOutputBox" + j)
        oldOutputBox.className = "outputBox";
    }
    outputBox.className = "outputBox active";
    let columnHeading = parseInt(document.getElementById("headingBox" + i).innerHTML);

    if (inputBase === '10' && outputBase === '16') {
        let outputBit = Math.floor(inputValue / columnHeading);
        setCurrentNumber(inputValue % columnHeading);
        outputBox.innerHTML = outputBit;
        if (verbose) {
            let verboseArea = document.getElementById('verboseArea');
            verboseArea.innerHTML += `<li class="alignLeft">How many <strong>${columnHeading}</strong>s in <strong>${inputValue}</strong>? <strong>${outputBit}</strong> remainder <strong>${inputValue % columnHeading}</strong>.</li>`
        }
    }
    else if (inputBase === '2' && outputBase === '10') {
        let currentNumber = getCurrentNumber();
        let currentBit = inputValue.charAt(step - 1);

        currentNumber += currentBit * columnHeading;
        setCurrentNumber(currentNumber);
        outputBox.innerHTML = currentBit;
        if (verbose) {
            let verboseArea = document.getElementById('verboseArea');
            verboseArea.innerHTML += `<li class="alignLeft"><strong>${currentBit}</strong> * <strong>${columnHeading}</strong>? <strong>${currentBit * columnHeading}</strong>.</li>`
        }
    }

    else if (inputBase === '2' && outputBase === '16') {
        let currentNumber = getCurrentNumber();
        let currentBit = inputValue.charAt(step - 1);
        currentNumber += currentBit * columnHeading;
        let currentNumberInHex = currentNumber.toString(16).toUpperCase();
        setCurrentNumber(currentNumberInHex);
        outputBox.innerHTML = currentBit;
    }
}

function drawBinaryBoxes(area) {
    // Visualise the output
    // Start by the layout
    const outputArea = document.getElementById(area);
    outputArea.innerHTML = "";
    let base = getOutputBase();
    let bitLength = getBitLength()

    // Draw heading boxes
    // Add padding every 4 boxes for a nibble?
        for (let i = bitLength - 1; i >= 0; i--) {
            let headingPower;
            let newChild = document.createElement("div");
            newChild.setAttribute("class", "headingBox");
            newChild.setAttribute("id", "headingBox" + i);
            if (base === '16')
            {
                headingPower = i % 4;
            }
            else{
                headingPower = i;
            }
            newChild.innerHTML = Math.pow(2, headingPower);
            outputArea.appendChild(newChild);
        }
    outputArea.appendChild(document.createElement("br"));

    // Draw output boxes
    // Add padding every 4 boxes for a nibble?
    for (let i = bitLength - 1; i >= 0; i--) {
        let newChild = document.createElement("div");
        newChild.setAttribute("class", "outputBox");
        newChild.setAttribute("id", "binaryOutputBox" + i);
        outputArea.appendChild(newChild);
    }
    outputArea.appendChild(document.createElement("br"));

    if (area === 'outputArea') {
        // Create a placeholder for the number to go
        let currentStep = document.createElement("p");
        currentStep.setAttribute("id", "currentStep");
        outputArea.appendChild(currentStep);

        // Create a placeholder for the number to go
        let currentNumberOutput = document.createElement("p");
        currentNumberOutput.setAttribute("id", "currentNumber");
        outputArea.appendChild(currentNumberOutput);
        let verboseArea = document.getElementById('verboseArea');
        verboseArea.innerHTML = '';
    }

    document.getElementById("convertButton").style.visibility="visible";
    document.getElementById("stepButton").style.visibility="visible";
}

function denaryToBinary() {
    let inputBase = 10;
    let outputBase = 2;
    let mode = "denaryToBinary";
    let inputs = 1;
    const bitLengthOptions = ["4", "8", "16"];

    document.getElementById("titleFrom").innerHTML = inputBase;
    document.getElementById("titleTo").innerHTML = outputBase;
    blankAreas();
    createInputs(inputs, inputBase);
    createSettings(bitLengthOptions);
}

function binaryToDenary() {
    let inputBase = 2;
    let outputBase = 10;
    let mode = "binaryToDenary";
    let inputs = 1;
    const bitLengthOptions = ["4", "8", "16"];

    document.getElementById("titleFrom").innerHTML = inputBase;
    document.getElementById("titleTo").innerHTML = outputBase;
    blankAreas();
    createInputs(inputs, inputBase);
    createSettings(bitLengthOptions);
}

function binaryToHex() {
    let inputBase = 2;
    let outputBase = 16;
    let mode = "binaryToHex";
    let inputs = 1;
    const bitLengthOptions = ["4", "8", "16"];

    document.getElementById("titleFrom").innerHTML = inputBase;
    document.getElementById("titleTo").innerHTML = outputBase;
    blankAreas();
    createInputs(inputs, inputBase);
    createSettings(bitLengthOptions);
}

function blankAreas() {
    // Used to make sure the required areas are blank
    let areas = ["inputArea", "settingsArea", "outputArea", "verboseArea"]
    for (const area of areas) {
        document.getElementById(area).innerHTML = "";
    }
}

function createInputs(inputs, inputBase) {
    // Set up the input area - abstracted so can create two inputs for addition / subtraction
    const inputArea = document.getElementById("inputArea");

    // Create the input box & label
    for (let i = 0; i < inputs; i++) {
        let boxID = "inputBox" + i;
        inputArea.appendChild(document.createElement("br"));
        let inputLabel = document.createElement("label");
        inputLabel.setAttribute("for", boxID);
        inputLabel.innerHTML = "Input value (Base " + inputBase + "): &nbsp;";
        inputArea.appendChild(inputLabel);

        let inputBox = document.createElement("input");
        inputBox.setAttribute("type", "text");
        inputBox.setAttribute("id", boxID);
        inputBox.setAttribute("name", "inputBox");
        inputArea.appendChild(inputBox);
        inputArea.appendChild(document.createElement("br"));
        inputArea.appendChild(document.createElement("br"));
    }
}

function createSettings(bitLengthOptions) {
    const settingsArea = document.getElementById("settingsArea");

    // Create the bit length dropdown
    let bitLengthLabel = document.createElement("label");
    bitLengthLabel.setAttribute("for", "bitLength");
    bitLengthLabel.innerHTML = "How many bits?&nbsp;";
    settingsArea.appendChild(bitLengthLabel);

    let bitDropdown = document.createElement("select");
    bitDropdown.setAttribute("id", "bitLength");
    for (let i = 0; i < bitLengthOptions.length; i++) {
        let z = document.createElement("option");
        z.setAttribute("value", bitLengthOptions[i]);
        z.innerHTML = bitLengthOptions[i];
        bitDropdown.appendChild(z)
    }
    settingsArea.appendChild(bitDropdown);
    settingsArea.appendChild(document.createElement("br"));
    settingsArea.appendChild(document.createElement("br"));
    
    // Create a draw button
    let drawButton = document.createElement("input");
    drawButton.setAttribute("type", "button");
    drawButton.setAttribute("id", "drawButton");
    drawButton.setAttribute("value", "Draw");
    drawButton.addEventListener("click", function () {
        drawBinaryBoxes('outputArea')
    });
    settingsArea.appendChild(drawButton);

    // Create a convert button
    let convertButton = document.createElement("input");
    convertButton.setAttribute("type", "button");
    convertButton.setAttribute("id", "convertButton");
    convertButton.setAttribute("value", "Convert");
    convertButton.addEventListener("click", function () {
        convert();
    });
    convertButton.style.visibility = "hidden";
    settingsArea.appendChild(convertButton);

    let stepButton = document.createElement("input");
    stepButton.setAttribute("type", "button");
    stepButton.setAttribute("id", "stepButton");
    stepButton.setAttribute("value", "Step >>");
    stepButton.addEventListener("click", function() {
        stepThrough();
    });
    stepButton.style.visibility = "hidden";
    settingsArea.appendChild(stepButton);

}

function setCurrentNumber(value) {
    let ele = document.getElementById("currentNumber");
    let base = getInputBase();
    if (base === '10') {
        ele.innerHTML = `Remainder: <strong>${value}</strong>`
    }
    else if (base === '2'){
        ele.innerHTML = `Total: <strong> ${value}</strong>`
    }
}

function getCurrentNumber() {
    let ele = document.getElementById("currentNumber");
    let currentNumber = ele.innerHTML.replace(/[^0-9]/g, '');
    let base = getInputBase();
    if (currentNumber === '') {
        return '';
    } else {
        return parseInt(currentNumber);
    }
}

function setCurrentStep(value) {
    let ele = document.getElementById("currentStep");
    ele.innerHTML = `Step: <strong>${value}</strong>`
}

function getCurrentStep() {
    let ele = document.getElementById("currentStep");
    let currentStep = (ele.innerHTML.replace(/[^0-9]/g, ''));
    if (currentStep === '') {
        return '';
    } else {
        return parseInt(currentStep);
    }
}

function getInputBase() {
    let ele = document.getElementById("titleFrom");
    return ele.innerHTML.replace(/[^0-9]/g, '');
}

function getOutputBase() {
    let ele = document.getElementById("titleTo");
    return ele.innerHTML.replace(/[^0-9]/g, '');
}


function getInputValue(){
    let inputValue = document.getElementById("inputBox0").value;
    inputValue = inputValue.split(" ").join("");
    if (getInputBase() === '2')
    {
        inputValue = inputValue.padStart(getBitLength(), '0');
    }
    return inputValue;
}

function getBitLength(){
    let bitIndex = document.getElementById("bitLength").selectedIndex;
    let bitLength = parseInt(document.getElementById("bitLength").options[bitIndex].value);
    return bitLength;
}