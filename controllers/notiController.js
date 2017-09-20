const moment = require('moment');
const ScoreNonLive = require('../models/scorenonliveModel');
const notinonlive = require('../models/notificationnonlive');
const extratime = 0;

 // const intervalObj = setInterval(() => { 
 //  duration_team()
 // }, 1000);

function duration_team() {

  	const date = moment();
  	const start = date.clone().hours(-5);
  	const time_now = date.clone().second(1).format("YYYY-MM-DD HH:mm:ss.SSS")
  	const end = date.clone().add(1, 'days').hours(21);
  	const leagues =  ScoreNonLive  	
     .find({'nonlive.timestamp' : {$gte: start ,$lt: end}, 'hdp.time' : {$gte: time_now}}).exec(function(err, leagues) {

     	if (leagues != null) {
     		leagues.forEach(function(data) {
	          const item = data
	          var flag_insert = true
	            if (item.hdp.length > 2) {
	            	i = item.hdp.length
	            	hdp_old   = item.hdp[i-1]
	                hdp_last  = item.hdp[i-2]
	                hdptype   = 'hdp';
	                queryhdp   = 'hdp.time';
					option.setHDP(item, hdp_old, hdp_last , hdptype, queryhdp ,flag_insert)
					flag_insert = false;
	          	}

	          	if (item.fhdp.length > 2) {
	            	i = item.fhdp.length
	            	hdp_old   = item.fhdp[i-1]
	                hdp_last  = item.fhdp[i-2]
	                hdptype   = 'fhdp';
	                queryhdp   = 'fhdp.time';
					option.setHDP(item, hdp_old, hdp_last , hdptype, queryhdp ,flag_insert)
					flag_insert = false;

	          	}
	          	if (item.goal.length > 2) {
	            	i = item.goal.length
	            	hdp_old   = item.goal[i-1]
	                hdp_last  = item.goal[i-2]
	                hdptype   = 'goal';
	                queryhdp   = 'goal.time';
					option.setHDP(item, hdp_old, hdp_last , hdptype, queryhdp ,flag_insert)
					flag_insert = false;

	          	}
	          	if (item.fgoal.length > 2) {
	            	i = item.fgoal.length
	            	hdp_old   = item.fgoal[i-1]
	                hdp_last  = item.fgoal[i-2]
	                hdptype   = 'fgoal';
	                queryhdp   = 'fgoal.time';
					option.setHDP(item, hdp_old, hdp_last , hdptype, queryhdp ,flag_insert)
					flag_insert = false;

	          	}
	        })
     	}
        // console.log('working : '+time_now)
    })
}

