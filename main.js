const ScheduleTable = {
  props: ['schedules'],
  template: `
      <table class="schedule">
        <template v-for="schedule in schedules">
          <tr class="date-row">
            <td colspan="3">{{ schedule.dayString }}</td>
          </tr>
          <tr>
            <th>時間</th>
            <th>ルール</th>
            <th>ステージ</th>
          </tr>
          <tr v-for="item in schedule.scheduleList">
            <td class="time-slot">{{ item.start_time_view }}</td>
            <td>{{ item.rule.name }}</td>
            <td class="stage">
              <div class="stage-list">
                <div>
                  <img :src="item.stages[0].image" :alt="item.stages[0].name" />
                  <div class="stage-name">{{ item.stages[0].name }}</div>
                </div>
                <div>
                  <img :src="item.stages[1].image" :alt="item.stages[1].name" />
                  <div class="stage-name">{{ item.stages[1].name }}</div>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </table>
    `
};

const App1 = {
  components: { ScheduleTable },
  data() {
    return {
      scheduleOpenList: [],
      scheduleChallengeList: [],
      scheduleRegularList: [],
      scheduleXmatchList: [],
      scheduleEventList: [],
      scheduleFestList: [],
      scheduleFestChallengeList: [],
      scheduleCoopGroupingList: [],
      isVisible: false, // ボタンの表示/非表示
      currentTab: 'open' // 初期表示は「オープン」
    };
  },
  mounted() {
    axios.get('https://spla3.yuu26.com/api/schedule')
      .then(response => {
        this.processSchedules(response.data.result.bankara_open, this.scheduleOpenList);
        this.processSchedules(response.data.result.bankara_challenge, this.scheduleChallengeList);
        this.processSchedules(response.data.result.regular, this.scheduleRegularList);
        this.processSchedules(response.data.result.x, this.scheduleXmatchList);
        this.processSchedules(response.data.result.event, this.scheduleEventList);
        this.processSchedules(response.data.result.fest, this.scheduleFestList);
        this.processSchedules(response.data.result.fest_challenge, this.scheduleFestChallengeList);
      })
      .catch(error => {
        console.error('Error:', error);
      });

    axios.get('https://spla3.yuu26.com/api/coop-grouping/schedule')
      .then(response => {
        this.processSchedulesForCoop(response.data.results, this.scheduleCoopGroupingList);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    // スクロールイベントを監視
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    // コンポーネントが破棄されるときにイベントを解除
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    processSchedules(results, scheduleList) {
      const convertedResults = this.convertTime(results);
      this.pushSchedule(scheduleList, convertedResults);
    },
    processSchedulesForCoop(results, scheduleList) {
      const convertedResults = this.convertTime(results);
      this.pushScheduleForCoop(scheduleList, convertedResults);
    },
    pushSchedule(scheduleList, results) {
      for (const result of results) {
        if (!result['rule']) {
          continue;
        }
        const schedule = this.searchSchedule(scheduleList, result);
        schedule.scheduleList.push(result);
      }
    },
    pushScheduleForCoop(scheduleList, results) {
      for (const result of results) {
        const schedule = this.searchSchedule(scheduleList, result);
        const startDate = new Date(result.start_time);
        const endDate = new Date(result.end_time);
        const start_dt = luxon.DateTime.fromJSDate(startDate);
        const end_dt = luxon.DateTime.fromJSDate(endDate);

        result.boss_image = "img/" + result.boss.name + ".png"

        schedule.period = start_dt.setLocale('ja').toFormat('yyyy/MM/dd(EEE) HH:mm ～ ') + end_dt.setLocale('ja').toFormat('yyyy/MM/dd(EEE) HH:mm');
        schedule.scheduleList.push(result);
      }
    },
    searchSchedule(scheduleList, result) {
      const date = new Date(result.start_time);
      const start_dt = luxon.DateTime.fromJSDate(date);
      const dayString = start_dt.setLocale('ja').toFormat('yyyy/MM/dd(EEE)');

      let schedule = scheduleList.find(s => s.dayString === dayString);
      if (!schedule) {
        schedule = { dayString, scheduleList: [] };
        scheduleList.push(schedule);
      }
      return schedule;
    },
    convertTime(results) {
      return results.map(result => {
        const startDate = new Date(result.start_time);
        const endDate = new Date(result.end_time);

        const start_dt = luxon.DateTime.fromJSDate(startDate);
        const end_dt = luxon.DateTime.fromJSDate(endDate);

        if (start_dt.hasSame(end_dt, 'day')) {
          result.start_time_view = start_dt.toFormat('HH:mm ～ ') + end_dt.toFormat('HH:mm');
        } else {
          result.start_time_view = start_dt.toFormat('HH:mm ～ ') + end_dt.toFormat('MM/dd HH:mm');
        }

        const diff = end_dt.diff(start_dt, 'hours');
        result.diff = diff.hours + '時間';

        return result;
      });
    },
    handleScroll() {
      // スクロール位置が100pxを超えたらボタンを表示
      this.isVisible = window.scrollY > 100;
    },
    scrollToTop() {
      // スムーズにトップへスクロール
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  }
};

const app = Vue.createApp(App1);
app.mount('#app1');