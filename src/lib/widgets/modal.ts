import {ModalWidget} from '../../types';
import {addIframe, updateIframePosition} from '../iframes';
import {getMode, urls} from '../http';

export default async function initializeModalWidget(widget: ModalWidget) {
    const iframe = document.createElement('iframe');

    iframe.src = urls[getMode()].widget;

    iframe.style.border = '0';
    iframe.style.opacity = '1';
    iframe.style.overflow = 'hidden';
    iframe.style.display = 'none';
    iframe.style.zIndex = '2147134212';
    iframe.style.position = 'fixed';
    if ( widget.widget_settings.border_radius ) {
        iframe.style.borderRadius = widget.widget_settings.border_radius + 'px';
    }
    iframe.style.height = widget.widget_settings.height + '%';
    iframe.style.width = widget.widget_settings.height + '%';
    iframe.style.left = '50%';
    iframe.style.top = '50%';
    iframe.style.maxWidth = '780px';
    iframe.style.minWidth = '480px';

    window.addEventListener('resize', () => updateIframePosition(iframe));

    document.body.appendChild(iframe);
    addIframe(widget, iframe);

    return true;
}