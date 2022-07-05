
let changerVectorIn = [];
let changerVectorOut = [];
let output, inConstr, inputText;
function setup() {
  noCanvas();
  inConstr = document.getElementById("inputConstraint");
  output = document.getElementById("outputText");
  constraintChanged(inConstr.value);
  reloadOut();
}

function constraintChanged(input) {
  let vSplits = input.split(";"), vIn, vOut;
  for (let i in vSplits) {
    outAndIn = vSplits[i].split("=");
    if (outAndIn.length == 2 && outAndIn[0].length > 0 && outAndIn[1].length > 0) {
      vIn = outAndIn[1].replace(/ /g, "");
      vOut = outAndIn[0].replace(/ /g, "");
      changerVectorIn[i] = vIn;
      changerVectorOut[i] = vOut;
    }
  }
  reloadOut();
}

function inputChanged(input) {
  for (let i = 0; i < changerVectorIn.length; i++) {
    if (changerVectorIn[i][0] == "-") {
      input = input.replaceAll(changerVectorIn[i].slice(1), changerVectorOut[i]);
    }
    else {
      input = input.replaceAll(" " + changerVectorIn[i] + " ", " " + changerVectorOut[i] + " ");
      input = input.replaceAll(changerVectorIn[i] + " ", changerVectorOut[i] + " ");
      input = input.replaceAll(" " + changerVectorIn[i], " " + changerVectorOut[i]);
    }
  }
  output.innerHTML = input;
}

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

function reloadOut(){
  inputChanged(document.getElementById("input").value);
}

function onfocusin(x){
  x.style = "height: 40%;";
}

function onfocusout(x){
  x.style = "";
}