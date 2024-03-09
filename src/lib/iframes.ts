import {getStorageValue, identities} from './storage';
import {addEventListener} from './event';
import {AnyWidget, WidgetId} from '../types';

const iframes: Map<WidgetId, HTMLIFrameElement> = new Map();

function updateIframePosition(iframe: HTMLIFrameElement) {
    // TODO add widget, popover widget will need other position adjustments
    const width = Math.ceil(iframe.offsetWidth / 2);
    const height = Math.ceil(iframe.offsetHeight / 2);
    iframe.style.marginLeft = '-' + width + 'px';
    iframe.style.marginTop = '-' + height + 'px';
}

function sendToIframe(iframe: HTMLIFrameElement, name: string, data: Record<string, unknown>) {
    if (!iframe.contentWindow) {
        return;
    }

    console.debug(`[Changelogify SDK] ->`, name, data);
    iframe.contentWindow.postMessage({
        name,
        data,
    }, '*');
}

function addIframe(widget: AnyWidget, iframe: HTMLIFrameElement) {
    iframes.set(widget.id, iframe);
    addEventListener();

    iframe.addEventListener('load', () => {
        sendToIframe(iframe, 'changelogify:internal:initial', {
            widget,
            userToken: identities.get(widget.project_id) || null,
            articlesRead: getStorageValue(widget, 'lar'),
            articlesSeen: getStorageValue(widget, 'las'),
        });
    });
}

export {
    iframes,
    addIframe,
    sendToIframe,
    updateIframePosition,
};