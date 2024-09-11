var HOSTURL = 'https://enough-wv.pages.dev/';
var startGame = function (donationUrl) {
    var gameUrl = `${HOSTURL}?shareUrl=${window.location.href}&actionUrl=${donationUrl}`;
    var gameFrame = document.querySelector('.game-iframe');
    gameFrame.src = gameUrl + donationUrl;
};