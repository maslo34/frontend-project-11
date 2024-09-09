export default (strHTML) => {
  // вынести в отдельный файл!
  const pars = new DOMParser();
  const getHTML = pars.parseFromString(strHTML, 'text/xml');
  const nodeError = getHTML.querySelector('parsererror');
  if (nodeError) {
    const error = new Error('resNotValErr');
    error.isParserError = true;
    throw error;
  }
  const channelDes = getHTML.querySelector('channel');
  const itemElements = getHTML.querySelectorAll('item');

  const channel = {
    title: channelDes.querySelector('title').textContent,
    description: channelDes.querySelector('description').textContent,
    item: [],
  };

  itemElements.forEach((el) => {
    const post = {
      title: el.querySelector('title').textContent,
      description: el.querySelector('description').textContent,
      link: el.querySelector('link').textContent,
    };
    channel.item.push(post);
  });
  return channel;
};
