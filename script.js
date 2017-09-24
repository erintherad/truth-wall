var API_URL = atob('aHR0cDovL2FwaS5hY21lLmludGVybmF0aW9uYWwvZm9ydHVuZQ==');
var MAX_DURATION = 10000; // milliseconds

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
      if (!timeoutState.exceeded) {
        // prevent default fortune
        clearTimeout(timeoutState.id);

        // append data to dom
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

// call default fortune
function appendDefaultFortune() {
  console.log('default fortune');
}

$(document).ready(function() {
  fetchFortuneWithTimeout();
});
