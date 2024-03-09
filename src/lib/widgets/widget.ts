import {iframes, updateIframePosition} from '../iframes';
import {globalEventEmitter, WidgetEvent} from '../event';
import {AnyWidget, WidgetId} from '../../types';
import {httpFetch} from '../http';
import initializeEmbedWidget from './embed';
import initializeModalWidget from './modal';
import {addBackdrop, backdrops, removeBackdrop} from '../elements';

const widgets: Map<WidgetId, AnyWidget> = new Map();
const renderQueue: string[] = [];
let renderInProgress = false;

async function _fetchWidget(widgetId: WidgetId) {
    if (!widgets.has(widgetId)) {
        const widget = await httpFetch(`/v1/widgets/${widgetId}`);
        if (widget) {
            widget.id = widgetId;
        }

        widgets.set(widgetId, widget);
    }

    return widgets.get(widgetId);
}

async function _createWidgetIframe(widget: AnyWidget) {
    if (iframes.has(widget.id)) {
        console.warn(`Widget ${widget.id} is already rendered.`);
        return false;
    }

    if (widget.widget_type === 'embed') {
        return initializeEmbedWidget(widget);
    }

    if (widget.widget_type === 'modal') {
        return initializeModalWidget(widget);
    }

    // TODO how to improve?
    console.error(`Unsupported widget type ${(widget as { widget_type: string; }).widget_type}`);

    return false;
}

function _getWidgetWithIframe(widgetId: WidgetId): [AnyWidget, HTMLIFrameElement] {
    const widget = widgets.get(widgetId) || null;
    if (!widget) {
        throw new Error(`Widget ${widgetId} not loaded.`);
    }

    const iframe = iframes.get(widgetId) || null;
    if (!iframe) {
        throw new Error(`Iframe for widget ${widgetId} not found.`);
    }

    return [widget, iframe];
}

async function _initializeWidget(widgetId: WidgetId): Promise<boolean> {
    const widget = await _fetchWidget(widgetId);
    if (!widget || !widget.is_enabled) {
        console.error('Widget is disabled or was not found.')
        return false;
    }

    return _createWidgetIframe(widget);
}

async function _render() {
    if (renderInProgress) {
        return;
    }

    const widgetId = renderQueue.shift();
    if (!widgetId) {
        return;
    }

    renderInProgress = true;

    _completeRender(widgetId, await _initializeWidget(widgetId));
}

function _completeRender(widgetId: string, success: boolean) {
    renderInProgress = false;

    if (!success) {
        globalEventEmitter.emit(WidgetEvent.WIDGET_LOAD_FAILED, [widgetId]);
    }

    _render();
}

async function render(id: WidgetId): Promise<void> {
    renderQueue.push(id);

    return new Promise(async (resolve, reject) => {
        await _render();

        const resolved = (success: boolean) => {
            // @ts-ignore
            globalEventEmitter.off(WidgetEvent.WIDGET_READY, successCallable);
            // @ts-ignore
            globalEventEmitter.off(WidgetEvent.WIDGET_LOAD_FAILED, failCallable);

            (success ? resolve : reject)();
        }
        const successCallable = ([widgetId]: [WidgetId]) => {
            if (widgetId === id) {
                resolved(true);
            }
        };
        const failCallable = ([widgetId]: [WidgetId]) => {
            if (widgetId === id) {
                resolved(false);
            }
        };

        // @ts-ignore
        globalEventEmitter.on(WidgetEvent.WIDGET_READY, successCallable);
        // @ts-ignore
        globalEventEmitter.on(WidgetEvent.WIDGET_LOAD_FAILED, failCallable);
    });
}

async function show(widgetId: WidgetId) {
    const [widget, iframe] = _getWidgetWithIframe(widgetId);
    if (iframe.style.display === 'block') {
        return;
    }

    iframe.style.display = 'block';
    updateIframePosition(iframe);

    // TODO move widget_type check to function
    if (widget.widget_type === 'modal' && widget.widget_settings.backdrop) {
        await addBackdrop(
            widget.id,
            widget.widget_settings.backdrop_color,
            widget.widget_settings.backdrop_close_click
        );
    }

    globalEventEmitter.emit(WidgetEvent.WIDGET_OPENED, [widget.id, widget]);
}

function hide(widgetId: string) {
    const [widget, iframe] = _getWidgetWithIframe(widgetId);

    if (iframe.style.display !== 'block') {
        return;
    }

    iframe.style.display = 'none';

    if (backdrops.has(widgetId)) {
        removeBackdrop(widgetId);
    }

    globalEventEmitter.emit(WidgetEvent.WIDGET_CLOSED, [widget.id, widget]);
}

export {
    widgets,
    show,
    hide,
    render,
}