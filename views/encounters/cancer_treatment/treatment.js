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

function addExtras(){
  let opts  = $('tt_currentUnorderedListOptions').getElementsByTagName('li');
  for(let i = 0; i < opts.length; i++){
    opts[i].setAttribute("onclick",  "null; updateTouchscreenInputForSelect(this);changeNextBTN(this);")
  }
}

function changeNextBTN(e){
  let select_outcome = e.getAttribute('tstvalue');
  let nextBTN = $('nextButton');
  const figo_staging_results =  $('figo_staging_results').value;

  if(select_outcome  == 'Not available' && figo_staging_results == 'Not available'){
    nextBTN.innerHTML = "<span>Finish</span>";
    nextBTN.setAttribute("onmousedown","updateOutcome('Continue follow-up');");
  }else{
    nextBTN.innerHTML = "<span>Next</span>";
    nextBTN.setAttribute("onmousedown","gotoNextPage();");
  }
}

function addEndFunction(){
  let nextBTN = $('nextButton');
  nextBTN.setAttribute("onmousedown","validateEntry();");
}

function validateEntry(){
  const outcome = $('touchscreenInput' + tstCurrentPage).value;
  const options = $('options').getElementsByTagName('li');
  let valid_outcome = false;

  for(const li of options){
    if(li.textContent == outcome)
      valid_outcome = true;

  }

  if(!valid_outcome){
    showMessage("Please select a valid outcome");
    return;
  }

  createEncounter();
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

function updateOutcome(concept_name){
  let outcome = {
    location_id: locations[sessionStorage.currentLocation],
    state: fetched_states[concept_name],
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
            if(concept_name == 'Continue follow-up'){
              createEncounter();  
            }else{
              uploadObservations();
            }
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

var observations;

function postObs(encounter){
  let figo_staging_results = $('figo_staging_results').value;
  let type_of_sample_collected = $('type_of_sample_collected').value;

  if(figo_staging_results == 'Not available' && type_of_sample_collected == 'Not available'){
    observations = {
      encounter_id: encounter.encounter_id,
      observations: [
        {concept_id: 10545, value_coded: 1107},
        {concept_id: 6680, value_coded: 1107}
      ]
    };
    uploadObservations();
  }else{
    observations = {
      encounter_id: encounter.encounter_id,
      observations: []
    };

    let histology_results = $('histology_results').value;
    let complications_during_lletz = $('complications_during_lletz').value;
    let select_referral_outcome = $('select_referral_outcome').value;
    let recommended_plan_of_care_for_lletz = $('recommended_plan_of_care_for_lletz').value;
    let patient_outcome = $('touchscreenInput' + tstCurrentPage).value;

    if(type_of_sample_collected != 'Not available'){
      observations.observations.push({concept_id: 6680, value_coded: getConceptCode(type_of_sample_collected)});
    }

    if(figo_staging_results != 'Not available'){
      observations.observations.push({concept_id: 10545, value_coded: getConceptCode(figo_staging_results)});
    }

    if(type_of_sample_collected != 'Not available'){
      observations.observations.push({concept_id: 10548, value_coded: getConceptCode(histology_results)});
    }

    if(type_of_sample_collected == 'LLETZ sample'){
      observations. observations.push({concept_id: 6406, value_coded: getConceptCode(complications_during_lletz)});
    }

    observations.observations.push({concept_id: 1185, value_coded: getConceptCode(select_referral_outcome)});

    if(select_referral_outcome == 'LLETZ'){
      observations.observations.push({concept_id: 10561, value_coded: getConceptCode(recommended_plan_of_care_for_lletz)});
    }

    updateOutcome(patient_outcome);
  }
}


function uploadObservations(){
  submitParameters(observations, "/observations", "nextPage"); 
}

function nextPage(obs){
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




function getConceptCode(name) {
  concept_names = {
    'Punch Biopsy': 10546,
    'LLETZ sample': 10547,
    'Normal': 1115,
    'CIN 1': 10551,
    'CIN 2': 10552,
    'CIN 3': 10553,
    'Carcinoma in Situ': 10554,
    'Invasive cancer of cervix': 2588,
    'Benign cervical warts': 10550,
    'Not available': 1107,
    'Bleeding': 7918,
    'Pain': 9593,
    'None': 1107,
    'Hysterectomy': 5276,
    'Cryotherapy': 10521,
    'Leep': 10002,
    'Palliative Care': 9053,
    'LLETZ': 10560,
    'Conisation': 10557,
    'Thermocoagulation': 9996,
    'Chronic cervicitis': 10549,
    'Patient refused': 3580,
    'Hysyerectomy': 10556,
    'Trachelectomy': 10558,
    'Discharged': 3626,
    'Continue follow-up': 8882,
    'No Dysplasia/Cancer': 10559,
    'Patient died': 1742,
    'Cervical stage 1': 8739,
    'Cervical stage 2': 8787,
    'Cervical stage 3': 8788,
    'Cervical stage 4': 8740 
  };
  return concept_names[name]
}