var API_URL = atob('aHR0cDovL2FwaS5hY21lLmludGVybmF0aW9uYWwvZm9ydHVuZQ==');
var MAX_DURATION = 10000; // milliseconds
var LOCALSTORAGE_KEY = 'fortunes';

// track state of timeout globally because javascript doesn't
// pass references for primitive data types
var timeoutState = {
  exceeded: false,
  id: null
};

// call fetchFortune() with global timeout of MAX_DURATION
function fetchFortuneWithTimeout() {
  // resets timeoutState
  timeoutState.exceeded = false;
  timeoutState.id = setTimeout(function() {
    timeoutState.exceeded = true;
    $('#add-fortune-btn').prop('disabled', false);
    appendDefaultFortune();
  }, MAX_DURATION);

  fetchFortune();
}

// Makes call to API_URL
function fetchFortune() {
  $.ajax({
    type: 'GET',
    url: API_URL,
    dataType: 'json',
    success: function(data) {
      $('#add-fortune-btn').prop('disabled', false);
      if (!timeoutState.exceeded) {
        // prevent default fortune
        clearTimeout(timeoutState.id);

        // add to localStorage and add to dom
        appendFortune(data.fortune.join(''));
      }
    },
    error: function(error) {
      // Recursive call if less than MAX_DURATION
      if (!timeoutState.exceeded) {
        fetchFortune();
      }
    }
  });
}

function getFortunes() {
  var fortunes = [];

  // retrieve existing fortunes from localStorage
  var fortuneString = localStorage.getItem(LOCALSTORAGE_KEY);
  if (fortuneString !== null) {
    // parse string into array if it exists
    fortunes = JSON.parse(fortuneString);
  }

  return fortunes;
}

function setFortunes(fortunes) {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(fortunes));
}

function renderFortune(fortune) {
  var listItem = $('<li>', { id: 'fortune_' + fortune.id });
  listItem.text(fortune.text);
  var anchor = $('<a>', { href: '#', onClick: 'deleteFortune("' + fortune.id + '")' })
  anchor.text('Delete');
  listItem.append(anchor);

  $('#truth-wall').append(listItem);
}

// call default fortune
function appendDefaultFortune() {
  appendFortune('A penny saved is a penny earned');
}

// accepts a string fortune and adds it to localStorage
function appendFortune(fortuneText) {
  var fortunes = getFortunes();

  // found on stackoverflow.
  var id = Math.random().toString(36).substring(2, 10);
  var fortune = { id: id, text: fortuneText };
  fortunes.push(fortune);

  setFortunes(fortunes);

  renderFortune(fortune);
}

function initializeFortunes() {
  var fortunes = getFortunes();

  $.each(fortunes, function(index, fortune) {
    renderFortune(fortune);
  });
}

function deleteFortune(id) {
  var oldFortunes = getFortunes();
  var newFortunes = [];

  // removes fortune from localStorage
  $.each(oldFortunes, function(idx, f) {
    if (f.id !== id) {
      newFortunes.push(f);
    }
  });

  setFortunes(newFortunes);

  // removes fortune from dom
  $('#fortune_' + id).remove();
}

$(document).ready(function() {
  initializeFortunes();

  $('#add-fortune-btn').click(function(event) {
    $(this).prop('disabled', true);
    fetchFortuneWithTimeout();
  });
});
