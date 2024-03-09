import { AnyWidget, EmbedWidget, WidgetId } from '../types';
import { hide } from './widgets/widget';

const wrapperElements = new Map();
const backdrops = new Map();

async function addBackdrop(widgetId: WidgetId, backdropColor: string, closeOnClick: boolean) {
  if (backdrops.get(widgetId)) {
    return;
  }

  const backdrop = document.createElement('div');
  backdrop.style.position = 'fixed';
  backdrop.style.inset = '0';
  backdrop.style.background = backdropColor;
  backdrop.style.zIndex = '2147134212';

  if (closeOnClick) {
    backdrop.addEventListener('click', () => {
      hide(widgetId);
    });
  }

  document.body.prepend(backdrop);

  backdrops.set(widgetId, backdrop);
}

function removeBackdrop(widgetId: WidgetId) {
  const backdrop = backdrops.get(widgetId);
  if (!backdrop) {
    return;
  }

  backdrop.remove();
  backdrops.delete(widgetId);
}

function searchInjectElement(widget: EmbedWidget): HTMLElement | null {
  return document.querySelector(widget.widget_settings.selector);
}

function addWrapperElement(widget: AnyWidget, element: HTMLElement) {
  wrapperElements.set(widget.id, element);
}

export {
  backdrops,
  addBackdrop,
  removeBackdrop,
  addWrapperElement,
  searchInjectElement,
};
