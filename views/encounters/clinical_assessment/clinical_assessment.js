var tt_cancel_destination = "/views/patient_dashboard.html?patient_id=" + sessionStorage.patientID;


var YesNoConcepts = {};
YesNoConcepts["Yes"] = 1065;
YesNoConcepts["No"] = 1066;


  function addCxCaYesNo() {
    var tar = document.getElementById("inputFrame" + tstCurrentPage);
    var attr = 'Ever had CxCa screening?,9991'
    buildYesNoUI('CxCa screening', attr, tar);
}
  
function addOfferCxCaYesNo() {
    var tar = document.getElementById("inputFrame" + tstCurrentPage);
    var attr = 'Offer CxCa screening?,9992'
    buildYesNoUI('Offer CxCa screening', attr, tar);
}

function setReasonForNoVIA() {
  let inputFrame = $("inputFrame" + tstCurrentPage);
  inputFrame.setAttribute("style","width: 95.5% !important;");
  let touchscreenInput =  $('touchscreenInput' + tstCurrentPage);
  touchscreenInput.style = "width: 100%;";
  $('nextButton').setAttribute('onmousedown','submitParams();')
}

function addCxCaResultsAvailableYesNo() {
    var tar = document.getElementById("inputFrame" + tstCurrentPage);
    var attr = 'Results available?,1805,checkIfresultsAvailable'
    buildYesNoUI('CxCa results available', attr, tar);
}


