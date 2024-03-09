import {WidgetEvent, globalEventEmitter} from './lib/event';
import {getMode, httpFetch, setMode} from './lib/http';
import {identities} from './lib/storage';
import {AnyWidget, PossibleMode, WidgetId} from './types';
import {hide, render, show} from './lib/widgets/widget';

interface Changelogify {
    Events: typeof WidgetEvent,

    setMode(mode: PossibleMode): void;
    getMode(): void;
    render(widgetId: string): Promise<void>;
    identify(projectId: string|number, token: string): void,
    removeIdentity(projectId: string|number): boolean;

    show(widgetId: WidgetId): Promise<void>;
    hide(widgetId: WidgetId): void;

    on(
        event: WidgetEvent.WIDGET_CLOSED |
            WidgetEvent.WIDGET_OPENED |
            WidgetEvent.WIDGET_READY |
            WidgetEvent.WIDGET_REFRESHED,
        callable: (arg: [widgetId: WidgetId, widget: AnyWidget]) => void
    ): void;
    on(event: WidgetEvent.WIDGET_LOAD_FAILED, callable: (arg: [widgetId: WidgetId]) => void): void;
    off(event: WidgetEvent, callable: () => void): void;
}

const Changelogify: Changelogify = {
    Events: WidgetEvent,
    setMode,
    getMode,
    render,
    show,
    hide,
    identify(projectId, token) {
        identities.set(projectId, token);
    },
    removeIdentity(projectId) {
        // TODO send to widget that user identification was removed

        return identities.delete(projectId);
    },
    on(event, callable) {
        // @ts-ignore TODO how to fix that?
        globalEventEmitter.on(event, callable);
    },
    off(event, callable) {
        globalEventEmitter.off(event, callable);
    },
}

export default Changelogify;