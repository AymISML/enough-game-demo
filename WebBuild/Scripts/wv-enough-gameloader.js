const HOST = 'https://enough-wv.pages.dev/';
const ORIGIN = URL.parse(HOST).origin;

function startGame(actionUrl, eventLogsCallback) {
    const gameUrl = `${HOST}?shareUrl=${window.location.href}&actionUrl=${actionUrl}`;
    const gameFrame = document.querySelector('.game-iframe');
    gameFrame.allow = "web-share";
    gameFrame.src = gameUrl;

    function handleEventLog(event) {
        if (event.origin === ORIGIN) {
            if (event.data && event.data.event === "gameEvent") {
                const data = event.data.data;
                eventLogsCallback(data.event, data.param);
            }
        }
    }

    window.addEventListener("message", handleEventLog, false);
};