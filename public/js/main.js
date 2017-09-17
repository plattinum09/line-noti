/* eslint-disable */
const chartValue = [];
const arrChangeval = [];
const timeouts = [];
const defaultValue = [];
let guideScore = {};
let typeView = "";

function callAmchart(nameChart, data) {
  const genChart = new AmCharts.makeChart(nameChart, {
    type: 'serial',
    theme: 'light',
    marginRight: 80,
    autoMarginOffset: 20,
    marginTop: 7,
    dataProvider: data,
    valueAxes: [{
      axisAlpha: 0.2,
      dashLength: 1,
      position: 'left',
      minimum: -1,
      maximum: 1,
      strictMinMax: true,
    }],
    mouseWheelZoomEnabled: true,
    graphs: [{
      id: 'g1',
      balloonText: '[[odds]] : [[value]]',
      title: 'red line',
      valueField: 'values',
      lineColor: '#0352b5',
      negativeLineColor: '#b5030d',
      balloon: {
        drop: false,
      } },
    ],
    chartScrollbar: {
      autoGridCount: true,
      color: '#FFFFFF',
      scrollbarHeight: 20,
    },
    chartCursor: {
      limitToGraph: 'g1',
      cursorPosition: 'mouse',
      pan: true,
      categoryBalloonFunction: function(date) {
        return formatDateTime(date);
      },
    },
    categoryField: 'date',
    categoryAxis: {
      minPeriod: 'ss',
      parseDates: true,
      axisColor: '#DADADA',
      dashLength: 1,
      minorGridEnabled: true,
    },
    export: {
      enabled: false,
    },
  });

  return genChart;
}

// start helper function -----------------------------------

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
  const guide = new AmCharts.Guide();

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
  const guide = new AmCharts.Guide();
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

// end helper function -----------------------------------

$('#select-live').click(() => {
  selectView('live');
});

$('#select-nonlive').click(() => {
  selectView('nonlive');
});

function selectDetailMatch(id, view) {
  const setTime = (view == 'live') ? 1000 : 3000;
  timeouts.forEach(clearInterval);
  chartValue.hdp = null;
  chartValue.fhdp = null;
  chartValue.goal = null;
  chartValue.fgoal = null;
  arrChangeval.hdp = [];
  arrChangeval.fhdp = [];
  arrChangeval.goal = [];
  arrChangeval.fgoal = [];
  defaultValue.hdp = [];
  defaultValue.fhdp = [];
  defaultValue.goal = [];
  defaultValue.fgoal = [];
  guideScore = {};
  setElementMatch(id)
  getDetailMatch(id,view);
  timeouts.push(setInterval(function () {
    getDetailMatch(id, view)
  }, setTime));
}

function setElementMatch(id) {
  let $elementMatch = '';
  const $element = $(`#${id}`)
  $('[id*=container-grap]').remove()
  $elementMatch += `<div class="page-header" id="container-grap">`;
  $elementMatch += `<h5 id="title-team-fthdp"></h5>`;
  $elementMatch += `<div class="grap-style" id="chartContainerHDP"></div>`;
  $elementMatch += `<h5 id="title-team-hthdp"></h5>`;
  $elementMatch += `<div class="grap-style" id="chartContainerFHDP"></div>`;
  $elementMatch += `<h5 id="title-team-ftgoal"></h5>`;
  $elementMatch += `<div class="grap-style" id="chartContainerGOAL"></div>`;
  $elementMatch += `<h5 id="title-team-htgoal"></h5>`;
  $elementMatch += `<div class="grap-style" id="chartContainerFGOAL"></div>`;
  $elementMatch += `</div>`;
  $element.html($elementMatch);
}

