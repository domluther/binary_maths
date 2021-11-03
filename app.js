/*
Used to provide output and model answers for any H446 question

Convert bases
Unsigned binary <-> denary <-> hexadecimal representation

Binary addition

Signing numbers
- Sign & Magnitude
- Two's complement

Character sets - ASCII representation

Bitwise manipulation - application of a mask
Logical shift of numbers

Floating point conversion
Normalisation of a number
Floating point arithmetic
 */

/**
 * Sets up the input area - Abstracted so can create multiple inputs
 * @param inputs - the number of inputs wanted
 */
function createInputs(inputs) {
  const inputArea = document.getElementById("inputArea");
  let inputBase = getInputBase();

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

/**
 * Sets up the settings area
 * @param bitLengthOptions - dropdown options required
 */
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
    bitDropdown.appendChild(z);
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
    drawBinaryBoxes("outputArea");
  });
  settingsArea.appendChild(drawButton);

  // Create a calculate button
  let calculateButton = document.createElement("input");
  calculateButton.setAttribute("type", "button");
  calculateButton.setAttribute("id", "calculateButton");
  calculateButton.setAttribute("value", "Calculate");
  calculateButton.addEventListener("click", function () {
    calculate();
  });
  calculateButton.style.visibility = "hidden";
  settingsArea.appendChild(calculateButton);

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

/**
 * Sets up the results area & ensures verbose area clear
 */
function createResultsArea() {
  let resultsArea = document.getElementById("resultsArea");
  resultsArea.innerHTML = "";
  resultsArea.appendChild(document.createElement("br"));

  let elementsToAdd = {
    inputValue: "Input Value",
    currentStep: "Current Step",
    currentValue: "Current Value",
    remainder: "Remainder",
    outputValue: "Final Answer",
  };

  for (const element in elementsToAdd) {
    // Iterate through and create holders for the results. Default to hidden.
    let ele = document.createElement("p");
    ele.setAttribute("id", element + "Holder");
    ele.innerHTML = `${elementsToAdd[element]}: <strong id = ${element}></strong>`;
    ele.style.display = "none";
    resultsArea.appendChild(ele);
    resultsArea.appendChild(document.createElement("br"));
  }

  document.getElementById("verboseArea").innerHTML = "";
}

/**
 * Blanks the key areas of the page
 */
function blankAreas() {
  let areas = [
    "inputArea",
    "settingsArea",
    "outputArea",
    "resultsArea",
    "verboseArea",
  ];
  for (const area of areas) {
    document.getElementById(area).innerHTML = "";
  }
}

/**
 * Run when the calculate button is pressed. Different options depending on the bases used.
 * From binary - uses inputValue and step to index
 * From denary - keep track of remainder
 * From hex - keep track of nibble, and pass in the current value of that nibble.
 * Outputting in hex - bitLength adjusted due to nibbles
 *
 */
function calculate() {
  let toPassIn;
  let currentValue;
  let remainder;
  setInputValue(); // Read in the value to calculate
  let inputValue = getInputValue();
  let inputBase = getInputBase();
  let outputBase = getOutputBase();
  let bitLength = getBitLength();

  // TODO Will need to iterate through when there is more than 1 input box, currently hardcode just one.

  // To deal with hex nibbles
  if (
    (inputBase === "10" && outputBase === "16") ||
    (inputBase === "16" && outputBase === "10")
  ) {
    bitLength /= 4;
  }

  if (inputBase === "2") {
    toPassIn = inputValue;
    // Pass in the whole input as it is then indexed
    for (let currentStep = 1; currentStep <= bitLength; currentStep++) {
      fillOutput(toPassIn, bitLength, currentStep);
    }
  } else if (inputBase === "10") {
    setRemainder(inputValue, false);
    // Iterate through each bit to output. Pass in the remainder
    for (let currentStep = 1; currentStep <= bitLength; currentStep++) {
      toPassIn = getRemainder();
      fillOutput(toPassIn, bitLength, currentStep);
    }
  } else if (inputBase === "16") {
    if (outputBase === "2") {
      for (let currentStep = 1; currentStep <= bitLength; currentStep++) {
        // Only read in the first bit of each nibble
        if (currentStep % 4 === 1) {
          let nibble = Math.floor(currentStep / 4);
          setCurrentValue(inputValue.charAt(nibble));
        }
        toPassIn = getCurrentValue();
        fillOutput(toPassIn, bitLength, currentStep);
      }
    } else if (outputBase === "10") {
      for (let currentStep = 1; currentStep <= bitLength; currentStep++) {
        let toPassIn = inputValue.charAt(currentStep - 1);
        fillOutput(toPassIn, bitLength, currentStep);
      }
    }
  }
  // Hide the step button after calculating - reduces error
  hideElement("stepButton");
}

