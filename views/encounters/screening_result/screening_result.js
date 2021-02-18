
var tt_cancel_destination = "/views/patient_dashboard.html?patient_id=" + sessionStorage.patientID;



function showPostponedReason() {
  let select_treatment = $('treatment_option').value;
  return (select_treatment == 'Postponed treatment' ? true :  false);
}

function showReferralReason() {
  let select_treatment = $('select_treatment').value;
  return (select_treatment == 'Referral' ? true :  false);
}

function changeNextButton(){
  let inputFrame = $('inputFrame' +  tstCurrentPage);
  inputFrame.style = "width: 95.5%;";
  let nextBTN = $('nextButton');
  nextBTN.setAttribute("onmousedown", "createEncounter();");
  nextBTN.innerHTML = "<span>Finish</span>";
}

function addOtherOptionsWait() {
  let inputFrame = $('inputFrame' +  tstCurrentPage);
  inputFrame.style = "width: 95.5%;";
  setTimeout(addOtherOptions(), 500);
}

function addOtherOptions() {
  let options = $('tt_currentUnorderedListOptions').getElementsByTagName('li');

  for(let i = 0; i < options.length; i++){
    options[i].setAttribute("onclick", "null; updateTouchscreenInputForSelect(this);changeBTNext(this);");
  }
}

function changeBTNext(e){
  let select_option = e.getAttribute('tstvalue');
  let nextBTN = $('nextButton');
  
  if(select_option ==  "Yes"){
    nextBTN.setAttribute("onmousedown", "createEncounter();");
    nextBTN.innerHTML = "<span>Finish</span>";
  }else{
    nextBTN.setAttribute("onmousedown", "gotoNextPage();");
    nextBTN.innerHTML = "<span>Next</span>";
  }
}

var observations;
const VIAtretments  =  {
  "Thermocoagulation": 9996,
  "Cryo": 9506,
  "Postponed treatment": 9997,
  "Referral": "9675" 
}

const viaPostponedReasons = {
  "Client NOT ready": 9998,
  "Treatment NOT available": 9999,
  "Other conditions": 6408
}

const viaReferralReasons = {
  "Unable to treat client": 10000,
  "Treatment not available": 9999,
  "Other conditions": 6408
}

function  createEncounter(){

  let selected_option = $('select_treatment').value;
  if(selected_option == 'Cryo' || selected_option == 'Thermocoagulation'){

    observations = {
      encounter_id: null,
      observations: [
          {concept_id: 10009, value_coded: VIAtretments[selected_option]}
      ]
    };

  }else if(selected_option == 'Postponed treatment'){
    if($('postponed_reason').value == ""){
      showMessage("Please select a valid reason");
      return;
    }

    observations = {
      encounter_id: null,
      observations: [
          {concept_id: 10009, value_coded: VIAtretments[selected_option]},
          {concept_id: 10010 , value_coded: viaPostponedReasons[$('postponed_reason').value]}
      ]
    };
  }else if(selected_option == 'Referral'){
    if($('referred_location').value == ""){
      showMessage("Please select a valid location");
      return;
    }

    observations = {
      encounter_id: null,
      observations: [
          {concept_id: 10009, value_coded: VIAtretments[selected_option]},
          {concept_id: 1739 , value_coded: viaReferralReasons[$('referral_reason').value]},
          {concept_id: 10011, value_text:  $('touchscreenInput' + tstCurrentPage).value}
      ]
    };
  }else{
    showMessage("Please select a valid treatment option");
  }

  let currentTime = moment().format(' HH:mm:ss');
  let encounter_datetime = moment(sessionStorage.sessionDate).format('YYYY-MM-DD');
  encounter_datetime += currentTime;

  let encounter = {
      encounter_type_name: 'VIA treatment',
      encounter_type_id: 182,
      patient_id: sessionStorage.patientID,
      encounter_datetime: encounter_datetime
  }

  submitParameters(encounter, "/encounters", "postObs");
}

function postObs(encounter){
  observations.encounter_id = encounter.encounter_id;

  submitParameters(observations, "/observations", "nextPage");
}

function nextPage(obs){
  //window.location.href = "/views/patient_dashboard.html?patient_id=" + sessionStorage.patientID;
  nextEncounter(sessionStorage.patientID, sessionStorage.programID);
}















function fetchScreeningMthod(concept_id){
  let url = sessionStorage.apiProtocol+ '://' + apiURL + ':' + apiPort + '/api/v1/concepts/' + concept_id;

  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
      if (this.readyState == 4) {
          if (this.status == 200) {
              let concept = JSON.parse(this.responseText);
              if(concept){
                loadTreatmentOptions(concept.concept_names[0].name)
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

function fetchTreatmentOptions(){
  let url = sessionStorage.apiProtocol+ '://' + apiURL + ':' + apiPort + '/api/v1/observations';
  url += "?concept_id=10038&end_date=" + sessionStorage.sessionDate + "&start_date=1900-01-01";
  url += '&person_id=' + sessionStorage.patientID + "&page_size=1&page=0";

  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
      if (this.readyState == 4) {
          if (this.status == 200) {
              let obs = JSON.parse(this.responseText);
              if(obs){
                fetchScreeningMthod(obs[0].value_coded);
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

function loadTreatmentOptions(screening_method){
  let select_treatment = $('screening_result');
  let options;

  if(screening_method.match(/via/i)){
    options = ["Thermocoagulation","POSITIVE CRYO","Suspect Cancer"];
  }else if(screening_method.match(/smear/i)){
    options = ["PAP Smear Normal","PAP Smear Abnormal"];
  }else if(screening_method.match(/HPV DNA/i)){
    options = ["HPV positive","HPV negative"];
  }else if(screening_method.match(/Speculum/i)){
    options = ["Visble Lesion","No visble Lesion"];
  }

  addVIAoptions(select_treatment, options);
  $('spinner').style = 'display: none;';
  $('cover').style = 'display: none;';
  //gotoPage(tstCurrentPage);
}

function addVIAoptions(e, options){
  for(let i = 0; i < options.length; i++){
    let opt = document.createElement('option');
    opt.innerHTML = options[i];
    opt.setAttribute("value", options[i]);
    e.appendChild(opt);
  }
}

function disableENDbtn(){
  $('nextButton').setAttribute('onmousedown','');
}

function createScreeningResult(){
  let screening_result = $('screening_result').value;
  let treatment_option = $('treatment_option').value;
  console.log(screening_result);
  console.log(treatment_option);
}

fetchTreatmentOptions();