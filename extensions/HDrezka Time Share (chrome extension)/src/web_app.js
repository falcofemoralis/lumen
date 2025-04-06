const getData = () => {
    let voiceId = null
    $('.b-translator__item').each((i, el) => {
        if (el.classList.contains('active')) {
            voiceId = el.getAttribute('data-translator_id');
        }
    });

    let season = null
    $('.b-simple_season__item').each((i, el) => {
        if (el.classList.contains('active')) {
            season = el.getAttribute('data-tab_id');
        }
    });


    let episode = null
    $('.b-simple_episode__item').each((i, el) => {
        if (el.classList.contains('active')) {
            episode = el.getAttribute('data-episode_id');
        }
    });

    let titleId = $('.b-userset__fav_holder_data')[0].getAttribute('data-post_id')

    let userId = $('#member_user_id')[0].getAttribute('value')

    return { voiceId, season, episode, titleId, userId };
}

window.onload = () => {
    window.postMessage({ action: "get", data: { ...getData() } })
}

const UPDATE_TIMEOUT = 30000;
const updateTime = (timer) => {
    if (CDNPlayer.api('playing')) {
        window.postMessage({ action: "update", data: { ...getData(), time: CDNPlayer.api('time') } })
    }

    if (timer) {
        setTimeout(() => updateTime(true), UPDATE_TIMEOUT)
    }
}

window.addEventListener('message', (e) => {
    if (e.data.action == 'seek') {
        CDNPlayer.api('seek', e.data.data.time)
    } else if (e.data.action == 'fetched') {
        //$(document).ajaxComplete(() => updateTime(false)); // on update watch later
        setTimeout(() => updateTime(true), UPDATE_TIMEOUT)
    }
});

// Android.initTime();
// const UPDATE_TIMEOUT = 30000;
// const updateTime = (timer) => {
//     if (CDNPlayer.api('playing')) {
//         Android.updateTime(CDNPlayer.api('time'));
//     }

//     if (timer) {
//         setTimeout(() => updateTime(true), UPDATE_TIMEOUT);
//     }
// };
// setTimeout(() => updateTime(true), UPDATE_TIMEOUT);