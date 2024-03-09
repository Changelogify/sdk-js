import {PossibleMode} from '../types';

const urls = {
    production: {
        api: 'https://api.changelogify.news',
        widget: 'https://widget.changelogify.news',
    },
    development: {
        api: 'http://localhost:8000',
        widget: 'http://localhost:9008',
    },
};

let mode: PossibleMode = 'production';

function setMode(newMode: PossibleMode) {
    mode = newMode;
}

function getMode() {
    return mode;
}

async function httpFetch(url: string) {
    const response = await fetch(`${urls[mode].api}${url}`);
    if (!response.ok) {
        return null;
    }

    return await response.json();
}

export {
    urls,
    httpFetch,
    setMode,
    getMode,
};