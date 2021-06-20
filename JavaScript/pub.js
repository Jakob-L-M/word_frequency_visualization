var testData = [
    {class: "pA", label: "person a", times: [
      {"starting_time": 1355752800000, "ending_time": 1355759900000},
      {"starting_time": 1355767900000, "ending_time": 1355874400000}]},
    {class: "pB", label: "person b", times: [
      {"starting_time": 1355759910000, "ending_time": 1355761900000}]},
    {class: "pC", label: "person c", times: [
      {"starting_time": 1355761910000, "ending_time": 1355763910000}]}
    ];

var chart = timelines().stack();

var svg = d3.select("#graph").append("svg").attr("width", 500)
    .datum(testData).call(chart);