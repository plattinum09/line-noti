const mongoose = require('mongoose');

const notiSchema = mongoose.Schema(
  {
    league: String,
    team_id: String,
    count_hdp: Number,
    count_price: Number,
    home: String,
    away: String,
    homeColor: String,
    awayColor: String,
    nonliveCreatedAt: Date,
    notihdp: [
      {
        time: String,
        time_change: String,
        odd: String,
        hdp: String,
        round: String,
        value:String
      },
    ],
    hdp: [
      {
        time: String,
        score: String,
        odd: String,
        duration: String,
        odddetail: String,
        timestamps: Date,
      },
    ],
    fhdp: [
      {
        time: String,
        score: String,
        odd: String,
        duration: String,
        odddetail: String,
        timestamps: Date,
      },
    ],
    goal: [
      {
        time: String,
        score: String,
        odd: String,
        duration: String,
        odddetail: String,
        timestamps: Date,
      },
    ],
    fgoal: [
      {
        time: String,
        score: String,
        odd: String,
        duration: String,
        odddetail: String,
        timestamps: Date,
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

const notinonlive = mongoose.model('notinonlive', notiSchema);

module.exports = notinonlive;
