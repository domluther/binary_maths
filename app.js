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
    // Create settings area
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
    stepButton.addEventListener("click", function () {
        stepThrough();
    });
    stepButton.style.visibility = "hidden";
    settingsArea.appendChild(stepButton);

}

function createResultsArea() {
    // Sets up the results area & clears verbose area
    let resultsArea = document.getElementById("resultsArea");
    resultsArea.innerHTML = '';
    resultsArea.appendChild(document.createElement("br"));

    let elementsToAdd = {
        "inputValue": "Input Value", "currentStep": "Current Step",
        "currentNumber": "Current Number", "remainder": "Remainder",
        "outputValue": "Final Answer"
    };

    for (const element in elementsToAdd) {
        let ele = document.createElement("p");
        ele.setAttribute("id", element + "Holder");
        ele.innerHTML = `${elementsToAdd[element]}: <strong id = ${element}></strong>`
        ele.style.display = 'none';
        resultsArea.appendChild(ele);
        resultsArea.appendChild(document.createElement("br"));
    }

    document.getElementById('verboseArea').innerHTML = '';
}

function blankAreas() {
    // Used to make sure the required areas are blank
    let areas = ["inputArea", "settingsArea", "outputArea", "resultsArea", "verboseArea"]
    for (const area of areas) {
        document.getElementById(area).innerHTML = "";
    }
}

function convert() {
    let inputBase = getInputBase();
    // Will need to iterate through when there is more than 1 input box, currently hardcode just one.
    setInputValue();
    let currentNumber;
    let inputValue = getInputValue();
    let bitLength = getBitLength();
    if (inputBase === "10") {
        setCurrentNumber(inputValue, false);
        for (let i = 1; i <= bitLength; i++) {
            currentNumber = getCurrentNumber();
            fillOutput(currentNumber, bitLength, i, false);
        }
    } else if (inputBase === "2") {
        for (let i = 1; i <= bitLength; i++) {
            fillOutput(inputValue, bitLength, i, false);
        }
    } else if (inputBase === "16") {
        // Used to index the parts of the number as each represents a nibble
        let index = 0;
        for (let i = 1; i <= bitLength; i++) {
            // Only read in the first bit of each nibble
            if (i % 4 === 1) {
                currentNumber = inputValue.charAt(index);
                setCurrentNumber(currentNumber);
            }
            currentNumber = getCurrentNumber();
            fillOutput(currentNumber, bitLength, i, false);
            // Use an index to move along. Increment every 4 bits (nibble)
            if (i % 4 === 0) {
                index += 1;
            }
        }
    }
    document.getElementById("stepButton").style.visibility = "hidden";

}

