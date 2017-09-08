const moment = require('moment');
const ScoreNonLive = require('../models/scorenonliveModel');
const notinonlive = require('../models/notificationnonlive');
const extratime = 0;

const getLeagues = async (req, res) => {
  const date = moment(req.params.date);
  const start = date.clone().hours(11);
  const end = date.clone().add(1, 'days').hours(11);
  const leagues = await ScoreNonLive
    .distinct('league')
    .where('nonlive.timestamp').gte(start).lt(end);

  res.json(leagues);
};

const getMatches = async (req, res) => {
  const league = req.query.leagueName;
  const date = moment(req.params.date);
  const start = date.clone().hours(11);
  const end = date.clone().add(1, 'days').hours(11);
  const matches = await ScoreNonLive
    .find({ league })
    .select('home away homeColor awayColor nonliveCreatedAt')
    .where('nonlive.timestamp').gte(start).lt(end);

  res.json(matches);
};

const matcheDetailold = async (req, res) => {
  const date = moment(req.params.date);
  const start = date.clone().hours(-11);
  const time_now = date.clone().hours(-8).format("YYYY-MM-DD HH:mm:ss.SSS")
  const end = date.clone().add(1, 'days').hours(21);
  const leagues = await ScoreNonLive
    .find({'nonlive.timestamp' : {$gte: start ,$lt: end}, 'hdp.time' : {$gte: time_now}})
  leagues.forEach(function(item) {
      const minute  = [];
        if (item.hdp.length > 3) {
          for (var i = item.hdp.length - 2 ,n=0; i > item.hdp.length - 3; i--,n++) {
            minute[n] = moment(item.hdp[i].time) - moment(item.hdp[i+1].time)
          }
        }
        if (option.between(moment(minute[1]).second(), moment(minute[0]).second() - extratime, moment(minute[0]).second() + extratime,item)) {
          
        }
  })
  res.json(leagues);
};

const matcheDetail = async (req, res) => {
  const date = moment(req.params.date);
  const start = date.clone().hours(11);
  const time_now = date.clone().second(-2).format("YYYY-MM-DD HH:mm:ss.SSS")
  const end = date.clone().add(1, 'days').hours(21);
  const leagues = await ScoreNonLive
    .find({'nonlive.timestamp' : {$gte: start ,$lt: end}, 'hdp.time' : {$gte: time_now}})
  console.log(leagues);

  leagues.forEach(function(data) {
      const minute  = [];
      const item = data
        if (item.hdp.length > 2) {
          notinonlive.find({team_id :item._id}).exec(function(err, team) {
              i = item.hdp.length
              hdp_old   = item.hdp[i-1]
              hdp_last  = item.hdp[i-2]
              odd  =  ''
              if (item.homeColor == "red" || item.homeColor == "blue"  && item.awayColor  == "blue") {
                odd  =  hdp_last.home - hdp_old.home 
                Detail = 'home'+hdp_old.home +' : '+ hdp_last.home
              }else if(item.awayColor  == "red" ){
                odd  = hdp_last.away - hdp_old.away 
                Detail = 'away'+hdp_old.away + ' : ' + hdp_last.away
              }

              if (team.length > 0) {
                var query = {'team_id':item._id},
                update1   = {'$addToSet': { 'hdp': { 
                                duration : moment(moment(hdp_old.time) - moment(hdp_last.time)).second(),
                                odd: (odd.toFixed( 2 ) > 0 ? '+'+ odd.toFixed( 2 ) : odd.toFixed( 2 )),
                                score: hdp_last.score,
                                time: hdp_last.time,
                                odddetail : Detail
                            }}},
                options = {};
                notinonlive.findOneAndUpdate(query, update1, options, function (err, playlist) {});
                console.log('working: Update')
              }else{
                  const instance = new notinonlive({ 
                        'team_id' : item._id,
                        'league' :  item.league,
                        'home'   :  item.home,
                        'away'   :  item.away,
                        'homeColor'   :  item.homeColor,
                        'awayColor'   :  item.awayColor,
                        'hdp'   :  [ { 
                                      duration : moment(moment(hdp_old.time) - moment(hdp_last.time)).second(),
                                      odd: (odd.toFixed( 2 ) > 0 ? '+'+ odd.toFixed( 2 ) : odd.toFixed( 2 )),
                                      score: hdp_last.score,
                                      time: hdp_last.time,
                                      odddetail : Detail
                                  } ]
                      })
                    instance.save()
                console.log('working: New')
              }
          });
      }
  })

  res.json(leagues)
};

