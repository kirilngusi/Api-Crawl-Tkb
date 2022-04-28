const axios = require("axios").default;
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
axiosCookieJarSupport(axios);

const tough = require("tough-cookie");
const cookieJar = new tough.CookieJar();

const md5 = require("md5");
const qs = require("query-string");
const cheerio = require("cheerio");

const XLSX = require("xlsx");

const { parseInitialFormData, parseSelector } = require("./parseForm");
const { loginUrl, scheduleUrl } = require("./Contexts/contains");

axios.defaults.withCredentials = true;
axios.defaults.crossdomain = true;
axios.defaults.jar = cookieJar;

const login = async (username, password) => {
    const config = {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/76.0.114 Chrome/70.0.3538.114 Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
        jar: cookieJar,
    };

    let getData = await axios.get(loginUrl, config);

    let $ = cheerio.load(getData.data);

    const formData = {
        ...parseInitialFormData($),
        ...parseSelector($),

        txtUserName: username,
        txtPassword: md5(password),
        btnSubmit: "Đăng nhập",
    };

    // console.log(formData) //true
    const formDataQS = qs.stringify(formData);

    let postData = await axios.post(loginUrl, formDataQS, config);

    $ = cheerio.load(postData.data);

    const userFullName = $("#PageHeader1_lblUserFullName").text();
    const wrongPass = $("#lblErrorInfo").text();

    if (userFullName == "khách" || wrongPass) {
        return "Error 401";
    } else {
        const schedule = await getAndReadXLS();
        return { schedule };
    }
};

const getAndReadXLS = async () => {
    const config = {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/76.0.114 Chrome/70.0.3538.114 Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
        jar: cookieJar,
    };

    const getSchedulePage = await axios.get(scheduleUrl, config);

    $ = cheerio.load(getSchedulePage.data);

    let selector = parseSelector($);
    selector.dprTerm = 1;
    selector.dprType = "A";
    selector.btnView = "Xuất file Excel";
    selector.drpSemester = selector.drpSemester;

    let scheduleFormData = {
        ...parseInitialFormData($),
        ...selector,
    };

    // console.log(scheduleFormData);

    const scheduleFormDataQS = qs.stringify(scheduleFormData);

    const schedulePost = await axios.post(scheduleUrl, scheduleFormDataQS, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        },
        responseType: "arraybuffer",
    });

    // console.log(schedulePost.data);

    let schedule = [];

    //get row col table
    let getAddressCell = (str) => {
        let r = /\d+/;
        let row = parseInt(str.match(r)[0]);
        // console.log("row: ", row);
        let col = str.replace(row, "");
        // console.log(col);
        return { row: row, col: col };
    };

    let formatDateYMD = (str) => {
        str = str.split("/");
        let day = str[0];
        let month = str[1];
        let year = str[2];
        //take
        return new Date(`${year}/${month}/${day}`).getTime();
    };

    //return day
    let formatDay = (day) => {
        return day - 1;
    };

    //find day
    let findDatewithDay = (start_date, end_date, day) => {
        let dateList = [];
        for (let i = start_date; i < end_date; i += 60 * 60 * 24 * 1000) {
            let date_check = new Date(i);
            if (formatDay(day) == date_check.getDay()) {
                dateList.push(date_check);
            }
        }
        return dateList;
    };

    //lấy date trùng
    let findIndexDate = (date) => {
        let index = -1;
        for (let i = 0; i < schedule.length; i++) {
            if (schedule[i].date == date) {
                return i;
            }
        }
        return index;
    };

    let addToSchedule = (
        start_date,
        end_date,
        day,
        lesson,
        subject_name,
        address
    ) => {
        let dateList = [];
        dateList = findDatewithDay(start_date, end_date, day);
        for (let i = 0; i < dateList.length; i++) {
            var found = findIndexDate(dateList[i]);
            if (found == -1) {
                let lessons = new Array();
                lessons.push({
                    lesson: lesson,
                    subject_name: subject_name,
                    address: address,
                });
                schedule.push({ date: dateList[i] + 1, lessons: lessons });
            } else {
                schedule[found].lessons.push({
                    lesson: lesson,
                    subject_name: subject_name,
                    address: address,
                });
            }
        }
    };

    let lessonArray = (lesson) => {
        let lesson_array_new = [];
        let lesson_array = [
            "1,2,3",
            "4,5,6",
            "7,8,9",
            "10,11,12",
            "13,14,15,16",
        ];
        for (let i = 0; i < lesson_array.length; i++) {
            if (lesson.indexOf(lesson_array[i]) != -1) {
                lesson_array_new.push(lesson_array[i]);
            }
        }
        return lesson_array_new;
    };
    let getInfoDetail = (start_date, end_date, subject_name, str) => {
        str = str.split("\n");
        // console.log(str);
        for (let i = 0; i < str.length; i++) {
            if (str[i] != "" && str[i] != null && str[i] != undefined) {
                let str_info = str[i].split("tại");
                let address = str_info[1];
                let day_and_lesson = str_info[0].split("tiết");
                let lesson = day_and_lesson[1]
                    .replace(" ", "")
                    .replace(" ", "");
                let day = day_and_lesson[0].replace(" ", "").replace("Thứ", "");
                let lesson_array = lessonArray(lesson);
                for (let i = 0; i < lesson_array.length; i++) {
                    addToSchedule(
                        start_date,
                        end_date,
                        day,
                        lesson_array[i],
                        subject_name,
                        address
                    );
                }
            }
        }
    };

    var workbook = XLSX.read(schedulePost.data, { type: "buffer" });

    // console.log(schedulePost.data);

    var worksheet = workbook.Sheets[workbook.SheetNames[0]];

    //info student
    let name = worksheet["C6"]["v"];
    let student_id = worksheet["F6"]["v"];
    let class_name = worksheet["C7"]["v"];
    let major = worksheet["F8"]["v"];

    for (z in worksheet) {
        if (z[0] === "!") continue;
        //doc tu trai qua phai het excel
        // console.log(worksheet[z]["v"]);
        if (
            worksheet[z]["v"].toString().indexOf("Từ") >= 0 &&
            worksheet[z]["v"].toString().indexOf("đến") >= 0
        ) {
            //read thoi gian dia diem file excel
            let address_cell = getAddressCell(z);
            let subject_name = worksheet[`F${address_cell.row}`]["v"];
            let sessionList = worksheet[z]["v"].toString().split("Từ");
            for (let i = 0; i < sessionList.length; i++) {
                let str = sessionList[i].replace("\n", "").split(":");
                let str_datetime = str[0].replace(" ", "").split("đến");
                // console.log(str_datetime);
                let str_start_date = str_datetime[0];

                let str_end_date = str_datetime[1];

                if (str_start_date != undefined && str_end_date != undefined) {
                    getInfoDetail(
                        formatDateYMD(str_start_date),
                        formatDateYMD(str_end_date),
                        subject_name,
                        str[1]
                    );
                }
            }
        }
    }

    // console.log(fullInfo);
    schedule.sort(function (a, b) {
        if (new Date(a.date) < new Date(b.date)) return -1;
        else if (new Date(a.date) > new Date(b.date)) return 1;
        else {
            return (
                parseInt(a.lessons[0].lesson) - parseInt(b.lessons[0].lesson)
            );
        }
    });
    return {
        fullInfo: {
            name,
            student_id,
            class_name,
            major,
            schedule: [...schedule],
        },
    };
};

module.exports = {
    login,
    getAndReadXLS,
};
