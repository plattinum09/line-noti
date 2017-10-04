const express = require('express');
const router = express.Router();
const ScoreLiveController = require('../controllers/scoreliveController');
const ScoreNonLiveController = require('../controllers/scorenonLiveController');
const notiController = require('../controllers/notiController');

/* GET home page. */
router.get('/', function(req, res, next) {
	notiController.findTeamDistinct({}).then((result) => {
    	res.render('index.ejs', { match:result });
  	});
});

// router.post('/matchesDetail/:date/:view', notiController.getAllMatches);
// router.post('/matches/:id', notiController.getMatches);
// router.get('/matches/:id/detail', ScoreNonLiveController.matcheDetail);

module.exports = router;
