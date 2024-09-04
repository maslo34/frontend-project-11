import i18next from 'i18next';
import axios from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import { uniqueId } from 'lodash';

import validate from './validate.js';
import parser from './parser.js';
import watched from './watcher.js';

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
          successMessage: 'RSS успешно загружен',
          err_emptyField: 'Не должно быть пустым',
          err_network: 'Ошибка сети',
        },
      },
    },
  });

  const state = {
    valueForm: '',
    stateForm: 'invalid',
    feed: [],
    errors: [],
    channel: [],
    lincsRead: [],
    update: 'start',
    elementsForm: {
      form: document.querySelector('form'),
      feedback: document.querySelector('.feedback'),
      input: document.querySelector('#url-input'),
    },
  };
  return state;
};

export default () => {
  const state = init(); // инициализация приложения

  const watchedState = watched(state);

  const getRequest = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url= ${url}`);

  const formValidaty = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const valueForm = formData.get('url');
    validate({ url: valueForm }, state)
      .then((href) => {
        watchedState.feed.push(href);
        watchedState.stateForm = 'valid';
        watchedState.valueForm = valueForm;
      })
      .then(() => getRequest(valueForm))
      .then((response) => {
        if (response.data.status.http_code > 200 || response.data.contents === 'null') {
          watchedState.feed.pop();
          throw new Error('resNotValErr');
        }
        const channel = parser(response.data.contents);
        channel.id = uniqueId();
        channel.item.forEach((element) => {
          const newElementId = element;
          newElementId.id = uniqueId();
        });
        channel.url = valueForm;
        watchedState.stateForm = 'valid';
        watchedState.channel[channel.id] = channel;
        watchedState.update = 'addChannel';
      })
      .catch((err) => {
        if (err.isAxiosError) {
          watchedState.errors = 'err_network';
        }
        watchedState.errors = err.message;
        watchedState.stateForm = 'invalid';
        watchedState.valueForm = '';
      });
  };
  state.elementsForm.form.addEventListener('submit', formValidaty);

  const updateChannels = () => {
    setTimeout(() => {
      watchedState.update = 'loadingPosts';
      state.channel.forEach((el) => {
        const newChanel = getRequest(el.url);
        newChanel.then((response) => {
          const par = parser(response.data.contents);
          const oldPosts = el.item.map((element) => element.title);
          const newPosts = par.item.filter((feed) => !oldPosts.includes(feed.title));
          newPosts.forEach((element) => {
            const newElementId = element;
            newElementId.id = uniqueId();
          });
          watchedState.channel[el.id].item.unshift(...newPosts);
          watchedState.update = 'updatePosts';
        });
      });
      updateChannels();
    }, '5000');
  };
  updateChannels();
};