const option = {
    between: (x, min, max,item) => {
      // console.log((x >= min && x <= max),x +'='+ min +'='+ max,item.home +"VS"+ item.away);
      return x >= min && x <= max;
    },pushNotification: (data)=>{
      console.log(data);
    }
}

// const intervalObj = setInterval(() => {
//  // ScorenonLiveController.matcheDetail
//  duration_team()
// }, 200);

// function duration_team() {
//   const date = moment();
//   const start = date.clone().hours(-5);
//   const time_now = date.clone().second(6).format("YYYY-MM-DD HH:mm:ss.SSS")
//   // console.log(time_now)
//   const end = date.clone().add(1, 'days').hours(21);
//   const leagues =  ScoreNonLive
//     .find({'nonlive.timestamp' : {$gte: start ,$lt: end}, 'hdp.time' : {$gte: time_now}}).exec(function(err, leagues) {
//         leagues.forEach(function(data) {
//           const minute  = [];
//           const item = data
//           const massage = '';
//             if (item.hdp.length > 2) {
//               notinonlive.find({team_id :item._id}).exec(function(err, team) {
//                   i = item.hdp.length
//                   hdp_old   = item.hdp[i-1]
//                   hdp_last  = item.hdp[i-2]
//                   odd  =  ''
//                   if (item.homeColor == "red" || item.homeColor == "blue"  && item.awayColor  == "blue") {
//                     odd  =  hdp_last.home - hdp_old.home 
//                     Detail = 'home :'+hdp_old.home +' : '+ hdp_last.home
//                   }else if(item.awayColor  == "red" ){
//                     odd  = hdp_last.away - hdp_old.away 
//                     Detail = 'away :'+hdp_old.away + ' : ' + hdp_last.away
//                   }

//                   if (team.length > 0) {
//                         var query = {'team_id':item._id , 'hdp.time' : { $gte: moment(hdp_last.time).second(1) }},
//                         update1   = {'$addToSet': { 'hdp': { 
//                                         duration : moment(moment(hdp_old.time) - moment(hdp_last.time)).second(),
//                                         odd: (odd.toFixed( 2 ) > 0 ? '+'+ odd.toFixed( 2 ) : odd.toFixed( 2 )),
//                                         score: hdp_last.score,
//                                         time: hdp_last.time,
//                                         odddetail : Detail,
//                                         timestamps: moment(),
//                                     }}},
//                         options = {};
//                         notinonlive.findOneAndUpdate(query, update1, options, function (err, playlist) {
//                             // console.log(playlist)
//                             if (playlist != null) {
//                                  console.log('working: Update')
//                             }
//                         });
                       
//                   }else{
//                       const instance = new notinonlive({ 
//                             'team_id' : item._id,
//                             'league' :  item.league,
//                             'home'   :  item.home,
//                             'away'   :  item.away,
//                             'homeColor'   :  item.homeColor,
//                             'awayColor'   :  item.awayColor,
//                             'hdp'   :  [ { 
//                                           duration : moment(moment(hdp_old.time) - moment(hdp_last.time)).second(),
//                                           odd: (odd.toFixed( 2 ) > 0 ? '+'+ odd.toFixed( 2 ) : odd.toFixed( 2 )),
//                                           score: hdp_last.score,
//                                           time: hdp_last.time,
//                                           odddetail : Detail,
//                                           timestamps: moment(),
//                                       } ]
//                           })
//                       instance.save()
//                       console.log('working: New')
//                   }
//               });
//             // console.log(item.home)
            
//           }
//         })
//         console.log('working : '+time_now)
//     })
// }
const scoreController = {
  getLeagues,
  getMatches,
  matcheDetail,

  find: () => ScoreNonLive.find({}),

  findLeagueDistinct: () => ScoreNonLive.distinct('league'),

  findByHomeOrAway: (value) => {
    const pattern = new RegExp(value.replace(' ', '.*'));
    return ScoreNonLive.find({ $or: [
      { home: { $regex: pattern } },
      { away: { $regex: pattern } },
    ] });
  },
};

module.exports = scoreController;