function stepThrough() {
    let inputValue;
    let currentStep;
    let nibble;
    let inputBase = getInputBase();
    let bitLength = getBitLength()

    // If first step
    if (getCurrentStep() === '') {
        currentStep = 1;
        setCurrentStep(currentStep);
        setInputValue();
        if (inputBase === '16') {
            inputValue = getInputValue().charAt(0);
        } else {
            inputValue = getInputValue();
        }
        fillOutput(inputValue, bitLength, getCurrentStep(), true);
    } else if (getCurrentStep() < bitLength) {
        setCurrentStep(getCurrentStep() + 1);
        if (inputBase === '10') {
            inputValue = getCurrentNumber();
        } else if (inputBase === '16') {
            if (getCurrentStep() % 4 === 1) {
                nibble = Math.floor(getCurrentStep() / 4);
                inputValue = getInputValue().charAt(nibble);
            } else {
                inputValue = getCurrentNumber();
            }
        } else {
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
    let verboseArea = document.getElementById('verboseArea');
    let outputBox = document.getElementById("binaryOutputBox" + i);
    if (step !== 1) {
        let j = i + 1;
        let oldOutputBox = document.getElementById("binaryOutputBox" + j)
        oldOutputBox.className = "outputBox";
    }
    outputBox.className = "outputBox active";
    let columnHeading = parseInt(document.getElementById("headingBox" + i).innerHTML);

    if (inputBase === '10' && outputBase === '2') {
        let outputBit = Math.floor(inputValue / columnHeading);
        outputBox.innerHTML = outputBit;
        setCurrentNumber(inputValue % columnHeading, false);
        setFinalAnswer(outputBit, step, bitLength);
        if (verbose) {
            setCurrentNumber(inputValue % columnHeading, true);
            verboseArea.innerHTML += `<li class="alignLeft">How many <strong>${columnHeading}</strong>s in <strong>${inputValue}</strong>? <strong>${outputBit}</strong> remainder <strong>${inputValue % columnHeading}</strong>.</li>`
        }
    } else if (inputBase === '2' && outputBase === '10') {
        let currentNumber = getCurrentNumber();
        let currentBit = inputValue.charAt(step - 1);
        if (currentNumber === '')
        {
            currentNumber = 0;
        }
        let change = currentBit * columnHeading;
        let originalValue = currentNumber;
        currentNumber += change;
        setCurrentNumber(currentNumber, false);
        outputBox.innerHTML = currentBit;
        setFinalAnswer(currentNumber, step, bitLength, true);
        if (verbose) {
            setCurrentNumber(currentNumber, true);
            verboseArea.innerHTML += `<li class="alignLeft"><strong>${originalValue}</strong> + <strong>${currentBit}</strong> * <strong>${columnHeading}</strong>? <strong>${currentNumber}</strong>.</li>`
        }
    } else if (inputBase === '2' && outputBase === '16') {
        let currentNumber = getCurrentNumber();
        let currentBit = inputValue.charAt(step - 1);
        outputBox.innerHTML = currentBit;
        if (currentNumber === '')
        {
            currentNumber = 0;
        }
        let change = currentBit * columnHeading;
        let originalValue = currentNumber;
        currentNumber += change;
        setCurrentNumber(currentNumber, false);
        if (verbose) {
            setCurrentNumber(currentNumber, true);
            verboseArea.innerHTML += `<li class="alignLeft"><strong>${originalValue}</strong> + <strong>${currentBit}</strong> * <strong>${columnHeading}</strong>? <strong>${currentNumber}</strong>.</li>`
        }
        if (step % 4 === 0) {
            // add to final number (sometimes)
            // reset current number (always)
            let currentNumberInHex = currentNumber.toString(16).toUpperCase();
            if (verbose) {
                verboseArea.innerHTML += `<li class="alignLeft">End of nibble. Convert <strong>${currentNumber}</strong> to hex. 0x<strong>${currentNumberInHex}</strong>.</li>`
            }
            setFinalAnswer(currentNumberInHex, step, bitLength);
            setCurrentNumber(0);
        }
    } else if (inputBase === '16' && outputBase === '2') {
        let inputValueInDenary = parseInt(inputValue, inputBase)
        let outputBit = Math.floor(inputValueInDenary / columnHeading);
        outputBox.innerHTML = outputBit;
        setCurrentNumber((inputValueInDenary % columnHeading).toString(16), false);
        setFinalAnswer(outputBit, step, bitLength);
        if (verbose) {
            setCurrentNumber((inputValueInDenary % columnHeading).toString(16), true);
            verboseArea.innerHTML += `<li class="alignLeft">How many <strong>${columnHeading}</strong>s in <strong>${inputValue}</strong>? <strong>${outputBit}</strong> remainder <strong>${inputValueInDenary % columnHeading}</strong>.</li>`
        }
    }
}

function drawBinaryBoxes(area) {
    // Visualise the output
    // Start by the layout
    createResultsArea();
    const outputArea = document.getElementById(area);
    outputArea.innerHTML = "";
    let outputBase = getOutputBase();
    let inputBase = getInputBase();
    let bitLength = getBitLength()
    let nibbles = bitLength / 4;
    // Draw heading boxes
    // Add padding every 4 boxes for a nibble?
    for (let n = nibbles - 1; n >= 0; n--) {
        let padding = document.createElement("div");
        padding.setAttribute("class", "nibbleHeadingPadding");
        padding.setAttribute("id", "nibbleHeadingPadding" + n);
        outputArea.appendChild(padding);
        for (let i = 3; i >= 0; i--) {
            let headingPower;
            let trueIndex = n * 4 + i;
            let newChild = document.createElement("div");
            newChild.setAttribute("class", "headingBox");
            newChild.setAttribute("id", "headingBox" + trueIndex);
            if (outputBase === '16' || inputBase === '16') {
                headingPower = trueIndex % 4;
            } else {
                headingPower = trueIndex;
            }
            newChild.innerHTML = Math.pow(2, headingPower);
            document.getElementById('nibbleHeadingPadding' + n).appendChild(newChild);
        }
    }
    outputArea.appendChild(document.createElement("br"));

    // Draw output boxes
    // Add padding every 4 boxes for a nibble?
    for (let n = nibbles - 1; n >= 0; n--) {
        padding = document.createElement("div");
        padding.setAttribute("class", "nibbleOutputPadding");
        padding.setAttribute("id", "nibbleOutputPadding" + n);
        outputArea.appendChild(padding);
        for (let i = 3; i >= 0; i--) {
            let trueIndex = n * 4 + i;
            let newChild = document.createElement("div");
            newChild.setAttribute("class", "outputBox");
            newChild.setAttribute("id", "binaryOutputBox" + trueIndex);
            document.getElementById("nibbleOutputPadding" + n).appendChild(newChild);
        }
    }
    document.getElementById("convertButton").style.visibility = "visible";
    document.getElementById("stepButton").style.visibility = "visible";

    outputArea.appendChild(document.createElement("br"));

}

function denaryToBinary() {
    let inputBase = 10;
    let outputBase = 2;
    let inputs = 1;
    const bitLengthOptions = ["4", "8", "16"];

    document.getElementById("titleFrom").innerHTML = inputBase;
    document.getElementById("titleTo").innerHTML = outputBase;
    blankAreas();
    createInputs(inputs, inputBase);
    createSettings(bitLengthOptions);
    createResultsArea();
}

function binaryToDenary() {
    let inputBase = 2;
    let outputBase = 10;
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
    let inputs = 1;
    const bitLengthOptions = ["4", "8", "16"];

    document.getElementById("titleFrom").innerHTML = inputBase;
    document.getElementById("titleTo").innerHTML = outputBase;
    blankAreas();
    createInputs(inputs, inputBase);
    createSettings(bitLengthOptions);
}

function hexToBinary() {
    let inputBase = 16;
    let outputBase = 2;
    let inputs = 1;
    const bitLengthOptions = ["4", "8", "16"];

    document.getElementById("titleFrom").innerHTML = inputBase;
    document.getElementById("titleTo").innerHTML = outputBase;
    blankAreas();
    createInputs(inputs, inputBase);
    createSettings(bitLengthOptions);
}

function setCurrentNumber(value, show = true) {
    let ele = document.getElementById("currentNumber");
    if (show) {
        document.getElementById("currentNumberHolder").style.display = 'inline';
    }
    ele.innerHTML = value
}


function getCurrentNumber() {
    let ele = document.getElementById("currentNumber");
    let currentNumber = ele.innerHTML;
    let base = getInputBase();
    if (currentNumber === '') {
        return '';
    } else {
        if (base === "16") {
            return currentNumber;
        } else {
            return parseInt(currentNumber);
        }
    }
}

function setFinalAnswer(value, step, bitLength, set = false) {
    // TODO: Adjust so 0x 0b are not bolded, would need to be moved to end of outputValueHolder
    let ele = document.getElementById("outputValue");
    let base = getOutputBase();

    if (step < bitLength) {
        ele.innerHTML += value;
    } else if (step === bitLength) {
        document.getElementById("outputValueHolder").style.display = 'inline';
        ele.innerHTML += value;
        if (base === "2") {
            let parts = ele.innerHTML.match(/.{1,4}/g);
            ele.innerHTML = "0b" + parts.join(" ");
        } else if (base === "16") {
            ele.innerHTML = "</strong>0x<strong>" + ele.innerHTML + "<sub>16</sub>";
        }
    }
    if (set) {
        ele.innerHTML = value;
    }
}

function setCurrentStep(newStepValue) {
    let ele = document.getElementById("currentStep");
    if (newStepValue === '') {
        document.getElementById("currentStepHolder").style.display = 'none';
    } else {
        document.getElementById("currentStepHolder").style.display = 'inline';
    }
    ele.innerHTML = newStepValue
}

function getCurrentStep() {
    let currentStep = document.getElementById("currentStep").innerHTML;
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

function getInputValue() {
    let inputValue = document.getElementById("inputValue").innerHTML;
    return inputValue;
}

function setInputValue() {
    let inputValue = document.getElementById("inputBox0").value;
    inputValue = inputValue.split(" ").join("");
    if (getInputBase() === '2') {
        inputValue = inputValue.padStart(getBitLength(), '0');
    }
    let ele = document.getElementById("inputValue");
    document.getElementById("inputValueHolder").style.display = 'inline';
    ele.innerHTML = inputValue;

}

function getBitLength() {
    let bitIndex = document.getElementById("bitLength").selectedIndex;
    let bitLength = parseInt(document.getElementById("bitLength").options[bitIndex].value);
    return bitLength;
}
