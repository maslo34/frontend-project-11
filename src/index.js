import 'bootstrap';
import './styles.scss';

import * as yup from 'yup';
import onChange from 'on-change';

const validate = (data, state) => {
  const loadedFeeds = state.feed.map((item) => item.url);
  let schema = yup.object({
    url: yup.string().url().notOneOf(loadedFeeds, 'Error, RSS already exists'),
  });
  return schema.validate(data);
};

const app = () => {
  const form = document.querySelector('form');
  const feedback = document.querySelector('.feedback');
  const input = document.querySelector('#url-input');

  const state = {
    value: '',
    stateForm: 'valid',
    feed: [],
    errors: [],
  };

  const renderError = (err) => {
    feedback.textContent = err;
    input.classList.add('is-invalid');
  };

  const renderFeed = (feed) => {
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
        renderFeed(value);
      }
  });

  const formValidity = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const valueForm = formData.get('url');
    const error = validate({ url: valueForm }, state)
      .then((href) => watchedState.feed.push(href))
      .catch((err) => (watchedState.errors = err.message));
  };

  form.addEventListener('submit', formValidity);
};

app();
