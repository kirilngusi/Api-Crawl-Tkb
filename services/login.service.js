const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
axiosCookieJarSupport(axios);

const tough = require('tough-cookie');
const cookieJar = new tough.CookieJar();

const md5 = require('md5');
const qs = require('query-string');
const cheerio = require('cheerio');

const XLSX = require('xlsx');

const { parseInitialFormData, parseSelector } = require('../utilities/parseForm');
const { loginUrl, scheduleUrl } = require('./Contexts/contains');

axios.defaults.withCredentials = true;
axios.defaults.crossdomain = true;
axios.defaults.jar = cookieJar;

const login = async (username, password) => {
    const config = {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/76.0.114 Chrome/70.0.3538.114 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true,
        jar: cookieJar
    };

    let getData = await axios.get(loginUrl, config);

    let $ = cheerio.load(getData.data);

    const formData = {
        ...parseInitialFormData($),
        ...parseSelector($),

        txtUserName: username,
        txtPassword: md5(password),
        btnSubmit: 'Đăng nhập'
    };

    // console.log(formData) //true
    const formDataQS = qs.stringify(formData);

    let postData = await axios.post(loginUrl, formDataQS, config);

    $ = cheerio.load(postData.data);

    const userFullName = $('#PageHeader1_lblUserFullName').text();
    const wrongPass = $('#lblErrorInfo').text();

    if (userFullName == 'khách' || wrongPass) {
        return 'Error 401';
    } else {
        const schedule = await getAndReadXLS();
        return { schedule };
    }
};

module.exports = {
    login
};
