
var tt_cancel_destination = "/views/patient_dashboard.html?patient_id=" + sessionStorage.patientID;



function showPostponedReason() {
  let select_treatment = $('treatment_option').value;
  return (select_treatment == 'Postponed treatment' ? true :  false);
}

function showReferralReason() {
  let treatment_option = $('treatment_option').value;
  return (treatment_option == 'Referral' ? true :  false);
}

function changeNextButton(){
  let inputFrame = $('inputFrame' +  tstCurrentPage);
  inputFrame.style = "width: 95.5%;";
  let nextBTN = $('nextButton');
  nextBTN.setAttribute("onmousedown", "positiveResult();");
  nextBTN.innerHTML = "<span>Finish</span>";
}

/*function addOtherOptionsWait() {
  let inputFrame = $('inputFrame' +  tstCurrentPage);
  inputFrame.style = "width: 95.5%;";
  setTimeout(addOtherOptions(), 500);
}*/

function addOtherOptions() {
  let options = $('tt_currentUnorderedListOptions').getElementsByTagName('li');

  for(let i = 0; i < options.length; i++){
    options[i].setAttribute("onclick", "null; updateTouchscreenInputForSelect(this);changeBTNext(this);");
  }
}

function changeBTNext(e){
  let select_option = e.getAttribute('tstvalue');
  let nextBTN = $('nextButton');
  
  if(select_option ==  "Same day Treatment"){
    nextBTN.setAttribute("onmousedown", "positiveResult();");
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
/*
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
  */
}

/*
function postObs(encounter){
  observations.encounter_id = encounter.encounter_id;

  submitParameters(observations, "/observations", "nextPage");
}
*/

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
                global_screening_method = concept.concept_names[0].name;
                setTimeout(function(){ loadTreatmentOptions(global_screening_method); }, 1000);
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
              if(obs.length > 0){
                fetchScreeningMthod(obs[0].value_coded);
              }else{
                window.location =  tt_cancel_destination;
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

var global_screening_method;

function resetTreatmentOptions(){
  if(global_screening_method){
    let options = __$('tt_currentUnorderedListOptions').getElementsByTagName('li');

    for(let i = 0; i < options.length; i++){
      let onlickOptions = "null; updateTouchscreenInputForSelect(this);";
      onlickOptions  += "changeNextIfneccessary(this);"
      options[i].setAttribute("onclick", onlickOptions); 
    }
  }
}

function loadTreatmentOptions(screening_method){
  let screening_result = document.getElementById('screening_result');
  let screening_result_main = document.getElementById('tt_currentUnorderedListOptions');
  let options;

  if(screening_method.match(/via/i)){
    options = ["VIA Negative","VIA Positive","Suspect Cancer"];
  }else if(screening_method.match(/smear/i)){
    options = ["PAP Smear Normal","PAP Smear Abnormal"];
  }else if(screening_method.match(/HPV DNA/i)){
    options = ["HPV positive","HPV negative"];
  }else if(screening_method.match(/Speculum/i)){
    options = ["Visible Lesion","No visible Lesion","Other Gynae"];
  }

  addVIAoptions(screening_result, options, screening_result_main);
  $('spinner').style = 'display: none;';
  $('cover').style = 'display: none;';
}

function addVIAoptions(e, options, el){
  let className = 'odd';

  try {
    for(let i = 0; i < options.length; i++){
      let opt = document.createElement('option');
      opt.innerHTML = options[i];
      opt.setAttribute("value", options[i]);
      e.appendChild(opt);

      let li = document.createElement("li");
      li.setAttribute("onmousedown","");
      li.setAttribute("class", (className == 'odd'? "even": "odd"));
      className = li.getAttribute("class");
      li.innerHTML = options[i];
      li.setAttribute("tstvalue", options[i]); 
      li.setAttribute("id", i); 
      let onlickOptions = "null; updateTouchscreenInputForSelect(this);";
      onlickOptions  += "changeNextIfneccessary(this);"
      li.setAttribute("onclick", onlickOptions); 
      el.appendChild(li);  
    }
  }catch(z){
    window.location.reload();
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

function changeNextIfneccessary(e){
  let nextButton =  __$('nextButton');
  let selected_option = e.getAttribute('tstvalue');

  if(selected_option.match(/Negative/i) || selected_option.match(/smear normal/i)
    || selected_option.match(/No visible/i) || selected_option.match(/Suspect/i)){
      nextButton.setAttribute("onmousedown","negativeResult();");
      nextButton.innerHTML = "<span>Finish</span>";
  }else{
    nextButton.setAttribute("onmousedown","gotoNextPage();");
    nextButton.innerHTML = "<span>Next</span>";
  }
}

function negativeResult(){
  let encounter_obj = encounterOBJ();
  submitParameters(encounter_obj, "/encounters", "postNegativeResults");
}

function postNegativeResults(encounter){
  let screening_result_text = __$('screening_result').value;
  let screening_result_concept = resultConcept(screening_result_text);
  /*let treatment_option = 10029;

  /*let obs = {
    encounter_id: encounter.encounter_id,
    observations: [
      {concept_id: 10040, value_coded: screening_result_concept},
      {concept_id: 3567, value_coded: treatment_option}
    ]
  };*/

  let obs = {
    encounter_id: encounter.encounter_id,
    observations: [
      {concept_id: 10040, value_coded: screening_result_concept}
    ]
  };

  if(screening_result_text.match(/HPV positive/i))
    addHPVVIAdata(obs.observations);

  submitParameters(obs, "/observations", "nextPage");
}

function conceptReason(reason){
  let reasons = {
    "Client NOT ready": 9998,
    "Treatment not available": 9999,
    "Other conditions": 2431,
    "Unable to treat client": 10000,
    "Further Investigation and Management": 10031,
    "Suspect cancer": 10032,
    "Large Lesion (greater than 75 percent)": 10030
  };
  return reasons[reason];
}


function resultConcept(concept_name){
  let screening_results = {
    "VIA Negative": 10041,
    "Suspect Cancer": 10032,
    "PAP Smear Normal": 10023,
    "HPV negative": 10025,
    "No visible Lesion": 10028,
    "Other Gynae": 6537,
    "VIA Positive": 10042,
    "PAP Smear Abnormal": 10024,
    "HPV positive": 10026,
    "Visible Lesion": 10027
  };
  return screening_results[concept_name];
}

function treatmentOptions(concept_name){
  let treatment_options = {
    "Same day Treatment": 10029,
    "Postponed treatment": 9997,
    "Referral": 9675
  };
  return treatment_options[concept_name];
}

function encounterOBJ(){
  let currentTime = moment().format(' HH:mm:ss');
  let encounter_datetime = moment(sessionStorage.sessionDate).format('YYYY-MM-DD');
  encounter_datetime += currentTime;

  return {
      encounter_type_name: 'CxCa screening result',
      encounter_type_id: 186,
      patient_id: sessionStorage.patientID,
      encounter_datetime: encounter_datetime
  }
}


function positiveResult(){
  let encounter_obj = encounterOBJ();
  submitParameters(encounter_obj, "/encounters", "postPositiveResults");
}

function postPositiveResults(encounter){
  let treatment_option_text = __$('treatment_option').value;
  let screening_result_text = __$('screening_result').value;

  let screening_result_concept = resultConcept(screening_result_text);
  let treatment_option = treatmentOptions(treatment_option_text);

  let obs = {
    encounter_id: encounter.encounter_id,
    observations: [
      {concept_id: 10040, value_coded: screening_result_concept},
      {concept_id: 3567, value_coded: treatment_option}
    ]
  };

  if(treatment_option_text.match(/referral/i)){
    obs.observations.push({concept_id: 1739, value_coded: conceptReason(__$('referral_reason').value)})
    obs.observations.push({concept_id: 10011, value_text: conceptReason(__$('referred_location').value)})
  }else if(treatment_option_text.match(/postponed/i)){
    obs.observations.push({concept_id: 10010, value_coded: conceptReason(__$('postponed_reason').value)})
  }

  if(screening_result_text.match(/HPV positive/i))
    addHPVVIAdata(obs.observations);

  submitParameters(obs, "/observations", "nextPage");
}

function addHPVVIAdata(ob){
  let offer_via = __$('offer_via').value;

  if(offer_via.match(/yes/i)){
    let via_screening_results = __$('via_screening_results').value;
    if(via_screening_results == 'VIA negative'){
      via_screening_results = 10041;
    }else if(via_screening_results == 'VIA positive'){
      via_screening_results = 10042;
    }else if(via_screening_results == 'Suspect Cancer'){
      via_screening_results = 10032;
    }
    ob.push({concept_id: 9522, value_coded: 1065});
    ob.push({concept_id: 9514, value_coded: via_screening_results});
  }else{
    let reason_for_not_offering_via = __$('reason_for_not_offering_via').value;
    if(reason_for_not_offering_via == 'Client NOT ready'){
      reason_for_not_offering_via = 9998;
    }else if(reason_for_not_offering_via == 'Treatment not available'){
      reason_for_not_offering_via = 9999;
    }else if(reason_for_not_offering_via == 'Other conditions'){
      reason_for_not_offering_via = 5533;

    }
    ob.push({concept_id: 9522, value_coded: 1066});
    ob.push({concept_id: 2431, value_coded: reason_for_not_offering_via});
  }
}



fetchTreatmentOptions();