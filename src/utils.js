import axios from 'axios';

const getRequest = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url= ${url}`);
const daw = (el) => console.log(el);

export { getRequest, daw };
