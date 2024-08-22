import onChange from 'on-change';
import i18next from 'i18next';

import validate from './validate.js';

const init = () => {
  i18next.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru: {
        translation: {
          valHrefErr: 'Ссылка должна быть валидным URL',
          existsErr: 'RSS уже существует',
          resNotValErr: 'Ресурс не содержит валидный RSS',
        },
      },
    },
  });
};

export default () => {
  init(); // инициализация приложения

  const form = document.querySelector('form');
  const feedback = document.querySelector('.feedback');
  const input = document.querySelector('#url-input');

  const state = {
    stateForm: 'valid',
    feed: [],
    errors: [],
  };

  const renderError = (err) => {
    feedback.textContent = i18next.t(err);
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
  };

  const renderFeed = () => {
    feedback.textContent = 'RSS успешно загружен';
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    form.reset();
    input.focus();
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'errors') {
      renderError(value);
    }
    if (path === 'feed') {
      renderFeed();
    }
  });

  const formValidity = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const valueForm = formData.get('url');
    validate({ url: valueForm }, state)
      .then((href) => watchedState.feed.push(href))
      .catch((err) => {
        watchedState.errors = err.message;
      });
  };

  form.addEventListener('submit', formValidity);
};
