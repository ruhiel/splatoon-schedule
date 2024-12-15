function pushSchedule(scheduleList, results) {
    for (const result of results) {
        var schedule = searchSchedule(scheduleList, result);

        schedule['scheduleList'].push(result);
    }
}

function searchSchedule(scheduleList, result) {
    const date = new Date(result['start_time']);
    const yyyymmdd = new Intl.DateTimeFormat(
        undefined,
        {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }
    )

    dayString = yyyymmdd.format(date);

    for (const schedule of scheduleList) {
        if (schedule['dayString'] == dayString) {
            return schedule;
        }
    }

    var newSchedule = {
        'dayString': dayString,
        'scheduleList': []
    }

    scheduleList.push(newSchedule);

    return newSchedule;
}

function convertTime(results) {
    for (const result of results) {
        const date = new Date(result['start_time']);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const timeString = `${hours}:${minutes}～`;

        result['start_time_view'] = timeString;
    }

    return results;
}

var scheduleOpenList = [];
var scheduleChallengeList = [];
const App1 = {
    data() {
        return {
            scheduleOpenList: scheduleOpenList,
            scheduleChallengeList: scheduleChallengeList,
            currentTab: 'open' // 初期表示は「オープン」
        };
    }
};

// データを取得
axios.get('https://spla3.yuu26.com/api/schedule')
    .then(response => {
        convertTime(response.data.result.bankara_open);
        convertTime(response.data.result.bankara_challenge);
        pushSchedule(scheduleOpenList, response.data.result.bankara_open);
        pushSchedule(scheduleChallengeList, response.data.result.bankara_challenge);
        const app = Vue.createApp(App1);
        app.mount('#app1');
    })
    .catch(error => {
        console.error('Error:', error);
    });