function showResultsAvailable(){
  if(__$('reason_for_visit').value == 'Initial screening'){
    yesNo_Hash['CxCa screening'] = {};
    yesNo_Hash['CxCa screening']['Ever had CxCa screening?'] = 'No'
    return false;
  }else{
    let everHadVIA = yesNo_Hash['CxCa screening']['Ever had CxCa screening?'];
    return (everHadVIA == "Yes" ? true : false);
  }
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
  let waiting_for_lab_tests = __$('waiting_for_lab_tests').value;

  if(yesNo_Hash["CxCa screening"]["Ever had CxCa screening?"] ==  'Yes' && 
    yesNo_Hash["CxCa results available"]["Results available?"] == "Yes" && 
      yesNo_Hash["Offer CxCa screening"]["Offer CxCa screening?"] == "Yes"){

      let previous_cxca_location  = locations[$('cxca_location').value];
      let previous_cxca_year = $('cxca_test_year').value;
      let previous_cxca_date;
      let cxca_date_estimated = 0;
      let previous_screening_method = CxCaScreeningMethods[$('previous_screening_method').value];
      let screening_method = CxCaScreeningMethods[screeningMethod()];
      let treatment_status = treatmentStatus[$('touchscreenInput' + tstCurrentPage).value];
      waiting_for_lab_tests = (waiting_for_lab_tests == 'No' ? 1066 : 1065);

      if(previous_cxca_year.toLowerCase() == 'unknown'){
        previous_cxca_date = calculateEstimatedDate($('previous_cxca_date_estimation').value);
        cxca_date_estimated = 1;
      }else{
        let cxca_month = $('cxca_test_month').value;
        let  cxca_day = $('cxca_test_day').value;
        previous_cxca_date = moment(`${previous_cxca_year}-${cxca_month}-${cxca_day}`).format("YYYY-MM-DD");
      }

      observations = {
        encounter_id: null,
        observations: [
            {concept_id: 9991, value_coded: 1065},
            {concept_id: 9993, value_coded: 1065},
            {concept_id: 9992, value_coded: 1065},
            {concept_id: 10038, value_coded: screening_method},
            {concept_id: 9994, value_coded: (cxca_date_estimated == 1 ? 7437 : null), value_datetime: previous_cxca_date}, 
            {concept_id: 10012, value_text: previous_cxca_location},
            {concept_id: 10039, value_coded: previous_screening_method},
            {concept_id: 10009, value_coded: treatment_status},
            {concept_id: 2224, value_coded: waiting_for_lab_tests}
        ]
      };

     
    }else if(yesNo_Hash["CxCa screening"]["Ever had CxCa screening?"] ==  'Yes'  && 
    yesNo_Hash["CxCa results available"]["Results available?"] == "Yes" && 
    yesNo_Hash["Offer CxCa screening"]["Offer CxCa screening?"] == "No"){

      let previous_cxca_location  = locations[$('cxca_location').value];
      let previous_cxca_year = $('cxca_test_year').value;
      let previous_cxca_date;
      let cxca_date_estimated = 0;
      let previous_screening_method = CxCaScreeningMethods[$('previous_screening_method').value];
      let reason_for_no_cxca = ReasonForNoCxCa[$('touchscreenInput' + tstCurrentPage).value];

      if(previous_cxca_year.toLowerCase() == 'unknown'){
        previous_cxca_date = calculateEstimatedDate($('previous_cxca_date_estimation').value);
        cxca_date_estimated = 1;
      }else{
        let cxca_month = $('cxca_test_month').value;
        let  cxca_day = $('cxca_test_day').value;
        previous_cxca_date = moment(`${previous_cxca_year}-${cxca_month}-${cxca_day}`).format("YYYY-MM-DD");
      }

      observations = {
        encounter_id: null,
        observations: [
            {concept_id: 9991, value_coded: 1065},
            {concept_id: 9993, value_coded: 1065},
            {concept_id: 9992, value_coded: 1066},
            {concept_id: 9994, value_coded: (cxca_date_estimated == 1 ? 7437 : null), value_datetime: previous_cxca_date}, 
            {concept_id: 10012, value_text: previous_cxca_location},
            {concept_id: 10039, value_coded: previous_screening_method},
            {concept_id: 10008, value_coded: reason_for_no_cxca}
        ]
      };
     
  }else if(yesNo_Hash["CxCa screening"]["Ever had CxCa screening?"] ==  'Yes' && 
      yesNo_Hash["CxCa results available"]["Results available?"] == "No" &&
      yesNo_Hash["Offer CxCa screening"]["Offer CxCa screening?"] == "Yes"){

        let screening_method = CxCaScreeningMethods[$('touchscreenInput' + tstCurrentPage).value];
        waiting_for_lab_tests = (waiting_for_lab_tests == 'No' ? 1066 : 1065);

        observations = {
          encounter_id: null,
          observations: [
              {concept_id: 9991, value_coded: 1065},
              {concept_id: 9993, value_coded: 1066},
              {concept_id: 9992, value_coded: 1065},
              {concept_id: 10038, value_coded: screening_method},
              {concept_id: 2224, value_coded: waiting_for_lab_tests}
          ]
        };

  }else if(yesNo_Hash["CxCa screening"]["Ever had CxCa screening?"] == 'Yes' && 
    yesNo_Hash["CxCa results available"]["Results available?"] == "No" &&
      yesNo_Hash["Offer CxCa screening"]["Offer CxCa screening?"] == "No"){

        let reason_for_no_cxca = ReasonForNoCxCa[$('touchscreenInput' + tstCurrentPage).value];
        observations = {
          encounter_id: null,
          observations: [
              {concept_id: 9991, value_coded: 1065},
              {concept_id: 9993, value_coded: 1066},
              {concept_id: 9992, value_coded: 1066},
              {concept_id: 10008, value_coded: reason_for_no_cxca}
          ]
        };

  }else if(yesNo_Hash["Offer CxCa screening"]["Offer CxCa screening?"] == "No" &&  
    yesNo_Hash["CxCa screening"]["Ever had CxCa screening?"] ==  'No'){
      let reason_for_no_cxca = ReasonForNoCxCa[$('touchscreenInput' + tstCurrentPage).value];
      observations = {
        encounter_id: null,
        observations: [
            {concept_id: 9991, value_coded: 1066},
            {concept_id: 9992, value_coded: 1066},
            {concept_id: 10008, value_coded: reason_for_no_cxca}
        ]
      };


    }else if(yesNo_Hash["CxCa screening"]["Ever had CxCa screening?"] ==  'No' && 
      yesNo_Hash["Offer CxCa screening"]["Offer CxCa screening?"] == "Yes"){
        let screening_method = CxCaScreeningMethods[$('screening_method').value];
        let treatment_status = treatmentStatus[$('touchscreenInput' + tstCurrentPage).value];
        waiting_for_lab_tests = (waiting_for_lab_tests == 'No' ? 1066 : 1065);

        observations = {
          encounter_id: null,
          observations: [
              {concept_id: 9991, value_coded: 1066},
              {concept_id: 9992, value_coded: 1065},
              {concept_id: 10038, value_coded: screening_method},
              {concept_id: 10009, value_coded: treatment_status},
              {concept_id: 2224, value_coded: waiting_for_lab_tests}
          ]
        };


  }else if(yesNo_Hash["Offer CxCa screening"]["Offer CxCa screening?"] == "Yes"){
    let screening_method = CxCaScreeningMethods[$('touchscreenInput' + tstCurrentPage).value];
    waiting_for_lab_tests = (waiting_for_lab_tests == 'No' ? 1066 : 1065);

    observations = {
      encounter_id: null,
      observations: [
          {concept_id: 9991, value_coded: 1065},
          {concept_id: 10038, value_coded: screening_method},
          {concept_id: 2224, value_coded: waiting_for_lab_tests}
      ]
    };


  }else if(yesNo_Hash["Offer CxCa screening"]["Offer CxCa screening?"] == "No"){
    let reason_for_no_cxca = ReasonForNoCxCa[$('touchscreenInput' + tstCurrentPage).value];

    observations = {
      encounter_id: null,
      observations: [
          {concept_id: 9991, value_coded: 1066},
          {concept_id: 10008, value_coded:  reason_for_no_cxca}
      ]
    };


  }else if(yesNo_Hash["CxCa screening"]["Ever had CxCa screening?"] ==  "No" && 
    yesNo_Hash["Offer CxCa screening"]["Offer CxCa screening?"]  == "Yes"){

      let treatment_status = treatmentStatus[$('touchscreenInput' + tstCurrentPage).value];
      let screening_method = CxCaScreeningMethods[$('screening_method').value];
      waiting_for_lab_tests = (waiting_for_lab_tests == 'No' ? 1066 : 1065);

      observations = {
        encounter_id: null,
        observations: [
            {concept_id: 9991, value_coded: 1066},
            {concept_id: 9992, value_coded: 1065},
            {concept_id: 10009, value_coded: treatment_status},
            {concept_id: 10038, value_coded: screening_method},
            {concept_id: 2224, value_coded: waiting_for_lab_tests}
        ]
      };



  }else if(yesNo_Hash["CxCa screening"]["Ever had CxCa screening?"]  ==  "No" && 
    yesNo_Hash["Offer CxCa screening"]["Offer CxCa screening?"] == "No"){

      let reason_for_no_cxca = ReasonForNoCxCa[$('touchscreenInput' + tstCurrentPage).value];
        observations = {
          encounter_id: null,
          observations: [
              {concept_id: 9991, value_coded: 1066},
              {concept_id: 9992, value_coded: 1066},
              {concept_id: 10008, value_coded: reason_for_no_cxca}
          ]
        };
      
  }else{
    showMessage("Something went wrong. Please call support");
    return;
  }

  let hiv_statuses = {
    'Positive ON ART': 10017,
    'Positive NOT on ART': 10018,
    'Negative': 664,
    'Never tested': 9432,
    'Prefers NOT to disclose': 6279,
  }
  
  let hiv_status =  __$('hiv_status') ? __$('hiv_status').value : '';
  
  if(isHashEmpty(hiv_status_details) && hiv_status.match(/Never tested|Prefers NOT to disclose/)){
    observations.observations.push({concept_id: 3753, value_coded: hiv_statuses[hiv_status]});
  }else if(isHashEmpty(hiv_status_details)){
    let hiv_test_date_estimated = false;
    let hiv_test_date;
    let hiv_test_year = __$('hiv_test_year').value;
    
    if(hiv_test_year.toLowerCase() == 'unknown'){
      hiv_test_date = calculateEstimatedDate($('hiv_test_date_estimation').value);
      hiv_test_date_estimated = true;
    }else{
      let hiv_test_month = __$('hiv_test_month').value;
      let hiv_test_day = __$('hiv_test_day').value;
      hiv_test_date = moment(`${hiv_test_year}-${hiv_test_month}-${hiv_test_day}`).format("YYYY-MM-DD");
    }
    observations.observations.push({concept_id: 3753, value_coded: hiv_statuses[hiv_status]});
    if(hiv_test_date_estimated){
      observations.observations.push({concept_id: 1837, 
        value_coded: hiv_test_date, 
        value_text: `Date estimated: ${$('hiv_test_date_estimation').value}`});
    }else{
      observations.observations.push({concept_id: 1837, value_coded: hiv_test_date});
    }
  }else{
    hiv_status = 10018;
    let states = hiv_status_details.patient_states;
    for(stat of states){
      if(stat.name.match(/On antiretrovirals/i))
        hiv_status = 10017;

    }
    observations.observations.push({concept_id: 3753, value_coded: hiv_status});
  }

  observations.observations.push(
    {concept_id: 6189, value_coded: reason_for_visit_concept_ids[__$('reason_for_visit').value]}
  );
  createEncounter();
}

