var tt_cancel_destination = "/views/patient_dashboard.html?patient_id=" + sessionStorage.patientID;


function selectedCancerConfirmed(){
  let opt = $('select_referral_outcome').value;
  return opt == 'Cancer confirmed' ? true : false
}

function fetchPreviousVIAoutcome(){
  let previous_date = moment(moment(sessionStorage.sessionDate) - 1).format('YYYY-MM-DD');
  let url = apiProtocol+ '://' + apiURL + ':' + apiPort;
  url += '/api/v1/observations?date=' + previous_date + "&person_id=";
  url  +=  sessionStorage.patientID  + "&concept_id=9504";

  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
      if (this.readyState == 4) {
          if (this.status == 200) {
              let obs = JSON.parse(this.responseText);
              for(let i = 0; i < obs.length; i++){
                console.log(obs[i].value_coded);
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

function addAttributes(){
  let nextBTN = $('nextButton');
  nextBTN.innerHTML = "<span>Finish</span>";
  nextBTN.setAttribute("onmousedown","submitEnc();");
  addExtras();
}

function addExtras(){
  let opts  = $('tt_currentUnorderedListOptions').getElementsByTagName('li');
  for(let i = 0; i < opts.length; i++){
    opts[i].setAttribute("onclick",  "null; updateTouchscreenInputForSelect(this);changeNextBTN(this);")
  }
  $('page-load-cover').style = "display: none;";
}

function changeNextBTN(e){
  let select_outcome = e.getAttribute('tstvalue');
  let nextBTN = $('nextButton');
  if(select_outcome  == 'Cancer confirmed'){
    nextBTN.innerHTML = "<span>Next</span>";
    nextBTN.setAttribute("onmousedown","gotoNextPage();");
  }else{
    nextBTN.innerHTML = "<span>Finish</span>";
    nextBTN.setAttribute("onmousedown","submitEnc();");
  }
}

function createEndFunction(){
  let nextBTN = $('nextButton');
  nextBTN.innerHTML = "<span>Finish</span>";
  nextBTN.setAttribute("onmousedown","submitEnc();");
}

var observations;
var final_selected_outcome = '';
var cancer_treatment_procedures = {
  'Surgery': 5685,
  'Cryotherapy': 10521,
  'Palliative care': 9053,
  'Leep': 10002,
  'Thermocoagulation': 9996, 
  'Other': 6408
}

function submitEnc(){
  final_selected_outcome = __$('select_referral_outcome').value;

  if(final_selected_outcome.length < 1){
    showMessage("Please select outcome");
    return;
  }

  if(final_selected_outcome == 'Cancer confirmed'){
    if($('select_cancer_treatment').value == ''){
      showMessage("Please select cancer treatment");
      return;
    }
  }

  updateOutcome();
}

function  updateOutcome(){
  let outcome = {
    location_id: locations[sessionStorage.currentLocation],
    state: fetched_states['Continue follow-up'],
    date: sessionStorage.sessionDate
  }
  let state = JSON.stringify(outcome);

  let url = apiProtocol+ '://' + apiURL + ':' + apiPort;
  url += '/api/v1/programs/' + sessionStorage.programID + '/patients/';
  url +=  sessionStorage.patientID + '/states';

  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
      if (this.readyState == 4) {
          if (this.status == 201) {
            let obs = JSON.parse(this.responseText);
            createEncounter();  
          }
      }
  };
  try {
      req.open('POST', url, true);
      req.setRequestHeader('Authorization', sessionStorage.getItem('authorization'));
      req.setRequestHeader('Content-type', "application/json");
      req.send(state);
  } catch (e) {
  }

}

function createEncounter(){
  let currentTime = moment().format(' HH:mm:ss');
  let encounter_datetime = moment(sessionStorage.sessionDate).format('YYYY-MM-DD');
  encounter_datetime += currentTime;

  let encounter = {
      encounter_type_name: 'CxCa treatment',
      encounter_type_id: 182,
      patient_id: sessionStorage.patientID,
      encounter_datetime: encounter_datetime
  }

  submitParameters(encounter, "/encounters", "postObs");
}

function postObs(encounter){
  let procedure_name = document.getElementById("touchscreenInput" + tstCurrentPage).value

  let observations = {
    encounter_id: encounter.encounter_id,
    observations: [
      {concept_id: 10015, value_coded: cancer_treatment_procedures[procedure_name]}
    ]
  };
  /*let observations = {
    encounter_id: encounter.encounter_id,
    observations: [
      {concept_id: 6538, value_coded: outcome_concepts[final_selected_outcome]}
    ]
  };

  if(final_selected_outcome == 'Cancer confirmed'){
    observations.observations.push({
      concept_id: 10015, 
      value_coded: cancer_treatment_procedures[$('select_cancer_treatment').value]
    })
  }*/

  submitParameters(observations, "/observations", "nextPage"); 
}

function nextPage(obs){
  //window.location.href = "/views/patient_dashboard.html?patient_id=" + sessionStorage.patientID;
  nextEncounter(sessionStorage.patientID, sessionStorage.programID);
}




fetchPreviousVIAoutcome();




var locations = {};
var fetched_states = {};
var outcome_concepts = {};

function fetchLocations(){
  var url = sessionStorage.apiProtocol+ '://' + apiURL + ':' + apiPort + '/api/v1/locations?paginate=false';

  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
      if (this.readyState == 4) {
          if (this.status == 200) {
              let locs = JSON.parse(this.responseText);
              for(let i = 0; i < locs.length; i++){
                locations[locs[i].name] = locs[i].location_id;
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

function fetchStates(){
  let url = sessionStorage.apiProtocol+ '://' + apiURL + ':' + apiPort;
  url += "/api/v1/programs/" + sessionStorage.programID + "/workflows";

  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
      if (this.readyState == 4) {
          if (this.status == 200) {
              let fetched_outcomes = JSON.parse(this.responseText);
              for(let i = 0; i < fetched_outcomes.length; i++){
                let states = fetched_outcomes[i].states;
                for(let s = 0; s < states.length; s++){
                  let concept_id = (states[s].program_workflow_state_id);
                  let concept_name = (states[s].concept.concept_names[0]).name;
                  outcome_concepts[(states[s].concept.concept_names[0]).name] = states[s].concept.concept_names[0].concept_id;
                  fetched_states[concept_name] = concept_id;
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

}





fetchLocations();
fetchStates();