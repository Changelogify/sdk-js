import {addWrapperElement, searchInjectElement} from '../elements';
import {addIframe} from '../iframes';
import {EmbedWidget} from '../../types';

export default async function initializeEmbedWidget(widget: EmbedWidget) {
    const injectElement = searchInjectElement(widget);
    if (!injectElement) {
        console.error(`Selector ${widget.widget_settings.selector} not found.`);
        return false;
    }

    const wrapper = document.createElement('div');
    const iframe = document.createElement('iframe');

    wrapper.style.height = '100%';
    wrapper.style.width = '100%';
    wrapper.style.position = 'relative';

    const url = new URL(`https://${widget.url}`);
    url.searchParams.set('embed', 'true');
    url.searchParams.set('labels', widget.widget_settings.show_labels ? 'true' : 'false');
    url.searchParams.set('header', widget.widget_settings.show_header ? 'true' : 'false');

    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
        url.protocol = 'http:';
    }

    iframe.src = url.toString();
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.opacity = '1';
    iframe.style.visibility = 'visible';
    iframe.style.background = 'transparent';
    iframe.style.height = 'auto';

    wrapper.appendChild(iframe);
    injectElement.appendChild(wrapper);

    addIframe(widget, iframe);
    addWrapperElement(widget, injectElement);

    return true;
}