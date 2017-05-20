var config = require(__dirname + '/config.js');
var scraperjs = require('scraperjs');

var options = {exclude_replies:true, include_rts:false, count: 1 };

function getTweet(who) {
  who = who || 'tinycarebot';
  return scrapeTweet(who);
}

function scrapeTweet(who) {
  return new Promise(function (resolve, reject) {
    scraperjs.StaticScraper.create('https://twitter.com/' + who)
        .scrape(function($) {
            return $(".js-tweet-text.tweet-text").map(function() {
                return $(this).text();
            }).get();
        })
        .then(function(tweets) {
          var tweetNumber = Math.floor(Math.random() * tweets.length);
          resolve({text:tweets[tweetNumber], bot: who});
        },function(error) {
          reject('Can\'t scrape tweets. Maybe the user is private or doesn\'t exist?');
        });
  });
}

module.exports.getTweet = getTweet;
