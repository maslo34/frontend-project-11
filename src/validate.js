import * as yup from 'yup';

export default (data, state) => {
  const loadedFeeds = state.feed.map((item) => item.url);

  yup.setLocale({
    string: {
      url: 'valHrefErr',
    },
  });

  const schema = yup.object({
    url: yup.string().url().notOneOf(loadedFeeds, 'existsErr'),
  });
  return schema.validate(data);
};