function getDetailMatch(id, view){
  $.get(`/matches/${id}/detail`)
  .done(function (data) {
    let valueGraph = '';
    let timePlay = '';
    const awayColor = data.awayColor;
    const homeColor = data.homeColor;
    const thisTeam = `<span style="color:${homeColor}">${data.home}</span>  -vs- <span style="color:${awayColor}">${data.away}</span>`;

    if (awayColor === 'blue' && homeColor === 'blue') {
      valueGraph = 'home';
    } else if (awayColor === 'red') {
      valueGraph = 'away';
    } else if (homeColor === 'red') {
      valueGraph = 'home';
    }

    if (data.live) {
      timePlay = data.live.time;
    } else if (data.nonlive) {
      timePlay = data.nonlive.time;
    }

    if (data.hdp.length > 0) {
      $('#title-team-fthdp').html(`<span class="pull-right">FT-HDP ( ${timePlay} )</span>`);
      geneGraphEach(data.hdp, 'hdp', 'FT-HDP', valueGraph, 'chartContainerHDP');
    } else {
      $('#chartContainerHDP').hide();
      $('#chartContainerHDP').empty();
      $('#title-team-fthdp').empty();
    }

    if (data.fhdp.length > 0) {
      $('#title-team-hthdp').html(`<span class="pull-right">HT-HDP ( ${timePlay} )</span>`);
      geneGraphEach(data.fhdp, 'fhdp', 'HT-HDP', valueGraph, 'chartContainerFHDP');
    } else {
      $('#chartContainerFHDP').hide();
      $('#chartContainerFHDP').empty();
      $('#title-team-hthdp').empty();
    }

    if (data.goal.length > 0) {
      $('#title-team-ftgoal').html(`<span class="pull-right">FT-GOAL ( ${timePlay} )</span>`);
      geneGraphEach(data.goal, 'goal', 'FT-GOAL', 'over', 'chartContainerGOAL');
    } else {
      $('#chartContainerGOAL').hide();
      $('#chartContainerGOAL').empty();
      $('#title-team-ftgoal').empty();
    }

    if (data.fgoal.length > 0) {
      $('#title-team-htgoal').html(`<span class="pull-right">HT-GOAL ( ${timePlay} )</span>`);
      geneGraphEach(data.fgoal, 'fgoal', 'HT-GOAL', 'over', 'chartContainerFGOAL');
    } else {
      $('#chartContainerFGOAL').hide();
      $('#chartContainerFGOAL').empty();
      $('#title-team-htgoal').empty();
    }
  });
}

function geneGraphEach(data, filter, type, value, containername) {
  const chartdata = [];
  const obj = data;
  const guideOdd = {};
  let changeValue = true;
  let newValueOddChange = 0;
  let newValue = 0;
  let countReplaceHDP = 0;

  for (let index in obj) {
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
        values: newValue.toFixed(3),
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

  if (changeValue) {
    $(`#${containername}`).show();
    $(`#${containername}`).empty();
    chartValue[filter] = callAmchart(containername, chartdata);

    for (let i in guideOdd) {
      chartValue[filter].categoryAxis.addGuide(guideOdd[i]);
    }

    for (let i in guideScore) {
      chartValue[filter].categoryAxis.addGuide(guideScore[i]);
    }

    chartValue[filter].validateNow();
  }
}

// search match -------------------------------------------

$( '#search-team' ).keypress(function(e) {
  const $searchElement = $('#search-team');
  const $matchesElement = $('#matches');
  const text = $searchElement.val();
  const code = e.keyCode || e.which;
  const defferredFunctions = [];

  $matchesElement.empty();

  if (code === 13) {

    defferredFunctions.push($.get('/api/scores/nonlive/search/match',
      { value: text },
    ));

    defferredFunctions.push($.get('/api/scores/live/search/match',
      { value: text },
    ));

    for (const i in defferredFunctions) {
      defferredFunctions[i].done(function(data) {
        const matches = data.match;
        let $newMatchElement = '';

        for (const index in matches) {
          const hmColor = [];
          const view = typeof matches[index].liveCreatedAt !== 'undefined' ? 'live' : 'nonlive';
          const liveColor = typeof matches[index].liveCreatedAt !== 'undefined' ? '#eab1a3' : '#afecf3';
          const time = typeof matches[index].liveCreatedAt !== 'undefined' ? matches[index].liveCreatedAt : matches[index].nonliveCreatedAt;
          hmColor.home = matches[index].homeColor;
          hmColor.away = matches[index].awayColor;

          $newMatchElement += `<tr>`;
          $newMatchElement += `<td class="accordion-toggle" data-toggle="collapse" data-target="#${matches[index]._id}" onclick="selectDetailMatch('${matches[index]._id}', '${view}')"></td>`;
          $newMatchElement += `<td><i class="fa fa-lock fa-2x" aria-hidden="true"></i></td>`;
          $newMatchElement += `<td><span style="color:${hmColor.home}">${matches[index].home}</span> -vs- <span style="color:${hmColor.away}">${matches[index].away}</span><i class="glyphicon glyphicon-signal pull-right" aria-hidden="true"></i></td>`;
          $newMatchElement += `<td>1.5-2 +7</td>`;
          $newMatchElement += `<td>3.3.5 -6</td>`;
          $newMatchElement += `<td>1.5-2 +3</td>`;
          $newMatchElement += `<td>1-1.5 -5</td>`;
          $newMatchElement += `<td>1 - 1 </td>`;
          $newMatchElement += `<td>1H 34'</td>`;
          $newMatchElement += `</tr>`;
          $newMatchElement += `<tr>`;
          $newMatchElement += `<td class="hiddenRow" colspan="12">`;
          $newMatchElement += `<div class="accordian-body collapse" id="${matches[index]._id}">${matches[index]._id}</div>`;
          $newMatchElement += `</td>`;
          $newMatchElement += `</tr>`;
        }
        $matchesElement.append($newMatchElement);
      });
    }
  }
});
