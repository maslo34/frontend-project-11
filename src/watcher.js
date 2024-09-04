import onChange from 'on-change';

import { renderError, renderFeed } from './renders.js';

export default (state) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'errors') {
      renderError(value, state);
    }
    if (path === 'update') {
      renderFeed(state);
    }
  });
  return watchedState;
};
