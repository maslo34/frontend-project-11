import onChange from 'on-change';

import {
  renderError,
  renderFeed,
  clearFeedback,
  renderSuccessMessage,
} from './renders.js';

export default (state) => {
  const handleProcessState = (processState) => {
    const { input, submit, form } = state.elementsForm;
    switch (processState) {
      case 'error':
        renderError(state);
        input.disabled = false;
        submit.disabled = false;
        input.focus();
        break;

      case 'sending':
        clearFeedback(state.elementsForm);
        submit.disabled = true;
        input.disabled = true;
        break;

      case 'success':
        renderSuccessMessage(state.elementsForm);
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
      renderFeed(state);
    }
  });
  return watchedState;
};
