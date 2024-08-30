import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import { uniqueId } from 'lodash';

import validate from './validate.js';
import parser from './parser.js';

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
    valueForm: '',
    stateForm: 'invalid',
    feed: [],
    errors: [],
    channel: [],
    update: 'start',
  };

  const renderError = (err) => {
    feedback.textContent = i18next.t(err);
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
  };

  const renderFeed = () => {
    if (state.update === 'loadingPosts') {
      return;
    }

    if (state.update === 'addChannel') {
      feedback.textContent = 'RSS успешно загружен'; // Перенести в i18n
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      form.reset();
      input.focus();

      const feedsConteiner = document.querySelector('.feeds');
      feedsConteiner.innerHTML = '';
      const borderFeeds = document.createElement('div');
      const bodyFeeds = document.createElement('div');
      const titleFeeds = document.createElement('h2');
      const ulFeeds = document.createElement('ul');

      feedsConteiner.append(borderFeeds);
      borderFeeds.append(bodyFeeds);
      borderFeeds.append(ulFeeds);
      bodyFeeds.append(titleFeeds);

      borderFeeds.classList.add('card', 'border-0');
      bodyFeeds.classList.add('card-body');
      titleFeeds.classList.add('card-title', 'h4');
      titleFeeds.textContent = 'Фиды';
      ulFeeds.classList.add('list-group', 'border-0', 'rounded-8');

      state.channel.forEach((chan) => {
        const li = document.createElement('li');
        const h3 = document.createElement('h3');
        const p = document.createElement('p');

        li.classList.add('list-group-item', 'border-0', 'border-end-0');
        p.classList.add('m-0', 'small', 'text-black-50');
        h3.classList.add('h6', 'm-0');
        p.textContent = chan.description;
        h3.textContent = chan.title;
        li.append(h3);
        li.append(p);
        ulFeeds.append(li);
      });
    }

    const postsConteiner = document.querySelector('.posts');

    postsConteiner.innerHTML = '';

    const borderPosts = document.createElement('div');
    const postsBody = document.createElement('div');
    const postsTitle = document.createElement('h2');
    const postsUl = document.createElement('ul');

    postsConteiner.append(borderPosts);
    borderPosts.append(postsBody);
    borderPosts.append(postsUl);
    postsBody.append(postsTitle);

    postsBody.classList.add('card-body');
    postsTitle.classList.add('card-title', 'h4');
    postsTitle.textContent = 'Посты';
    postsUl.classList.add('list-group', 'border-0', 'rounded-8');

    state.channel.forEach((chan) => {
      chan.item.forEach((post) => {
        const liPost = document.createElement('li');
        const a = document.createElement('a');
        const button = document.createElement('button');
        postsUl.append(liPost);
        liPost.append(a);
        liPost.append(button);
        liPost.classList.add(
          'list-group-item',
          'd-flex',
          'justify-content-between',
          'align-items-start',
          'border-0',
          'border-end-0',
        );
        a.textContent = post.title;
        a.href = post.link;
        a.classList.add('fw-bold');
        button.textContent = 'Просмотр';
        button.type = 'button';
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      });
    });
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'errors') {
      renderError(value);
    }
    if (path === 'update') {
      renderFeed();
    }
  });

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
        channel.url = valueForm;
        watchedState.stateForm = 'valid';
        watchedState.channel[channel.id] = channel;
        watchedState.update = 'addChannel';
      })
      .catch((err) => {
        watchedState.errors = err.message;
        watchedState.stateForm = 'invalid';
        watchedState.valueForm = '';
      });
  };

  form.addEventListener('submit', formValidaty);

  const updateChannels = () => {
    watchedState.update = 'loadingPosts';
    if (state.update !== 'start') {
      setTimeout(() => {
        state.channel.forEach((el) => {
          const newChanel = getRequest(el.url);
          newChanel.then((response) => {
            const par = parser(response.data.contents);
            const oldPosts = el.item.map((element) => element.title);
            const newPosts = par.item.filter((feed) => !oldPosts.includes(feed.title));
            watchedState.channel[el.id].item.unshift(...newPosts);
            watchedState.update = 'updatePosts';
          });
        });
        updateChannels();
      }, '5000');
    } else {
      setTimeout(() => updateChannels(), '5000');
    }
  };
  updateChannels();
};
