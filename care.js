#!/usr/bin/env node
var config = require(__dirname + '/config.js');
var twitterbot = require(__dirname + '/twitterbot.js');
var pomodoro = require(__dirname + '/pomodoro.js');

var notifier = require('node-notifier');
var blessed = require('blessed');
var contrib = require('blessed-contrib');
var parrotSay = require('parrotsay-api');
var weather = require('weather-js');

var inPomodoroMode = false;

var screen = blessed.screen(
    {fullUnicode: true, // emoji or bust
     smartCSR: true,
     autoPadding: true,
     title: '✨💖 tiny care terminal 💖✨'
    });

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Refresh on r, or Control-R.
screen.key(['r', 'C-r'], function(ch, key) {
  tick();
});

screen.key(['s', 'C-s'], function(ch, key) {
  if (!inPomodoroMode) {
    return;
  } else if (pomodoroObject.isStopped()) {
    pomodoroObject.start();
  } else if (pomodoroObject.isPaused()) {
    pomodoroObject.resume();
  } else {
    pomodoroObject.pause();
    pomodoroHandlers.onTick();
  }
});

screen.key(['e', 'C-e'], function(ch, key) {
  if (inPomodoroMode) {
    pomodoroObject.stop();
    pomodoroHandlers.onTick();
  }
});

screen.key(['u', 'C-u'], function(ch, key) {
  if (inPomodoroMode) {
    pomodoroObject.updateRunningDuration();
    pomodoroHandlers.onTick();
  }
});

screen.key(['b', 'C-b'], function(ch, key) {
  if (inPomodoroMode) {
    pomodoroObject.updateBreakDuration();
    pomodoroHandlers.onTick()
  }
});

screen.key(['p', 'C-p'], function(ch, key) {
  if (inPomodoroMode) {
    pomodoroObject.stop();
    inPomodoroMode = false;
    doTheTweets();
    parrotBox.removeLabel('');
  } else {
    parrotBox.setLabel(' 🍅 ');
    inPomodoroMode = true;
    pomodoroHandlers.onTick()
  }
});

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

var tweetBoxes = {}
// grid.set(row, col, rowSpan, colSpan, obj, opts)
var weatherBox = grid.set(0, 0, 2, 12, blessed.box, makeScrollBox(' 🌤 '));
tweetBoxes[config.twitter[1]] = grid.set(2, 0, 3, 6, blessed.box, makeBox(' 💖 '));
tweetBoxes[config.twitter[2]] = grid.set(2, 6, 3, 6, blessed.box, makeBox(' 💬 '));
tweetBoxes[config.twitter[3]] = grid.set(5, 0, 3, 6, blessed.box, makeBox(' 💬 b2b'));
tweetBoxes[config.twitter[4]] = grid.set(5, 6, 3, 6, blessed.box, makeBox(' 💬 future'));
var parrotBox = grid.set(8, 0, 4, 12, blessed.box, makeScrollBox(''));

parrotSay('I was an atheist, ').then(function(text) {
  parrotBox.content = text;
  screen.render();
});

tick();
setInterval(tick, 1000 * 60 * config.updateInterval);

function tick() {
  doTheWeather();
  doTheTweets();
}

function doTheWeather() {
  weather.find({search: config.weather, degreeType: config.celsius ? 'C' : 'F'}, function(err, result) {
    if (result && result[0] && result[0].current) {
      var json = result[0];
      // TODO: add emoji for this thing.
      var skytext = json.current.skytext.toLowerCase();
      var currentDay = json.current.day;
      var degreetype = json.location.degreetype;
      var forecastString = '';
      for (var i = 0; i < json.forecast.length; i++) {
        var forecast = json.forecast[i];
        if (forecast.day === currentDay) {
          var skytextforecast = forecast.skytextday.toLowerCase();
          forecastString = `Today, it will be ${skytextforecast} with a forecast high of ${forecast.high}°${degreetype} and a low of ${forecast.low}°${degreetype}.`;
        }
      }
      weatherBox.content = `In ${json.location.name} it's ${json.current.temperature}°${degreetype} and ${skytext} right now. ${forecastString}`;
    } else {
      weatherBox.content = 'Having trouble fetching the weather for you :(';
    }
  });
}