const option = {
    setHDP: (item , hdp_old, hdp_last , hdptype ,queryhdp,flag_insert)=>{    	
			notinonlive.find({team_id :item._id}).exec(function(err, team) {
			var Detail = '';
			if (team != null) {
				i = item[`${hdptype}`].length
	          odd  =  0
	          if (hdptype == 'hdp' || hdptype == 'fhdp') {
	          	 if (item.homeColor == "red" || item.homeColor == "blue"  && item.awayColor  == "blue") {
          	 		odd  = hdp_last.home - hdp_old.home
		            if ( hdp_old.home > 0 && hdp_last.home < 0 ) {
						odd  = parseFloat(1 - parseFloat(hdp_old.home)) + parseFloat(1 + parseFloat(hdp_last.home))
		           
		            }else if(hdp_old.home < 0 && hdp_last.home > 0 ){
						odd  =   parseFloat(parseFloat(hdp_last.home) - 1) - parseFloat( parseFloat(hdp_old.home) + 1 )
		            }
	                console.log( odd);	
		            Detail = 'home :'+hdp_old.home +' : '+ hdp_last.home

		          }else if(item.awayColor  == "red" ){
		            odd  = hdp_last.away - hdp_old.away 
		            if ( hdp_old.away > 0 && hdp_last.away < 0 ) {
						odd  = parseFloat(1 - parseFloat(hdp_old.away)) + parseFloat(1 + parseFloat(hdp_last.away))
		           
		            }else if(hdp_old.away < 0 && hdp_last.away > 0 ){
						odd  =   parseFloat(parseFloat(hdp_last.home) - 1) - parseFloat( parseFloat(hdp_old.home) + 1 )
		            }
	                console.log( odd);
		            Detail = 'away :'+hdp_old.away + ' : ' + hdp_last.away
		          }
	          }else{
					odd  =  hdp_last.over - hdp_old.over 
					if ( hdp_old.over > 0 && hdp_last.over < 0 ) {
						odd  = parseFloat(1 - parseFloat(hdp_old.over)) + parseFloat(1 + parseFloat(hdp_last.over))
		           
		            }else if(hdp_old.away < 0 && hdp_last.over > 0 ){
						odd  =   parseFloat(parseFloat(hdp_last.home) - 1) - parseFloat( parseFloat(hdp_old.home) + 1 )
					}
					Detail = 'over :'+hdp_old.over + ' : ' + hdp_last.over
	          }
	          if (team.length > 0) {
	               	const update1 	= {}
	                const query 	= {}
                	query['team_id'] 		= 	item._id 
                	query[`${queryhdp}`] 	=	{ $ne: hdp_last.time }
	               	update1['$addToSet'] = {}
	                update1['$addToSet'][`${hdptype}`] = { 
							                                duration : moment(moment(hdp_old.time) - moment(hdp_last.time)).second(),
							                                odd: (odd.toFixed( 2 ) > 0 ? '+'+ odd.toFixed( 2 ) : odd.toFixed( 2 )),
							                                score: hdp_last.score,
							                                time: hdp_last.time,
							                                odddetail : Detail,
							                                timestamps: moment(),
							                    		},
	                options = {};
	                notinonlive.findOneAndUpdate(query, update1, options, function (err, playlist) {
	                    if (playlist != null) {
	                         console.log('working: Update')
	                    }
	                });
	               console.log('working: up')
	          }else if(flag_insert == true && team.length ==  0){
				const obj = {}
	          	obj['${hdptype}']  = [{ 
				                          duration : moment(moment(hdp_old.time) - moment(hdp_last.time)).second(),
				                          odd: (odd.toFixed( 2 ) > 0 ? '+'+ odd.toFixed( 2 ) : odd.toFixed( 2 )),
				                          score: hdp_last.score,
				                          time: hdp_last.time,
				                          odddetail : Detail,
				                          timestamps: moment(),
				                     }];
	            const instance = new notinonlive({ 
		                    'team_id' : item._id,
		                    'league' :  item.league,
		                    'home'   :  item.home,
		                    'away'   :  item.away,
		                    'homeColor'   :  item.homeColor,
		                    'awayColor'   :  item.awayColor,
		                    'nonliveCreatedAt': item.nonliveCreatedAt,
		                     obj,
		                    'nonlive' : {'time':item.nonlive.time,'timestamp': moment(item.nonlive.timestamp) }
		                  })
	              instance.save()
	              console.log('working: New')
	          }
	     
			}
	    })   
    }
}

const getMatches = async (req, res) => {
  const league = req.params.id;
  // const date = moment(req.params.date);
  // const start = date.clone().hours(11);
  // const end = date.clone().add(1, 'days').hours(11);
  const matches = await notinonlive.findById(league)
  res.json(matches);
};

const getLeagues = async (req, res) => {
  const date = moment(req.params.date);
  const start = date.clone().hours(11);
  const end = date.clone().add(1, 'days').hours(11);
  const leagues = await ScoreNonLive
    .distinct('league')
    .where('nonlive.timestamp').gte(start).lt(end);

  res.json(leagues);
};

const getAllMatches = async (req, res) => {
  const date 	= moment(req.params.date);
  const start 	= date.clone().hours(11);
  console.log(start);
  const end 	= date.clone().add(1, 'days').hours(11);
  const matches = await ScoreNonLive
    .find({})
    .select('home away homeColor awayColor liveCreatedAt hdp fhdp goal fgoal nonlive')
    .where('nonlive.timestamp').gte(start).lt(end);
  res.json(matches);
};


const scoreController = {
	getMatches,
	getAllMatches,
  	find: () => notinonlive.find({}),
  	findLeagueDistinct: () => notinonlive.distinct('league'),
  	findTeamDistinct: () => notinonlive.find({}).select('home away homeColor awayColor nonliveCreatedAt hdp'),
};

module.exports = scoreController;