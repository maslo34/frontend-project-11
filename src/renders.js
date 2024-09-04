import i18next from 'i18next';

const renderModal = (event, state) => {
  const postId = event.target.dataset.id;
  let rightPost;
  state.channel.forEach((chan) => {
    rightPost = chan.item.find((pos) => pos.id === postId);
  });
  state.lincsRead.push(rightPost.link);

  const modalTitle = document.querySelector('.modal-title');
  const modalDescription = document.querySelector('.modal-body');
  const modalHref = document.querySelector('.modal-footer > a');
  const link = document.querySelector(`[href="${rightPost.link}"]`);
  modalTitle.textContent = rightPost.title;
  modalDescription.textContent = rightPost.description;
  modalHref.href = rightPost.link;
  link.classList.remove('fw-bold');
  link.classList.add('fw-normal', 'link-secondary');
};

const renderFeed = (state) => {
  if (state.update === 'loadingPosts') {
    return;
  }

  if (state.update === 'addChannel') {
    const newFeedback = state.elementsForm.feedback;
    newFeedback.textContent = i18next.t('successMessage');
    state.elementsForm.input.classList.remove('is-invalid');
    state.elementsForm.feedback.classList.remove('text-danger');
    state.elementsForm.feedback.classList.add('text-success');
    state.elementsForm.form.reset();
    state.elementsForm.input.focus();

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
      if (state.lincsRead.includes(post.link)) {
        a.classList.add('fw-normal', 'link-secondary');
      } else {
        a.classList.add('fw-bold');
      }
      button.textContent = 'Просмотр';
      button.type = 'button';
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.dataset.bsToggle = 'modal';
      button.dataset.bsTarget = '#modal';
      button.dataset.id = post.id;
      button.addEventListener('click', (event) => renderModal(event, state));
    });
  });
};

const renderError = (err, state) => {
  const newFeedback = state.elementsForm.feedback;
  newFeedback.textContent = i18next.t(err);
  state.elementsForm.input.classList.add('is-invalid');
  state.elementsForm.feedback.classList.remove('text-success');
  state.elementsForm.feedback.classList.add('text-danger');
};

export { renderError, renderFeed };