function doTheTweets() {
  for (var which in config.twitter) {
    // Gigantor hack: first twitter account gets spoken by the party parrot.
    if (which == 0) {
      if (inPomodoroMode) {
        return;
      }
    } else {
      twitterbot.getTweet(config.twitter[which]).then(function(tweet) {
        tweetBoxes[tweet.bot.toLowerCase()].content = tweet.text;
        screen.render();
      },function(error) {
        tweetBoxes[config.twitter[1]].content =
        tweetBoxes[config.twitter[2]].content =
        'Can\'t read Twitter without some API keys  🐰. Maybe try the scraping version instead?';
      });
    }
  }
}

function makeBox(label) {
  return {
    label: label,
    tags: true,
    // draggable: true,
    border: {
      type: 'line'  // or bg
    },
    style: {
      fg: 'white',
      border: { fg: 'cyan' },
      hover: { border: { fg: 'green' }, }
    }
  };
}

function makeScrollBox(label) {
  var options = makeBox(label);
  options.scrollable = true;
  options.scrollbar = { ch:' ' };
  options.style.scrollbar = { bg: 'green', fg: 'white' }
  options.keys = true;
  options.vi = true;
  options.alwaysScroll = true;
  options.mouse = true;
  return options;
}

function makeGraphBox(label) {
  var options = makeBox(label);
  options.barWidth= 5;
  options.xOffset= 4;
  options.maxHeight= 10;
  return options;
}

function llamaSay(text) {
  return `
    ${text}
    ∩∩
　（･ω･）
　　│ │
　　│ └─┐○
　  ヽ　　　丿
　　 　∥￣∥`;
}

function catSay(text) {
  return `
      ${text}

      ♪ ガンバレ! ♪
  ミ ゛ミ ∧＿∧ ミ゛ミ
  ミ ミ ( ・∀・ )ミ゛ミ
   ゛゛ ＼　　　／゛゛
   　　 　i⌒ヽ ｜
  　　 　 (＿) ノ
   　　　　　 ∪`
    ;
}


var pomodoroHandlers = {
  onTick: function() {
    if (!inPomodoroMode) return;
    var remainingTime = pomodoroObject.getRemainingTime();

    var statusText = '';
    if (pomodoroObject.isInBreak()) {
      statusText = ' (Break Started) ';
    } else if (pomodoroObject.isStopped()) {
      statusText = ' (Press "s" to start) ';
    } else if (pomodoroObject.isPaused()) {
      statusText = ' (Press "s" to resume) ';
    }

    var content = `In Pomodoro Mode: ${remainingTime} ${statusText}`;
    var metaData = `Duration: ${pomodoroObject.getRunningDuration()} Minutes,  Break Time: ${pomodoroObject.getBreakDuration()} Minutes\n`;
    metaData += 'commands: \n s - start/pause/resume \n e - stop \n u - update duration \n b - update break time';

    parrotSay(content).then(function(text) {
      parrotBox.content = text + metaData;
      screen.render();
    });
  },

  onBreakStarts: function() {
    if (inPomodoroMode) {
      notifier.notify({
        title: 'Pomodoro Alert',
        message: 'Break Time!',
        sound: true,
        timeout: 30,
      });
    }
  },

  onBreakEnds: function() {
    if (inPomodoroMode) {
      notifier.notify({
        title: 'Pomodoro Alert',
        message: 'Break Time Ends!',
        sound: true,
        timeout: 30,
      });
    }
  },
}

var pomodoroObject = pomodoro(pomodoroHandlers);
