const mongoose = require('mongoose');

const ScoreSchema = mongoose.Schema(
  {
    league: String,
    home: String,
    away: String,
    homeColor: String,
    awayColor: String,
    nonliveCreatedAt: Date,
    hdp: [
      {
        time: String,
        hdp: String,
        home: String,
        away: String,
        status: String,
        homeRed: String,
        awayRed: String,
        score: String,
        minute: String,
      },
    ],
    fhdp: [
      {
        time: String,
        fhdp: String,
        home: String,
        away: String,
        status: String,
        homeRed: String,
        awayRed: String,
        score: String,
        minute: String,
      },
    ],
    goal: [
      {
        time: String,
        goal: String,
        over: String,
        under: String,
        status: String,
        homeRed: String,
        awayRed: String,
        score: String,
        minute: String,
      },
    ],
    fgoal: [
      {
        time: String,
        fgoal: String,
        over: String,
        under: String,
        status: String,
        homeRed: String,
        awayRed: String,
        score: String,
        minute: String,
      },
    ],
    nonlive: {
      timestamp: Date,
      time: String,
    },
  },
  {
    timestamps: true,
  },
);

const Score = mongoose.model('Scorenonlive', ScoreSchema);

module.exports = Score;
