var tt_cancel_destination = "/views/patient_dashboard.html?patient_id=" + sessionStorage.patientID;


var YesNoConcepts = {};
YesNoConcepts["Yes"] = 1065;
YesNoConcepts["No"] = 1066;


  function addViaYesNo() {
    var tar = document.getElementById("inputFrame" + tstCurrentPage);
    var attr = 'Ever had VIA?,1805'
    buildYesNoUI('VIA Reception', attr, tar);
}
  
function addOfferViaYesNo() {
    var tar = document.getElementById("inputFrame" + tstCurrentPage);
    var attr = 'Offer VIA?,1805'
    buildYesNoUI('Offer VIA', attr, tar);
}

function setReasonForNoVIA() {
  let inputFrame = $("inputFrame" + tstCurrentPage);
  inputFrame.setAttribute("style","width: 95.5% !important;");
  let touchscreenInput =  $('touchscreenInput' + tstCurrentPage);
  touchscreenInput.style = "width: 100%;";
}

function addViaResultsAvailableYesNo() {
    var tar = document.getElementById("inputFrame" + tstCurrentPage);
    var attr = 'Results available?,1805,checkIfresultsAvailable'
    buildYesNoUI('VIA results available', attr, tar);
}


function showResultsAvailable(){
  let everHadVIA = yesNo_Hash['VIA Reception']['Ever had VIA?'];
  return (everHadVIA == "Yes" ? true : false);
}

function checkIfresultsAvailable(){
  let results_available = yesNo_Hash['VIA results available']['Results available?'];
  let nextBTN = $('nextButton');
  
  if(results_available == 'Yes'){
    nextBTN.innerHTML = "<span>Finish</span>";
  }else{
    nextBTN.innerHTML = "<span>Next</span>";
  }
}

function setNextBTN(){
  let nextBTN = $('nextButton');
  nextBTN.setAttribute('onmousedown',"finishEncounter();") 
  let results_available;
  
  try {
    results_available = yesNo_Hash['VIA results available']['Results available?'];
    if(results_available == 'Yes')
      checkIfresultsAvailable();
    
  }catch(e){
  }
}

function finishEncounter() {
  let nextBTN = $('nextButton');
  if(nextBTN.innerHTML.match(/Next/i)) { 
    gotoNextPage();
  }
}

function showTestResults(){
  let offer_via = yesNo_Hash["Offer VIA"]['Offer VIA?'];
  return (offer_via == 'Yes' ? true : false);
}

function endNextBTN(){
  let nextBTN = $('nextButton');
  nextBTN.setAttribute("onmousedown","submitVIAtest();");
  nextBTN.innerHTML = "<span>Finish</span>";
  $("inputFrame" + tstCurrentPage).style = "width: 95.5%;";
}