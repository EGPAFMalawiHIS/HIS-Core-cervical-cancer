var tt_cancel_destination = "/views/patient_dashboard.html?patient_id=" + sessionStorage.patientID;


function setupOutcomes(){
	let nextButton = document.getElementById("nextButton");
	nextButton.setAttribute("onmousedown", "validateOutcomeSelection();");
	nextButton.innerHTML = "<span>Finish</span>";

	const ul = document.getElementById("tt_currentUnorderedListOptions");
	let lists = ul.getElementsByTagName("li");
	for(let li of lists){
		li.setAttribute("onclick", "null; updateTouchscreenInputForSelect(this); updateNextBTN(this);");
	}
}

function validateOutcomeSelection(){
	const selected_outcome = document.getElementById("select_referral_outcome").value;
	if(selected_outcome.match(/cancer/i)){
		gotoNextPage();
	}else{
		submitPreparation();
	}
}

function updateNextBTN(el){
	let nextButton = document.getElementById("nextButton");

	if(el.getAttribute("tstvalue").match(/cancer/i)){
		nextButton.innerHTML = "<span>Next</span>";	
		nextButton.setAttribute("onmousedown", "gotoNextPage();");
	}else{
		nextButton.innerHTML = "<span>Finish</span>";	
		nextButton.setAttribute("onmousedown", "validateOutcomeSelection();");
	}
}
	
function setupFinishBTN(){
	let nextButton = document.getElementById("nextButton");
	nextButton.setAttribute("onmousedown", "submitPreparation();");
}

var conceptName = {
	"Cancer of cervix": 9066,
	"Continue follow-up": 8882 ,
	"Discharged uninfected": 8016,
	"Treatment complete": 1714,
	"Surgery": 5685,
	"Palliative Care": 9053,
	"Discharged": 3626,
	"Other": 6408
};

function submitPreparation(){
	let selected_outcome = Object();
	try {
		selected_outcome = document.getElementById("touchscreenInput0").value;
	}catch(e){
		selected_outcome = document.getElementById("select_referral_outcome").value;
	}

	const referral_outcome_concept_id = conceptName[selected_outcome];

	if(referral_outcome_concept_id == undefined){
		showMessage("Please select referral outcome");
		return;
	}


	parameters = [];

	if(selected_outcome.match(/cancer/i)){
		const selected_tx = document.getElementById("touchscreenInput1").value;
		const selected_tx_concept_id = conceptName[selected_tx];

		if(selected_tx_concept_id == undefined){
			showMessage("Please select treatment option");
			return;
		}

		parameters.push({concept_id: 6538, value_coded: referral_outcome_concept_id});
		parameters.push({concept_id: 10014, value_coded: selected_tx_concept_id});
	}else{
		parameters.push({concept_id: 6538, value_coded: referral_outcome_concept_id});
	}

	const currentTime = moment().format(' HH:mm:ss');
  let encounter_datetime = moment(sessionStorage.sessionDate).format('YYYY-MM-DD'); 
  encounter_datetime += currentTime; 

  const encounter = {
    encounter_type_name: 'CxCa referral feedback',
    encounter_type_id:  184,
    patient_id: sessionStorage.patientID,
    encounter_datetime: encounter_datetime
  }

  submitParameters(encounter, "/encounters", "postObs");
}

var parameters;

function postObs(encounter){
	console.log(parameters);
	var obs = {
    encounter_id: encounter["encounter_id"],
    observations: parameters
  }; 

  submitParameters(obs, "/observations", "updateOutcome"); 
}

function updateOutcome(outcome){
	let selected_outcome = Object();
	try {
		selected_outcome = document.getElementById("touchscreenInput0").value;
	}catch(e){
		selected_outcome = document.getElementById("select_referral_outcome").value;
	}

	const referral_outcome_concept_id = fetched_states[selected_outcome];

	outcome = {
    location_id: locations[sessionStorage.currentLocation],
    state: referral_outcome_concept_id,
    date: sessionStorage.sessionDate
  }
  const state = JSON.stringify(outcome);

  let url = apiProtocol+ '://' + apiURL + ':' + apiPort;
  url += '/api/v1/programs/' + sessionStorage.programID + '/patients/';
  url +=  sessionStorage.patientID + '/states';

  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
      if (this.readyState == 4) {
          if (this.status == 201) {
            let obs = JSON.parse(this.responseText);
            nextEncounter(sessionStorage.patientID, sessionStorage.programID);
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

var locations = {};
var fetched_states = {};

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