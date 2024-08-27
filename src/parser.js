export default (strHTML) => {
  // вынести в отдельный файл!
  const pars = new DOMParser();
  const res = pars.parseFromString(strHTML, 'text/html');
  const channelDes = res.querySelector('channel');
  const itemElements = res.querySelectorAll('item');

  const channel = {
    title: channelDes.querySelector('title').textContent,
    description: channelDes.querySelector('description').innerHTML,
    item: [],
  };

  itemElements.forEach((el) => {
    const post = {
      title: el.querySelector('title').innerHTML,
      description: el.querySelector('description').innerHTML,
      link: el.querySelector('guid').innerHTML,
    };
    channel.item.push(post);
  });
  return channel;
};