/**
 * Used for the verbose output option - runs each time the step button is pressed
 */
function stepThrough() {
  let toPassIn;
  let nibble;
  let currentStep = getCurrentStep();
  let inputBase = getInputBase();
  let outputBase = getOutputBase();
  let bitLength = getBitLength();

  // To deal with hex nibbles
  if (
    (inputBase === "10" && outputBase === "16") ||
    (inputBase === "16" && outputBase === "10")
  ) {
    bitLength /= 4;
  }

  // If first step, pass in the whole value. Or with hex the first character.
  if (currentStep === 0) {
    currentStep = 1;
    setCurrentStep(currentStep);
    setInputValue();
    if (inputBase === "16") {
      toPassIn = getInputValue().charAt(0);
    } else {
      toPassIn = getInputValue();
    }
    fillOutput(toPassIn, bitLength, currentStep, true);
  } else if (currentStep < bitLength) {
    // Increment the step
    currentStep = getCurrentStep() + 1;
    setCurrentStep(currentStep);
    if (currentStep === bitLength) {
      // No more steps to do
      hideElement("stepButton");
    }

    if (inputBase === "2") {
      toPassIn = getInputValue();
    } else if (inputBase === "10") {
      toPassIn = getRemainder();
    } else if (inputBase === "16") {
      // Check the input value every nibble
      if (currentStep % 4 === 1) {
        nibble = Math.floor(currentStep / 4);
        toPassIn = getInputValue().charAt(nibble);
      } else if (inputBase === "16" && outputBase === "10") {
        toPassIn = getInputValue().charAt(currentStep - 1);
      } else {
        toPassIn = getCurrentValue();
      }
    } else {
    } //pass - no other bases
    fillOutput(toPassIn, bitLength, currentStep, true);
  } else {
    // Pass - No more steps.
  }
}

/**
 * Called for each step of the conversion. Performs the calcuation and outputs it.
 * @param inputValue - for binary the input value, for denary the remainder, for hex the current character/value
 * @param bitLength - how many bits are going to be used to represent tha value
 * @param currentStep
 * @param verbose - boolean used when stepping through values so it prints out details
 */
