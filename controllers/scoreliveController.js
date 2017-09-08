const moment = require('moment');
const ScoreLive = require('../models/scoreliveModel');
const extratime = 0;
const getLeagues = async (req, res) => {
  // moment().format('YYYY-MM-DD')
  // const date = moment(req.params.date);
  const date = moment(req.params.date);
  // console.log(date)
  const start = date.clone().hours(11);
  const end = date.clone().add(1, 'days').hours(11);
  console.log(start)
  const leagues = await ScoreLive
    .distinct('league')
    .where('live.timestamp').gte(start).lt(end);
  res.json(leagues);
};

const getMatches = async (req, res) => {
  const league = req.query.leagueName;
  const date = moment(req.params.date);
  const start = date.clone().hours(11);
  const end = date.clone().add(1, 'days').hours(11);
  const matches = await ScoreLive
    .find({ league })
    .select('home away homeColor awayColor liveCreatedAt')
    .where('live.timestamp').gte(start).lt(end);
  res.json(matches);
};

const matcheDetail = async (req, res) => {
  const date = moment(req.params.date);
  const start = date.clone().hours(-13);
  const time_now = date.clone().hours(-8).format("YYYY-MM-DD HH:mm:ss.SSS")
  // console.log(time_now)
  const end = date.clone().add(1, 'days').hours(21);
  const leagues = await ScoreLive
    .find({'live.timestamp' : {$gte: start ,$lt: end}, 'hdp.time' : {$gte: time_now}})
    // .where('hdp').gte(1).lt(2)
    // .distinct('league')
    // .where('hdp.time').gte(start).lt(end);
    // setInterval(() => {
    //     console.log('timeout');
    // }, 100);
  leagues.forEach(function(item) {
      const minute  = [];
      // const data    = []; 
        if (item.hdp.length > 3) {
          for (var i = item.hdp.length - 2 ,n=0; i > item.hdp.length - 3; i--,n++) {
            minute[n] = moment(item.hdp[i].time) - moment(item.hdp[i+1].time)
            // data[n]['hdp']    = item.hdp[i+1].time;
            // data[n]['team']   = item.home;
          }
        }
        if (option.between(moment(minute[1]).millisecond(), moment(minute[0]).millisecond() - extratime, moment(minute[0]).millisecond() + extratime,item)) {
            // option.pushNotification(data)
            // console.log('test');
            // console.log(moment(minute[0]).seconds()+30,item.home,item.away)
        }
      // console.log(moment(minute[0]).seconds()+30,item.home,item.away)
  })
  res.json(leagues);
};

const option = {
    between: (x, min, max,item) => {
      console.log((x >= min && x <= max),x +'='+ min +'='+ max,item.home +"VS"+ item.away);
      return x >= min && x <= max;
    },
    pushNotification: (data)=>{
      console.log(data);
    }
}

const scoreController = {
  matcheDetail,
  getLeagues,
  getMatches,

  find: () => ScoreLive.find({}),

  findLeagueDistinct: () => ScoreLive.distinct('league'),

  findByHomeOrAway: (value) => {
    const pattern = new RegExp(value.replace(' ', '.*'));
    return ScoreLive.find({ $or: [{ home: { $regex: pattern } }, { away: { $regex: pattern } }] });
  },
};

module.exports = scoreController;
