import mitt from 'mitt';
import { iframes } from './iframes';
import { getStorageValue, setStorageValue } from './storage';
import { show, widgets } from './widgets/widget';
import { AnyWidget } from '../types';

enum WidgetEvent {
  WIDGET_CLOSED = 'widget:closed',
  WIDGET_OPENED = 'widget:opened',
  WIDGET_READY = 'widget:ready',
  WIDGET_LOAD_FAILED = 'widget:load_failed',
  WIDGET_REFRESHED = 'widget:refreshed',
  // WIDGET_HIDDEN= 'widget:hidden',
  // WIDGET_VISIBLE= 'widget:visible',
}

const globalEventEmitter = mitt();
const internalEventEmitter = mitt();
let hasMessageListeners = false;

function addEventListener() {
  if (hasMessageListeners) {
    return;
  }

  hasMessageListeners = true;
  window.addEventListener('message', (event) => {
    let foundWidgetId = null;
    let foundIframe = null;
    for (const [ widgetId, iframe, ] of iframes.entries()) {
      if (event.source === iframe.contentWindow) {
        foundWidgetId = widgetId;
        foundIframe = iframe;
        break;
      }
    }

    if (!foundWidgetId || !foundIframe) {
      return;
    }

    const { type, data, } = event.data;
    internalEventEmitter.emit(type, [
      foundWidgetId,
      foundIframe,
      data,
    ]);

    console.log('[Changelogify SDK] <-', type, data);
  }, false);

  // @ts-ignore
  internalEventEmitter.on('changelogify:internal:height', ([ , iframe, data, ]) => {
    iframe.style.height = data.height + 'px';
  });

  // @ts-ignore
  internalEventEmitter.on('changelogify:internal:ready', ([ widgetId, , data, ]) => {
    const widget = widgets.get(widgetId) as AnyWidget;
    let lastSeenArticles = getStorageValue(widget, 'las');
    let unseenAvailable = false;

    for (const articleId of data.articleIds) {
      if (!lastSeenArticles.includes(articleId)) {
        unseenAvailable = true;
        lastSeenArticles.push(articleId);
      }
    }

    if (lastSeenArticles.length > data.articleIds.length) {
      lastSeenArticles = data.articleIds;
    }

    if (unseenAvailable) {
      setStorageValue(widget, 'las', lastSeenArticles);
    }

    if (widget.trigger_type === 'unseen' && unseenAvailable) {
      show(widgetId);
    }

    globalEventEmitter.emit(WidgetEvent.WIDGET_READY, [
      widgetId,
      widgets.get(widgetId),
    ]);
  });

  // @ts-ignore
  internalEventEmitter.on('changelogify:internal:read_article', ([ widgetId, , data, ]) => {
    const widget = widgets.get(widgetId) as AnyWidget;
    setStorageValue(widget, 'lar', getStorageValue(widget, 'lar').concat(data.article.id));
  });
}

export {
  WidgetEvent,
  addEventListener,
  globalEventEmitter,
  internalEventEmitter,
};