function fillOutput(inputValue, bitLength, currentStep, verbose = false) {
  // Iterate through the value and calculate it
  let remainder;
  let inputBase = getInputBase();
  let outputBase = getOutputBase();
  let boxIndex = bitLength - currentStep;
  let verboseArea = document.getElementById("verboseArea");
  let outputBox = document.getElementById("binaryOutputBox" + boxIndex);

  // Highlight the active box & un-highlight the inactive one (doesn't happen on first step)
  outputBox.className = "outputBox active";
  if (currentStep !== 1) {
    let j = boxIndex + 1;
    let oldOutputBox = document.getElementById("binaryOutputBox" + j);
    oldOutputBox.className = "outputBox";
  }
  let columnHeading = parseInt(
    document.getElementById("headingBox" + boxIndex).innerHTML
  );

  if (inputBase === "2") {
    let currentValue = getCurrentValue();
    if (currentValue === "") {
      currentValue = 0;
    }
    let originalValue = currentValue;
    // TODO: Could pass in the bit of interest instead of working it out here? Problem of variable name being less clear
    // Calculate how much that bit is worth and increments the current value
    let currentBit = inputValue.charAt(currentStep - 1);
    outputBox.innerHTML = currentBit;
    let change = currentBit * columnHeading;
    currentValue += change;
    setCurrentValue(currentValue, false);
    if (verbose) {
      setCurrentValue(currentValue, true);
      verboseArea.innerHTML += `<li class="alignLeft"><strong>${originalValue}</strong> + <strong>${currentBit}</strong> * <strong>${columnHeading}</strong>? <strong>${currentValue}</strong>.</li>`;
    }

    if (outputBase === "16") {
      // Every 4 bits (nibble) set the current hex value and explain it
      if (currentStep % 4 === 0) {
        // At the end of each nibble, convert the current value to hex, set the final answer and then reset the current value.
        let currentValueInHex = currentValue.toString(16).toUpperCase();
        if (verbose) {
          verboseArea.innerHTML += `<li class="alignLeft">End of nibble. Convert <strong>${currentValue}</strong> to hex. 0x<strong>${currentValueInHex}</strong>.</li>`;
        }
        setFinalAnswer(currentValueInHex, currentStep, bitLength);
        setCurrentValue(0);
      }
    } else if (outputBase === "10") {
      setFinalAnswer(currentValue, currentStep, bitLength, true);
    }
  } else if (inputBase === "10") {
    // for denary - calculate the outputBit, output it and set the remainder
    let outputBit;
    if (outputBase === "2") {
      outputBit = Math.floor(inputValue / columnHeading);
    } else if (outputBase === "16") {
      outputBit = Math.floor(inputValue / columnHeading)
        .toString(16)
        .toUpperCase();
    }
    outputBox.innerHTML = outputBit;
    remainder = inputValue % columnHeading;
    setRemainder(remainder, false);
    setFinalAnswer(outputBit, currentStep, bitLength);
    if (verbose) {
      setRemainder(remainder, true);
      verboseArea.innerHTML += `<li class="alignLeft">How many <strong>${columnHeading}</strong>s in <strong>${inputValue}</strong>? <strong>${outputBit}</strong> remainder <strong>${remainder}</strong>.</li>`;
    }
  } else if (inputBase === "16" && outputBase === "2") {
    // Hex to binary - convert from hex to denary, calculate the output bit, set the current value to the value back in hex and output it
    let inputValueInDenary = parseInt(inputValue, inputBase);
    let outputBit = Math.floor(inputValueInDenary / columnHeading);
    outputBox.innerHTML = outputBit;
    remainder = inputValueInDenary % columnHeading;
    setCurrentValue(remainder.toString(16), false);
    setFinalAnswer(outputBit, currentStep, bitLength);
    if (verbose) {
      setCurrentValue((inputValueInDenary % columnHeading).toString(16), true);
      verboseArea.innerHTML += `<li class="alignLeft">How many <strong>${columnHeading}</strong>s in <strong>${inputValue}</strong>? <strong>${outputBit}</strong> remainder <strong>${remainder}</strong>.</li>`;
    }
  } else if (inputBase === "16" && outputBase === "10") {
    let inputValueInDenary = parseInt(inputValue, inputBase);
    outputBox.innerHTML = inputValue.toUpperCase();
    let originalValue = getCurrentValue();
    if (originalValue === "") {
      originalValue = 0;
    }
    let currentValue = originalValue + inputValueInDenary * columnHeading;
    setCurrentValue(currentValue, false);
    setFinalAnswer(currentValue, currentStep, bitLength, true);
    if (verbose) {
      setCurrentValue(currentValue, true);
      verboseArea.innerHTML += `<li class="alignLeft"><strong>${originalValue}</strong> + (<strong>${inputValueInDenary}</strong> * <strong>${columnHeading}</strong>)? <strong>${currentValue}</strong>.</li>`;
    }
  }
}

/**
 * Called when draw is pressed
 * @param areaId - element Id of the area to draw the boxes in
 */
