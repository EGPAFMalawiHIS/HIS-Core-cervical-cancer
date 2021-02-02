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
  $('nextButton').setAttribute('onmousedown','submitParams();')
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
  return;

  let results_available = yesNo_Hash['VIA results available']['Results available?'];
  let nextBTN = $('nextButton');
  
  if(results_available == 'Yes'){
    nextBTN.innerHTML = "<span>Finish</span>";
    nextBTN.setAttribute('onmousedown','submitParams()')
  }else{
    nextBTN.innerHTML = "<span>Next</span>";
    nextBTN.setAttribute('onmousedown','gotoNextPage();')
  }
}

function setNextBTN(){
  return
  let nextBTN = $('nextButton');
  nextBTN.setAttribute('onmousedown',"finishEncounter();") 
  let results_available;
  
  try {
    results_available = yesNo_Hash['VIA results available']['Results available?'];
    if(results_available == 'Yes'){
      checkIfresultsAvailable();
      nextBTN.setAttribute('onmousedown','submitParams()')
    }
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
  nextBTN.setAttribute("onmousedown","submitParams();");
  nextBTN.innerHTML = "<span>Finish</span>";
  $("inputFrame" + tstCurrentPage).style = "width: 95.5%;";
}

var observations;

function calculateEstimatedDate(period){
  let startDate = new Date(sessionStorage.sessionDate);
  let todays_date = startDate;

  if (period == "6 months") {
    startDate.setDate(todays_date.getDate() - (28 * 6));
  } else if (period == "12 months") {
      startDate.setDate(todays_date.getDate() - (28 * 12));
  } else if (period == "18 months") {
      startDate.setDate(todays_date.getDate() - (28 * 18));
  } else if (period == "24 months") {
      startDate.setDate(todays_date.getDate() - (28 * 24));
  } else if (period == "Over 2 years") {
      startDate.setDate(todays_date.getDate() - (28 * 30));
  }

  return moment(startDate).format("YYYY-MM-DD");
}

function submitParams(){

  if(yesNo_Hash["VIA Reception"]["Ever had VIA?"] ==  'Yes' && 
    yesNo_Hash["VIA results available"]["Results available?"] == "Yes" && 
      yesNo_Hash["Offer VIA"]["Offer VIA?"] == "Yes"){

      let previous_via_location  = locations[$('via_location').value];
      let previous_via_year = $('via_test_year').value;
      let previous_via_date;
      let via_date_estimated = 0;
      let previous_via_result = VIAresults[$('previous_via_test_results').value];
      let via_result = VIAresults[$('touchscreenInput' + tstCurrentPage).value];

      if(previous_via_year.toLowerCase() == 'unknown'){
        previous_via_date = calculateEstimatedDate($('previous_via_date_estimation').value);
        via_date_estimated = 1;
      }else{
        let via_month = $('via_test_month').value;
        let  via_day = $('via_test_day').value;
        previous_via_date = moment(`${previous_via_year}-${via_month}-${via_day}`).format("YYYY-MM-DD");
      }

      observations = {
        encounter_id: null,
        observations: [
            {concept_id: 9991, value_coded: 1065},
            {concept_id: 9515, value_coded: 1065},
            {concept_id: 9992, value_coded: 1065},
            {concept_id: 9994, value_coded: (via_date_estimated == 1 ? 7437 : null), value_datetime: previous_via_date}, 
            {concept_id: 10012, value_text: previous_via_location},
            {concept_id: 10013, value_coded: previous_via_result},
            {concept_id: 9504, value_coded: via_result}
        ]
      };

     
    }else if(yesNo_Hash["VIA Reception"]["Ever had VIA?"] ==  'Yes' && 
    yesNo_Hash["VIA results available"]["Results available?"] == "Yes" && 
      yesNo_Hash["Offer VIA"]["Offer VIA?"] == "No"){

      let previous_via_location  = locations[$('via_location').value];
      let previous_via_year = $('via_test_year').value;
      let previous_via_date;
      let via_date_estimated = 0;
      let previous_via_result = VIAresults[$('previous_via_test_results').value];
      let reason_for_no_via = ReasonForNoVIA[$('touchscreenInput' + tstCurrentPage).value];

      if(previous_via_year.toLowerCase() == 'unknown'){
        previous_via_date = calculateEstimatedDate($('previous_via_date_estimation').value);
        via_date_estimated = 1;
      }else{
        let via_month = $('via_test_month').value;
        let  via_day = $('via_test_day').value;
        previous_via_date = moment(`${previous_via_year}-${via_month}-${via_day}`).format("YYYY-MM-DD");
      }

      observations = {
        encounter_id: null,
        observations: [
            {concept_id: 9991, value_coded: 1065},
            {concept_id: 9515, value_coded: 1065},
            {concept_id: 9992, value_coded: 1066},
            {concept_id: 9994, value_coded: (via_date_estimated == 1 ? 7437 : null), value_datetime: previous_via_date}, 
            {concept_id: 10012, value_text: previous_via_location},
            {concept_id: 10013, value_coded: previous_via_result},
            {concept_id: 10008, value_coded: reason_for_no_via}
        ]
      };
     
  }else if(yesNo_Hash["VIA Reception"]["Ever had VIA?"] ==  'Yes' && 
    yesNo_Hash["VIA results available"]["Results available?"] == "No" &&
      yesNo_Hash["Offer VIA"]["Offer VIA?"] == "Yes"){

        let via_result = VIAresults[$('touchscreenInput' + tstCurrentPage).value];
        observations = {
          encounter_id: null,
          observations: [
              {concept_id: 9991, value_coded: 1065},
              {concept_id: 9515, value_coded: 1066},
              {concept_id: 9992, value_coded: 1065},
              {concept_id: 9504, value_coded: via_result}
          ]
        };

  }else if(yesNo_Hash["VIA Reception"]["Ever had VIA?"] ==  'Yes' && 
    yesNo_Hash["VIA results available"]["Results available?"] == "No" &&
      yesNo_Hash["Offer VIA"]["Offer VIA?"] == "No"){

        let reason_for_no_via = ReasonForNoVIA[$('touchscreenInput' + tstCurrentPage).value];
        observations = {
          encounter_id: null,
          observations: [
              {concept_id: 9991, value_coded: 1065},
              {concept_id: 9515, value_coded: 1066},
              {concept_id: 9992, value_coded: 1066},
              {concept_id: 10008, value_coded: reason_for_no_via}
          ]
        };

  }else if(yesNo_Hash["Offer VIA"]["Offer VIA?"] == "No" &&  
    yesNo_Hash["VIA Reception"]["Ever had VIA?"] ==  'No'){
      let reason_for_no_via = ReasonForNoVIA[$('touchscreenInput' + tstCurrentPage).value];
      observations = {
        encounter_id: null,
        observations: [
            {concept_id: 9991, value_coded: 1065},
            {concept_id: 9992, value_coded: 1066},
            {concept_id: 10008, value_coded: reason_for_no_via}
        ]
      };


    }else if(yesNo_Hash["VIA Reception"]["Ever had VIA?"] ==  'No' && 
      yesNo_Hash["Offer VIA"]["Offer VIA?"] == "Yes"){

        let via_result = VIAresults[$('touchscreenInput' + tstCurrentPage).value];
        observations = {
          encounter_id: null,
          observations: [
              {concept_id: 9991, value_coded: 1066},
              {concept_id: 9992, value_coded: 1065},
              {concept_id: 9504, value_coded: via_result}
          ]
        };


  }else if(yesNo_Hash["Offer VIA"]["Offer VIA?"] == "Yes"){
    let via_result = VIAresults[$('touchscreenInput' + tstCurrentPage).value];
    observations = {
      encounter_id: null,
      observations: [
          {concept_id: 9991, value_coded: 1065},
          {concept_id: 9504, value_coded: via_result}
      ]
    };


  }else if(yesNo_Hash["Offer VIA"]["Offer VIA?"] == "No"){
    let reason_for_no_via = ReasonForNoVIA[$('touchscreenInput' + tstCurrentPage).value];

    observations = {
      encounter_id: null,
      observations: [
          {concept_id: 9991, value_coded: 1066},
          {concept_id: 10008, value_coded:  reason_for_no_via}
      ]
    };


  }else if(yesNo_Hash["VIA Reception"]["Ever had VIA?"] ==  "No" && 
    yesNo_Hash["Offer VIA"]["Offer VIA?"] == "Yes"){

      let via_result = VIAresults[$('touchscreenInput' + tstCurrentPage).value];
      observations = {
        encounter_id: null,
        observations: [
            {concept_id: 9991, value_coded: 1066},
            {concept_id: 9992, value_coded: 1065},
            {concept_id: 9504, value_coded: via_result}
        ]
      };



  }else if(yesNo_Hash["VIA Reception"]["Ever had VIA?"] ==  "No" && 
    yesNo_Hash["Offer VIA"]["Offer VIA?"] == "No"){

      let reason_for_no_via = ReasonForNoVIA[$('touchscreenInput' + tstCurrentPage).value];
        observations = {
          encounter_id: null,
          observations: [
              {concept_id: 9991, value_coded: 1066},
              {concept_id: 9992, value_coded: 1066},
              {concept_id: 10008, value_coded: reason_for_no_via}
          ]
        };
      
  }else{
    showMessage("Something went wrong. Please call support");
    return;
  }


  createEncounter(observations);
}

function createEncounter(observations){
  let currentTime = moment().format(' HH:mm:ss');
  let encounter_datetime = moment(sessionStorage.sessionDate).format('YYYY-MM-DD');
  encounter_datetime += currentTime;

  let encounter = {
      encounter_type_name: 'VIA test',
      encounter_type_id: 181,
      patient_id: sessionStorage.patientID,
      encounter_datetime: encounter_datetime
  }

  console.log(encounter);
  submitParameters(encounter, "/encounters", "postObs");
}

function postObs(encounter){
  observations.encounter_id = encounter.encounter_id;

  submitParameters(observations, "/observations", "nextPage");
}

function nextPage(obs){
  //window.location.href = "/views/patient_dashboard.html?patient_id=" + sessionStorage.patientID;
  nextEncounter(sessionStorage.patientID, sessionStorage.programID);
  return;
}

const VIAresults = {
  "Negative": 664, 
  "Positive": 703,
  "Suspect": 9995
};

const ReasonForNoVIA =  {
  "Not applicable": 1175,
  "Client preferred counseling": 10007
};


function enterPreviousVIAdata() {
  try {
    let results_available = yesNo_Hash['VIA results available']['Results available?'] == 'Yes';
    let ever_had_via = yesNo_Hash['VIA Reception']['Ever had VIA?'] == 'Yes';

    return (results_available  == ever_had_via);
  }catch(e){
    return false;
  }
}

function configureVIAtestMonthCSS() {
  let via_test_month = $('inputFrame' + tstCurrentPage);
  via_test_month.style = "width: 95.5%; height: 86%;"

  $('viewport').style = "height: 85%;"

}

function ShowCategory2(category) {
  if (category.length < 1)
      return;

  var pos = checkCtrl(__$("content"));

  if (__$("category")) {
      document.body.removeChild(__$("category"));
  }

  var cat = document.createElement("div");
  cat.id = "category";
  cat.style.position = "absolute";
  cat.style.right = "10px";
  cat.style.top = (pos[2] + 2) + "px";
  cat.style.fontSize = "26px";
  cat.style.padding = "10px";
  cat.style.backgroundColor = "#9e9";
  cat.style.borderColor = "#7c7";
  cat.style.color = "#000";
  cat.style.opacity = "0.95";
  cat.style.zIndex = 100;
  cat.style.textAlign = "center";
  cat.style.borderRadius = "30px";
  cat.innerHTML = category;

  document.body.appendChild(cat);
}

function SelectLocation(location_id){

}

var locations = {};

function fetchLocations(){
  var url = sessionStorage.apiProtocol+ '://' + apiURL + ':' + apiPort + '/api/v1/locations?paginate=false';

  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
      if (this.readyState == 4) {
          if (this.status == 200) {
              let locs = JSON.parse(this.responseText);
              for(let i = 0; i < locs.length; i++){
                locations[locs[i].location_id] = locs[i].name;
              }
          }
      }
  };
  try {
      req.open('GET', url, true);
      req.setRequestHeader('Authorization', sessionStorage.getItem('authorization'));
      req.send(null);
  } catch (e) {
  }

}

function newVIAclient(){

  let previous_date = moment(moment(sessionStorage.sessionDate) - 1).format('YYYY-MM-DD');
  let url = apiProtocol+ '://' + apiURL + ':' + apiPort;
  url += '/api/v1/observations?date=' + previous_date + "&person_id=";
  url  +=  sessionStorage.patientID  + "&concept_id=9991";
  $('page-load-cover').style="display: inline;";

  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
      if (this.readyState == 4) {
          if (this.status == 200) {
              let obs = JSON.parse(this.responseText);
              for(let i = 0; i < obs.length; i++){
                if(obs[i].concept_id == 9991){
                  gotoNextPage();
                  $('page-load-cover').style="display: none;";
                  return;
                }
              }
          }
      }
  };
  try {
      req.open('GET', url, true);
      req.setRequestHeader('Authorization', sessionStorage.getItem('authorization'));
      req.send(null);
  } catch (e) {
  }
  
  $('page-load-cover').style="display: none;";
}

fetchLocations();