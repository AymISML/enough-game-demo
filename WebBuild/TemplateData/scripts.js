function ShowEndPanel (ctaText) {
    const shareCopy = 'Find out the true cost of malnutrition to girls 👧\n\nPlay this game and @WorldVision will donate a meal to a vulnerable child for every person who plays 🍲';
    const searchParams = new URLSearchParams(window.location.search);

    const endPanel = document.querySelector('.end-panel');
    endPanel.style.display = 'block';

    const ctaButton = endPanel.querySelector('.cta-button');
    ctaButton.innerText = ctaText;

    let actionUrl = '';
    let shareUrl = window.location.href;
    if (searchParams.has('actionUrl'))
        actionUrl = searchParams.get('actionUrl');

    if (searchParams.has('shareUrl'))
        shareUrl = searchParams.get('shareUrl');

    ctaButton.onclick = function () {
        LogEventToParent('cta_clicked');
        window.open(actionUrl);
    };

    const facebookShare = endPanel.querySelector('.facebook-share');
    facebookShare.onclick = function () {
        LogEventToParent('facebook_share_clicked');

        const url = new URL('https://www.facebook.com/sharer/sharer.php');
        url.searchParams.append('u', shareUrl);
        url.searchParams.append('t', shareCopy);
        window.open(url);
    };

    const twitterShare = endPanel.querySelector('.twitter-share');
    twitterShare.onclick = function () {
        LogEventToParent('twitter_share_clicked');

        const url = new URL('http://x.com/intent/tweet');
        url.searchParams.append('url', shareUrl);
        url.searchParams.append('text', shareCopy);
        url.searchParams.append('hashtags', 'ENOUGH');
        window.open(url);
    };

    const navigatorShare = endPanel.querySelector('.navigator-share');
    navigatorShare.onclick = function () {
        LogEventToParent('native_share_clicked');

        if (navigator.share) {
            navigator.share({
                title: document.title,
                text: shareCopy,
                url: shareUrl
            })
                .catch(error => console.log('Error sharing:', error));
        }
    };
};

function LogEventToParent (event, param) {
    window.parent.postMessage({
        event: "gameEvent",
        data: { event: event, param: param }
    }, "*");
}
