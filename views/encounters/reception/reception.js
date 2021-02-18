var tt_cancel_destination = "/views/patient_dashboard.html?patient_id=" + sessionStorage.patientID;

function addFinishBTN(){
  let btn = $('nextButton');
  btn.setAttribute("onmousedown","createEncounter();");
}

function createEncounter(){
 let reason_a = $('reason_for_visit').value; 
 let reason_b  = $('touchscreenInput' + tstCurrentPage).value; 

 if(reason_a.length < 1 || reason_b.length < 1){
   showMessage('Please select a valid reason');
   return;
 }

 if(reason_a != reason_b){
   showMessage('Please select a valid reason');
   return;
 }

  let currentTime = moment().format(' HH:mm:ss');
  let encounter_datetime = moment(sessionStorage.sessionDate).format('YYYY-MM-DD');
  encounter_datetime += currentTime;

  let encounter = {
     encounter_type_name: 'CxCa reception',
     encounter_type_id: 184,
     patient_id: sessionStorage.patientID,
     encounter_datetime: encounter_datetime
  }

  submitParameters(encounter, "/encounters", "postObs"); 
}

function postObs(encounter){
 let reason_b  = $('touchscreenInput' + tstCurrentPage).value; 

  observations = {
    encounter_id: encounter.encounter_id,
    observations: [
        {concept_id: 6189, value_coded: concept_ids[reason_b]}
    ]
  }; 
  submitParameters(observations, "/observations", "nextPage()"); 
}

function nextPage(obs){
  nextEncounter(sessionStorage.patientID, sessionStorage.programID);
  return; 
}

var concept_ids = {
  "Initial screening": 10036,
  "Postponed treatment": 9997,
  "One year subsequent check-up after treatment": 10035,
  "Subsequent screening": 10037,
  "Problem visit after treatment": 10038,
  "Referral": 9675
};