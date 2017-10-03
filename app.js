const express = require('express');
const path    = require('path');
const favicon = require('serve-favicon');
const logger  = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const stylus  = require('stylus');
const dotenv  = require('dotenv');
const index   = require('./routes/index');
const users   = require('./routes/users');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const request = require('request')
const app = express();
const port = process.env.PORT || 5001;
dotenv.load();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
const db = mongoose.connection;

db.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

db.once('open', function() {
  console.log(`connected mongodb on ${ process.env.MONGODB_URI }`);
});

// section app.notify()
const moment = require('moment');
const ScoreNonLive = require('./models/scorenonliveModel');
const notinonlive = require('./models/notificationnonlive');
const extratime = 0;

duration_team()
function duration_team() {
    const date = moment();
    const start = date.clone().hours(-5);
    const time_now = date.clone().second(6).format("YYYY-MM-DD HH:mm:ss.SSS")
    const end = date.clone().add(1, 'days').hours(21);
    const leagues =  ScoreNonLive   
     .find({'nonlive.timestamp' : {$gte: start ,$lt: end}, 'hdp.time' : {$gte: time_now}}).exec(function(err, leagues) {
      if (leagues != null) {
        leagues.forEach(function(data) {
          let valueGraph = '';
          let colorTeam = '';
          const awayColor = data.awayColor;
          const homeColor = data.homeColor;
          const obj = [];
            if (awayColor === 'blue' && homeColor === 'blue') {
              valueGraph = 'home';
              colorTeam  = 'away'
            } else if (awayColor === 'red') {
              valueGraph  = 'away';
              colorTeam   = 'home'
            } else if (homeColor === 'red') {
              valueGraph = 'home';
              colorTeam  = 'away'
            }
            const hdpnow = data.hdp.length 
            if (hdpnow > 1) {
              const time_change =  getChangeval(data.hdp, 'hdp', 'FT-HDP');
              const changeval =  geneGraphEach_noti(data.hdp, 'hdp', 'FT-HDP', valueGraph, 'chartContainerHDP');
              // if (time_change < 30) {
              //   const val_change = changeval.last
              //   notinonlive.findOne({team_id :data._id}).exec(function(err, team) {
              //       const text = `( ลีค : ${data.league} ) ( ทีมที่แข่ง :  ทีมเจ้าบ้าน ${data.home}  -  ทีมเยือน ${data.away} ) ( odd : ${val_change.odds} )  ( hdp ปัจจุบัน ${data.hdp[hdpnow-1].hdp} ) ( hdp-value ล่าสุด : ${val_change.values} )( hdp-เปลี่ยน : ${data.hdp.length} รอบ)  (เวลาเปลียน : ${time_change} วินาที) ( เวลาที่แข่ง : ${data.nonlive.time} )`
              //       console.log(text);
              //       if (team == null) {
              //           const instance = new notinonlive({ 
              //               'team_id' : data._id,
              //               'count_hdp' : data.hdp.length,
              //               'notihdp':{ time_change: time_change, 
              //                           hdp:  data.hdp[hdpnow-1].hdp,
              //                           round:  data.hdp.length,
              //                           odd: val_change.odds ,
              //                           time: data.hdp[hdpnow - 1].time,
              //                           value: val_change.value
              //                       }
              //           })
              //           instance.save()
              //           pushMassage(['U8eb2dd94f8053572d303decd1413dda8','U011891b075259f3861aeec4fff1e7da8'],text)

              //       }else if(team.count_hdp !== data.hdp.length){
              //           const data = { time_change: time_change, 
              //                           hdp:  data.hdp[hdpnow-1].hdp,
              //                           round:  data.hdp.length,
              //                           odd: val_change.odds,
              //                           time: data.hdp[hdpnow - 1].time,
              //                           value: val_change.value
              //                       };
              //           notinonlive.findOneAndUpdate({team_id: data._id}, {$set:{count_hdp: data.hdp.length } ,$addToSet: {notihdp : data}}, {new: true}, function (err, massage) {
              //               if (massage != null) {
              //                    console.log('working: Update')
              //               }
              //           });
              //           // console.log(team.count_hdp)
              //           pushMassage(['U8eb2dd94f8053572d303decd1413dda8','U011891b075259f3861aeec4fff1e7da8'],text)
              //       }
              //   })
              // }
                const calculator_odd =  calculator(changeval.last.odds,changeval.lastPad.odds)
                const acckey = 'mhfFewpXV/SB5gu0wMUrEJrQf+rpJ1FcDTS1TxOecWiMyZ8UKxDp1sJtAM0I0I8KgLNaGXOzYLN00aHMKhMgwDCGI3zEQXTswpm5YQPtSdLLDTy3XslDYOtVQUgbor9wpDAUOj71Y/C6ZmbKYxP3UAdB04t89/1O/w1cDnyilFU='
                console.log(calculator_odd.toFixed(2))
                if (calculator_odd > 0.12 && changeval.last.values !== changeval.lastPad.values) {
                    notinonlive.findOne({ team_id :data._id }).exec(function(err, team) {
                        const current_time  = moment(data.hdp[hdpnow - 1].time).format('hh:mm:ss')
                        const text = `${current_time} Time : ${data.nonlive.time}  ${data[colorTeam]} ( HDP ${data.hdp[hdpnow-1].hdp} : ${changeval.lastPad.odds}) Odd : ${calculator_odd.toFixed(2)}`
                        console.log(text);
                        if (team == null) {
                            const instance = new notinonlive({ 
                                'team_id' : data._id,
                                'count_price' : data.hdp.length
                            })
                            instance.save()
                            pushMassage(['U8eb2dd94f8053572d303decd1413dda8','U011891b075259f3861aeec4fff1e7da8'],text,acckey)

                        }else if(team.count_price !== data.hdp.length){
                            notinonlive.findOneAndUpdate({team_id: data._id}, {$set:{count_price: data.hdp.length }}, {new: true}, function (err, massage) {
                                if (massage != null) {
                                     console.log('working: Update')
                                }
                            });
                            pushMassage(['U8eb2dd94f8053572d303decd1413dda8','U011891b075259f3861aeec4fff1e7da8'],text,acckey)
                        }
                    })
                }else if (calculator_odd < -0.12 && changeval.last.values !== changeval.lastPad.values){
                    notinonlive.findOne({team_id :data._id}).exec(function(err, team) {
                        const current_time  = moment(data.hdp[hdpnow - 1].time).format('hh:mm:ss')
                        const text = `${current_time} Time : ${data.nonlive.time}  ${data[valueGraph]} ( HDP ${data.hdp[hdpnow-1].hdp} : ${changeval.lastPad.odds}) Odd : ${calculator_odd.toFixed(2)}`
                        console.log(text);
                        if (team == null) {
                            const instance = new notinonlive({ 
                                'team_id' : data._id,
                                'count_price' : data.hdp.length
                            })
                            instance.save()
                            pushMassage(['U8eb2dd94f8053572d303decd1413dda8','U011891b075259f3861aeec4fff1e7da8'],text,acckey)

                        }else if(team.count_price !== data.hdp.length){
                            notinonlive.findOneAndUpdate({team_id: data._id}, {$set:{count_price: data.hdp.length }}, {new: true}, function (err, massage) {
                                if (massage != null) {
                                     console.log('working: Update')
                                }
                            });
                            pushMassage(['U8eb2dd94f8053572d303decd1413dda8','U011891b075259f3861aeec4fff1e7da8'],text,acckey)
                        }
                    })
                }
                

            }
      });
    }
  });
    console.log('botstart');
    // duration_team()
    setTimeout(duration_team, 10);
}
// const acckey = 'f6+s4Q+2ZdOyHfJsgFhwWsrQA1GuOWNl0IiU5xUXjRHRnvHZ8G+SxbfGDzcstYzAgLNaGXOzYLN00aHMKhMgwDCGI3zEQXTswpm5YQPtSdLsNyxPuqun4jDNqGNe0hMiDS91KrXWL0FlI9Wa9CkthgdB04t89/1O/w1cDnyilFU='
// pushMassage(['U8eb2dd94f8053572d303decd1413dda8','U011891b075259f3861aeec4fff1e7da8'],'test phawin',acckey)
function calculator(oods,odds_old) {
    let $odd; 
    $odd = oods - odds_old;
    if (odds_old  > 0 && oods < 0) {
        $odd = (1 - odds_old) + (1 + oods)
    }else if(odds_old  < 0 && oods > 0){
        $odd = (oods - 1) - (odds_old + 1)
    }
    return $odd; 
}