var reason_for_visit_concept_ids = {
  "Initial screening": 10035,
  "Postponed treatment": 9997,
  "One year subsequent check-up after treatment": 10034,
  "Subsequent screening": 10036,
  "Problem visit after treatment": 10037,
  "Referral": 9675
};

function createEncounter(){
  let currentTime = moment().format(' HH:mm:ss');
  let encounter_datetime = moment(sessionStorage.sessionDate).format('YYYY-MM-DD');
  encounter_datetime += currentTime;

  let encounter = {
      encounter_type_name: 'CxCa test',
      encounter_type_id: 181,
      patient_id: sessionStorage.patientID,
      encounter_datetime: encounter_datetime
  }

  submitParameters(encounter, "/encounters", "postObs");
}

function postObs(encounter){
  observations.encounter_id = encounter.encounter_id;

  submitParameters(observations, "/observations", "changeState");
}

function changeState(){
  let outcome = {
    location_id: locations[sessionStorage.currentLocation],
    state: 177,
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
            //let obs = JSON.parse(this.responseText);
            nextPage();  
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

function nextPage(){
  //window.location.href = "/views/patient_dashboard.html?patient_id=" + sessionStorage.patientID;
  nextEncounter(sessionStorage.patientID, sessionStorage.programID);
  return;
}

const CxCaScreeningMethods = {
  "VIA": 10020, "PAP Smear": 41,
  "HPV DNA": 10021, "Speculum Exam": 10022
};

const treatmentStatus= {
  "Same day Treatment": 10029,
  "Postponed Treatment": 9997,
  "Referral": 9675
};

const VIAresults = {
  "Negative": 664, 
  "Positive": 703,
  "Suspect": 9995
};

const ReasonForNoCxCa =  {
  "Not applicable": 1175,
  "Client preferred counseling": 10007
};


function enterPreviousCxCaData() {
  try {
    let results_available = yesNo_Hash['CxCa results available']['Results available?'] == 'Yes';
    let ever_had_cxca = yesNo_Hash['CxCa screening']['Ever had CxCa screening?'] == 'Yes';

    return (results_available  == ever_had_cxca);
  }catch(e){
    return false;
  }
}

function configureCxCaTestMonthCSS() {
  let cxca_test_month = $('inputFrame' + tstCurrentPage);
  cxca_test_month.style = "width: 95.5%; height: 86%;"

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

function newCxCaClient(){

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


































function screeningMethod(){
  return $('screening_method').value;
}

function offerCxCaScreening(){
  try {
    return (yesNo_Hash['Offer CxCa screening']['Offer CxCa screening?']  == 'Yes');
  }catch(e){
    return false;
  }
}

function addScreeningOptions() {
  let lists = __$('tt_currentUnorderedListOptions').getElementsByTagName('li');
  for(let i = 0 ; i < lists.length; i++){
    let opt = lists[i].getAttribute("onclick") + "changeNextOption(this);";
    lists[i].setAttribute("onclick", opt);
  }
}

function changeNextOption(e){
  let nextBTN = __$('nextButton');

  if(e.innerHTML.match(/VIA/i) || e.innerHTML.match(/Exam/i)){
    nextBTN.setAttribute("onmousedown", "sameDayScreening();")
    nextBTN.innerHTML = "<span>Finish</span>";
  }else{
    nextBTN.setAttribute("onmousedown", "gotoNextPage();")
    nextBTN.innerHTML = "<span>Next</span>";
  }
}

function sameDayScreening(){
  __$('waiting_for_lab_tests').value = 'No';
  submitParams();
}

var art_offer_cxca_data = false;

function ARTofferCxCa() {
  let url = apiProtocol + "://" + apiURL + ":" + apiPort + "/api/v1";
  url += '/observations?concept_id=9992&person_id=' + sessionStorage.patientID;
  url += 'page=0&page_size=1&obs_datetime=' + sessionStorage.sessionDate;

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
  if (this.readyState == 4 ) {
      if (this.status == 201 || this.status == 200 ) {
          let result = JSON.parse(this.responseText);
          if(result){
            if(result.length > 0){
              art_offer_cxca_data = (result[0].value_coded == 1065 ? true : false);
              if(art_offer_cxca_data)
                setOfferCxCa();

            }
          }
      }
  }
  };
  xhttp.open("GET", url, true);
  xhttp.setRequestHeader('Authorization', sessionStorage.getItem("authorization"));
  xhttp.setRequestHeader('Content-type', "application/json");
  xhttp.send();
}

function setOfferCxCa(){
  yesNo_Hash = {};
  yesNo_Hash["Offer CxCa screening"] = {};
  yesNo_Hash["Offer CxCa screening"]["Offer CxCa screening?"] = 'Yes';
}

var hiv_status_details = {};

function HIVststus(){
  let url = apiProtocol + "://" + apiURL + ":" + apiPort + "/api/v1";
  url += `/patients/${sessionStorage.patientID}/programs`

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
  if (this.readyState == 4 ) {
      if (this.status == 201 || this.status == 200 ) {
          let results = JSON.parse(this.responseText);
          if(results){
            for(let result of results){
              if(result.program.name.match(/HIV program/i))
                hiv_status_details = result;

            }
          }
      }
  }
  };
  xhttp.open("GET", url, true);
  xhttp.setRequestHeader('Authorization', sessionStorage.getItem("authorization"));
  xhttp.setRequestHeader('Content-type', "application/json");
  xhttp.send();
}

function enterHIVtestDate(){
  if(isHashEmpty(hiv_status_details)){
    let hiv_status = document.getElementById('hiv_status').value;
    if(hiv_status.match(/Negative|ART/i))
      return true;
  }

  return false;
}


ARTofferCxCa();
HIVststus();