function drawBinaryBoxes(areaId) {
  // Visualise the output
  // Start by re-creating the area to blank it
  createResultsArea();
  const outputArea = document.getElementById(areaId);
  outputArea.innerHTML = "";
  let boxesPerNibble = 3;
  let headingBase;
  let outputBase = getOutputBase();
  let inputBase = getInputBase();
  let bitLength = getBitLength();
  let nibbles = bitLength / 4;

  if (
    (inputBase === "10" && outputBase === "16") ||
    (inputBase === "16" && outputBase === "10")
  ) {
    nibbles = 1; // Inelegant way to force 1 hex nibble given 16 bit cap.
    boxesPerNibble = bitLength / 4 - 1; // -1 because zero indexed.
  }
  // Draw heading boxes. Outer loop used to create padding every nibble
  for (let n = nibbles - 1; n >= 0; n--) {
    let padding = document.createElement("div");
    padding.setAttribute("class", "nibbleHeadingPadding");
    padding.setAttribute("id", "nibbleHeadingPadding" + n);
    outputArea.appendChild(padding);
    for (let i = boxesPerNibble; i >= 0; i--) {
      let headingPower;
      let trueIndex = n * 4 + i;
      let newChild = document.createElement("div");
      newChild.setAttribute("class", "headingBox");
      newChild.setAttribute("id", "headingBox" + trueIndex);
      if (
        (inputBase === "2" && outputBase === "16") ||
        (inputBase === "16" && outputBase === "2")
      ) {
        // Binary <-> Hex
        headingPower = trueIndex % 4;
        headingBase = 2;
      } else if (
        (inputBase === "10" && outputBase === "16") ||
        (inputBase === "16" && outputBase === "10")
      ) {
        // Hex <-> Denary
        headingPower = trueIndex % 4;
        headingBase = 16;
      } else {
        // Binary <-> Denary
        headingPower = trueIndex;
        headingBase = 2;
      }
      newChild.innerHTML = Math.pow(headingBase, headingPower);
      document.getElementById("nibbleHeadingPadding" + n).appendChild(newChild);
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
    for (let i = boxesPerNibble; i >= 0; i--) {
      let trueIndex = n * 4 + i;
      let newChild = document.createElement("div");
      newChild.setAttribute("class", "outputBox");
      newChild.setAttribute("id", "binaryOutputBox" + trueIndex);
      document.getElementById("nibbleOutputPadding" + n).appendChild(newChild);
    }
  }
  document.getElementById("calculateButton").style.visibility = "visible";
  document.getElementById("stepButton").style.visibility = "visible";

  outputArea.appendChild(document.createElement("br"));
}

function setup(inputBase, outputBase, inputs = 1) {
  // Generic setup for all simple conversions
  const bitLengthOptions = ["4", "8", "16"];

  document.getElementById("titleFrom").innerHTML = inputBase;
  document.getElementById("titleTo").innerHTML = outputBase;
  blankAreas();
  createInputs(inputs);
  createSettings(bitLengthOptions);
}

function binaryToDenary() {
  setup(2, 10);
}

function binaryToHex() {
  setup(2, 16);
}

function denaryToBinary() {
  setup(10, 2);
}

function denaryToHex() {
  // Offer a method 2 - that shows denary -> binary -> hex (can show the hex part just in verbose/final option
  setup(10, 16);
}

function hexToBinary() {
  setup(16, 2);
}

function hexToDenary() {
  // Offer a method 2 - that shows hex -> binary -> denary
  setup(16, 10);
}

function setCurrentValue(value, show = true) {
  let ele = document.getElementById("currentValue");
  if (show) {
    document.getElementById("currentValueHolder").style.display = "inline";
  }
  ele.innerHTML = value;
}

function setRemainder(value, show = true) {
  let ele = document.getElementById("remainder");
  if (show) {
    document.getElementById("remainderHolder").style.display = "inline";
  }
  ele.innerHTML = value;
}

function getRemainder() {
  let ele = document.getElementById("remainder");
  let remainder = ele.innerHTML;
  let inputBase = getInputBase();
  let outputBase = getOutputBase();
  if (remainder === "") {
    return "";
  } else {
    return parseInt(remainder);
  }
}

function getCurrentValue() {
  let ele = document.getElementById("currentValue");
  let currentValue = ele.innerHTML;
  let inputBase = getInputBase();
  let outputBase = getOutputBase();
  if (currentValue === "") {
    return "";
  } else {
    if (inputBase === "16" && outputBase === "2") {
      return currentValue;
    } else {
      return parseInt(currentValue);
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
    document.getElementById("outputValueHolder").style.display = "inline";
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
  if (newStepValue === "") {
    document.getElementById("currentStepHolder").style.display = "none";
  } else {
    document.getElementById("currentStepHolder").style.display = "inline";
  }
  ele.innerHTML = newStepValue;
}

function getCurrentStep() {
  let currentStep = document.getElementById("currentStep").innerHTML;
  if (currentStep === "") {
    return 0;
  } else {
    return parseInt(currentStep);
  }
}

/**
 * Reads input base from the title of the page. Could be numeric but will it need to be different for more complicated?
 * @returns {string} the input base
 */
function getInputBase() {
  let ele = document.getElementById("titleFrom");
  return ele.innerHTML.replace(/[^0-9]/g, "");
}

/**
 * Reads output base from the title of the page. Could be numeric but will it need to be different for more complicated?
 * @returns {string} the output base
 */
function getOutputBase() {
  let ele = document.getElementById("titleTo");
  return ele.innerHTML.replace(/[^0-9]/g, "");
}

function getInputValue() {
  let inputValue = document.getElementById("inputValue").innerHTML;
  return inputValue;
}

/**
 * Reads the value from the input box and sets it in the results section
 * Pads binary/hex values to appropriate length
 */
function setInputValue() {
  let inputBase = getInputBase();
  let bitLength = getBitLength();
  let inputValue = document.getElementById("inputBox0").value;
  inputValue = inputValue.split(" ").join("");
  if (inputBase === "2") {
    inputValue = inputValue.padStart(bitLength, "0");
  } else if (inputBase === "16") {
    bitLength /= 4;
    inputValue = inputValue.padStart(bitLength, "0");
  }
  let ele = document.getElementById("inputValue");
  document.getElementById("inputValueHolder").style.display = "inline";
  ele.innerHTML = inputValue;
}

function getBitLength() {
  let bitIndex = document.getElementById("bitLength").selectedIndex;
  let bitLength = parseInt(
    document.getElementById("bitLength").options[bitIndex].value
  );
  return bitLength;
}

function hideElement(elementId) {
  document.getElementById(elementId).style.visibility = "hidden";
}
