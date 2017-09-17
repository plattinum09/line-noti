const moment = require('moment');
const ScoreNonLive = require('../models/scorenonliveModel');

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

const matcheDetail = async (req, res) => {
  const matchesDetailResp = await ScoreNonLive.findOne(
    { _id: req.params.id },
  );
  res.json(matchesDetailResp);
};

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
