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

// random colors
var safeColors = [];

for(var i = 0; i < 100; i++) {
 	safeColors.push(i.toString());
}
var rand = function() {
    return Math.floor(Math.random()*99);
};
var randomColor = function() {
    var r = safeColors[rand()];
    var g = safeColors[rand()];
    var b = safeColors[rand()];
    return 'rgba(' + r + ', ' + g + ', ' + b + ', 0.6);';
};

function renderFortune(fortune, totalCount) {
  var height = 100.0 / (Math.floor(totalCount / 2) + 1);

  var card = $('<div>', { id: 'fortune_' + fortune.id, class: 'card', style: 'height: ' + height + '%; background-color: ' + randomColor() });
  var anchor = $('<a>', { href: '#', onClick: 'deleteFortune("' + fortune.id + '")', class: 'pull-right deleteBtn' })
  anchor.append('<span class="glyphicon glyphicon-remove-sign"></span>');
  card.append(anchor);
  var listText = $('<h2 class="text-center fortune-text">' + fortune.text + '</h2>')
  card.append(listText);

  $('#truth-wall').prepend(card);
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

  initializeFortunes();
}

function isFortunesOdd() {
  var fortunes = getFortunes();
  var totalCount = fortunes.length;
  var top = 100.0 / (Math.floor((totalCount + 1) / 2) + totalCount + 1) + '%';

  if(totalCount === 1) {
    $('#new-fortune').css('top', '50%');
  }

  if(totalCount % 2 == 1) {
    $('#new-fortune').addClass('half-btn');
    if(totalCount !=0 && totalCount != 1) {
      $('#new-fortune').css('top', '25%');
      if (totalCount >= 5 && totalCount < 6) {
        $('#new-fortune').css('top', '16%');
      } else if (totalCount >= 7) {
        $('#new-fortune').css('top', '11%');
      }
    }
  } else {
    $('#new-fortune').removeClass('half-btn');
    if(totalCount != 0 && totalCount != 1) {
      $('#new-fortune').css('top', top);
    }
  }
}

function initializeFortunes() {
  $('#truth-wall .card').remove();

  var fortunes = getFortunes();

  $.each(fortunes, function(index, fortune) {
    renderFortune(fortune, fortunes.length);
  });
        isFortunesOdd();
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

  initializeFortunes();
  isFortunesOdd();
}

$(document).ready(function() {
  initializeFortunes();

  $('#add-fortune-btn').click(function(event) {
    $(this).prop('disabled', true);
    fetchFortuneWithTimeout();
  });
});