function pushMassage(sender, text,acckey) {
    let data = {
        to: sender,
        messages: [
          {
            type: 'text',
            text: text
          }
        ]
      }
      request({
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer {${acckey}}`
        },
        url: 'https://api.line.me/v2/bot/message/multicast',
        method: 'POST',
        body: data,
        json: true
      }, function (err, res, body) {
        if (err) console.log('error')
        if (res) console.log('success')
        if (body) console.log(body)
      })
}

function getChangeval(data, filter, type, value, containername) {
  const num = data.length
  const hdp_last   = data[num-1]
  const hdp_old  = data[num-2]
  const time_chane =  moment(hdp_old.time)  - moment(hdp_last.time)
  return moment(time_chane).second()
}

app.post('/webhook', (req, res) => {
  var text = req.body.events[0].message.text
  var sender = req.body.events[0].source.userId
  var replyToken = req.body.events[0].replyToken
  console.log(text, sender, replyToken)
  console.log(typeof sender, typeof text)
  // console.log(req.body.events[0])
  if (text === 'สวัสดี' || text === 'Hello' || text === 'hello') {
    sendText(sender, text)
  }
  res.sendStatus(200)
})

function sendText (sender, text) {
  let data = {
    to: sender,
    messages: [
      {
        type: 'text',
        text: 'สวัสดีค่ะ เราเป็นผู้ช่วยปรึกษาด้านความรัก สำหรับหมามิ้น 💞'
      }
    ]
  }
  request({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {7vMw0bRGc4GE40gKz8LVYaqzbosXNpJ32gmmja5DK2NOOquFSl2GXBBUtLT9xH9HITMc9Y15X84YhMhJFoC3bDgvcK2iedZleSJmMppj3A1Mtd1IhmkoXtQvk/rdVk3CYEKqdEpf01ChYWVaRXZgYwdB04t89/1O/w1cDnyilFU=}'
    },
    url: 'https://api.line.me/v2/bot/message/multicast',
    method: 'POST',
    body: data,
    json: true
  }, function (err, res, body) {
    if (err) console.log('error')
    if (res) console.log('success')
    if (body) console.log(body)
  })
}

function geneGraphEach_noti(data, filter, type, value, containername) {
  const chartdata = [];
  const obj = data;
  const guideOdd = {};
  let changeValue = true;
  let newValueOddChange = 0;
  let newValue = 0;
  let countReplaceHDP = 0;
  const arrChangeval = [];
  const defaultValue = [];
  const chartValue = [];
  arrChangeval.hdp =[];

  for (let index in obj) {
    if (index < obj.length) {
      const newDate = new Date(obj[index].time);
      if (obj[index][filter].length > 1) {
        if ((!guideOdd[obj[index][filter]]) || (obj[index][filter] != obj[index-1][filter])) {
          defaultValue[filter] = parseFloat(obj[index][value]);
          newValueOddChange = newValue;
        }
      }

      if (parseFloat(obj[index][value]) > 0 && defaultValue[filter] > 0) {
        newValue = parseFloat(obj[index][value]) - defaultValue[filter];
      } else if (parseFloat(obj[index][value]) < 0 && defaultValue[filter] < 0) {
        newValue = parseFloat(obj[index][value]) - defaultValue[filter];
      } else if (parseFloat(obj[index][value]) === -1 && defaultValue[filter] === 1) {
        newValue = 0;
      } else if (parseFloat(obj[index][value]) === 1 && defaultValue[filter] === -1) {
        newValue = 0;
      } else if (parseFloat(obj[index][value]) > 0 && defaultValue[filter] < 0) {
        newValue = (1 - Math.abs(defaultValue[filter])) + (1 - Math.abs(parseFloat(obj[index][value])));
        newValue *= -1;
      } else if (parseFloat(obj[index][value]) < 0 && defaultValue[filter] > 0) {
        newValue = (1 - Math.abs(defaultValue[filter])) + (1 - Math.abs(parseFloat(obj[index][value])));
      } else if (defaultValue[filter] === 1 && parseFloat(obj[index][value]) < 0) {
        newValue = 1 + parseFloat(obj[index][value]);
      } else if (defaultValue[filter] === 1 && parseFloat(obj[index][value]) > 0) {
        newValue = parseFloat(obj[index][value]) - 1;
      }
      newValue += newValueOddChange;
      if (obj[index][filter].length > 1 ) {
        if(!guideOdd[obj[index][filter]]){
          guideOdd[obj[index][filter]] = addGuideEach(type, newDate, obj[index][filter]);
        } else if(obj[index][filter] != obj[index-1][filter]) {
          guideOdd[`${obj[index][filter]}-${countReplaceHDP}`] = addGuideEach(type, newDate, obj[index][filter]);
          countReplaceHDP++;
        }
      }

      if (obj[index].score !== '' && !guideScore[obj[index].score] && filter === 'hdp') {
        guideScore[obj[index].score] = addGuideScoreEach('Score', newDate, obj[index].score);
      }

      if (chartValue[filter] == null) {
        chartdata.push({
          date: formatDateTime(newDate),
          values: newValue.toFixed(2),
          odds: isNaN(parseFloat(obj[index][value])) ? 0.00 : parseFloat(obj[index][value]),
        });
        arrChangeval[filter].push(newDate.toLocaleString());

      } else if ($.inArray(newDate.toLocaleString(), arrChangeval[filter]) > -1) {
        changeValue = false;      
        continue;
      } else {
        arrChangeval[filter].push(newDate.toLocaleString());
        chartValue[filter].dataProvider.push({
          date: formatDateTime(newDate),
          values: newValue.toFixed(3),
          odds: isNaN(parseFloat(obj[index][value])) ? 0.00 : parseFloat(obj[index][value]),
        });
        chartValue[filter].validateData();

        for (let i in guideOdd) {
          if (i === 0)
            chartValue[filter].categoryAxis.addGuide(guideOdd[i]);
        }

        for (let i in guideScore) {
          if (i === 0)
            chartValue[filter].categoryAxis.addGuide(guideScore[i]);
        }

        chartValue[filter].validateNow();
      }
    }
  }
  // console.log(chartdata)
  if (changeValue) {
    return {lastPad:chartdata[ chartdata.length -2 ] ,  last: chartdata[ chartdata.length -1 ]};
  }


}
function formatDateTime(date) {
  const d = new Date(date);
  const year = `${d.getFullYear()}`;
  let month = `${(d.getMonth() + 1)}`;
  let day = `${d.getDate()}`;
  let hour = `${d.getHours()}`;
  let min = `${d.getMinutes()}`;
  let sec = `${d.getSeconds()}`;

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;
  if (hour.length < 2) hour = `0${hour}`;
  if (min.length < 2) min = `0${min}`;
  if (sec.length < 2) sec = `0${sec}`;

  const dayf = [year, month, day].join('-');
  const hourf = [hour, min, sec].join(':');

  return [dayf, hourf].join(' ');
}

function formatDate(date) {
  const d = new Date(date);
  const year = `${d.getFullYear()}`;
  let month = `${(d.getMonth() + 1)}`;
  let day = `${d.getDate()}`;

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [year, month, day].join('-');
}

function addGuideEach(type, date, value) {
  const guide = [];

  guide.date = formatDateTime(date);
  guide.label = `${type} : ${value}`;
  guide.inside = true;
  guide.lineAlpha = 5;
  guide.lineThickness = 1;
  guide.labelRotation = -90;
  guide.lineColor = '#CC0000';

  return guide;
}

function addGuideScoreEach(type, date, value) {
  const guide = [];
  guide.fontSize = 13;
  guide.date = formatDateTime(date);
  guide.label = `${value}`;
  guide.position = 'top';
  guide.inside = true;
  guide.lineAlpha = 5;
  guide.lineThickness = 1;
  guide.lineColor = '#00CC00';

  return guide;
}

//end section

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App is running at http://localhost:${port} in ${app.get('env')}`);
});

module.exports = app;
