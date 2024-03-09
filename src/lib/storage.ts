import { AnyWidget } from '../types';

const identities = new Map();

function setStorageValue(widget: AnyWidget, key: string, value: string | unknown[]) {
  window.localStorage && window.localStorage.setItem(`changelogify_${widget.project_id}_${key}`, JSON.stringify(value));
}

function getStorageValue<T = unknown[]>(widget: AnyWidget, key: string, defaultValue: T = [] as T): T {
  const storageValue = window.localStorage && window.localStorage.getItem(`changelogify_${widget.project_id}_${key}`);
  if (storageValue) {
    try {
      return JSON.parse(storageValue) as T;
    }
    catch (e) {
    }
  }

  return defaultValue;
}

export {
  identities,
  setStorageValue,
  getStorageValue,
};
