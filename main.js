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
      })
      .catch(error => {
        console.error('Error:', error);
      });
  },
  methods: {
    processSchedules(results, scheduleList) {
      const convertedResults = this.convertTime(results);
      this.pushSchedule(scheduleList, convertedResults);
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
    searchSchedule(scheduleList, result) {
      const date = new Date(result.start_time);
      const dayString = new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);

      let schedule = scheduleList.find(s => s.dayString === dayString);
      if (!schedule) {
        schedule = { dayString, scheduleList: [] };
        scheduleList.push(schedule);
      }
      return schedule;
    },
    convertTime(results) {
      return results.map(result => {
        const date = new Date(result.start_time);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        result.start_time_view = `${hours}:${minutes}～`;
        return result;
      });
    }
  }
};

const app = Vue.createApp(App1);
app.mount('#app1');