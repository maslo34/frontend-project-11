import onChange from 'on-change';

import { renderFeed, renderFeedback } from './renders.js';

export default (state, elements) => {
  const handleProcessState = (processState) => {
    const { input, submit, form } = elements;
    switch (processState) {
      case 'error':
        renderFeedback(state, elements);
        input.disabled = false;
        submit.disabled = false;
        input.focus();
        break;

      case 'sending':
        renderFeedback(state, elements);
        submit.disabled = true;
        input.disabled = true;
        break;

      case 'success':
        renderFeedback(state, elements);
        input.disabled = false;
        submit.disabled = false;
        form.reset();
        input.focus();
        break;

      default:
        throw new Error(`Unknown process ${process}`);
    }
  };
  const watchedState = onChange(state, (path, value) => {
    if (path === 'stateForm') {
      handleProcessState(value);
    }
    if (path === 'update') {
      renderFeed(state, elements);
    }
  });
  return watchedState;
};
