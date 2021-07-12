const angle_gap = 25;
const inner_offset = 15;

var line_width, line_gap;

const width = document.getElementById('graph').clientWidth;
const height = document.getElementById('graph').clientHeight;
const center = Math.min(width/2, height/2)

// needs to be extracted from meta-data
var max_day = 455;

function day_to_radians(day) {
  let result = angle_gap / 2 + (360 - angle_gap) * day / max_day; // relativ day in degrees with the angle_gap subtracted. Day 0 will be mapped to angle_gap/2 aka the start of the circle.
  return result * (Math.PI / 180); // converting to radians
}

function make_arc(id, days) {
  let innerRadius = inner_offset + (line_width + line_gap) * id;
  
  return d3.arc()
  .innerRadius(innerRadius)
  .outerRadius(innerRadius + line_width)
  .startAngle(day_to_radians(days[0])) //converting from degs to radians
  .endAngle(day_to_radians(days[1]))
}


function handleMouseOver(mouse_event, data) {
  console.log(data)
  d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', '#3D3BFB')
}

function handleMouseOut(mouse_event, data) {
  d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', '#4BD302')
}

const vis = d3.select('#graph')
.append('svg')
.attr('id', 'svg')
.attr("width", "100%")
.attr("height", "100%");

const g = vis.append("g").attr("transform", `translate(${width/2}, ${height/2})`)

$.getJSON("../data/main.json", function(data) {
  console.log(data)
  // store length of data - equal to the number of different words
  n = 50 // 50 um Sachen zu testen :D
  line_width = (center - inner_offset)*0.8/n
  line_gap = line_width*0.25
  console.log(d3.select('#graph').select('svg').select('g'))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < data[i].days.length; j++) {
      // to satisfy d3 syntax this has to be done
      let appendix = [i, data[i]]
      g.append("path")
        .data([appendix])
        .attr("d", make_arc(i, data[i].days[j]))
        .attr("class", String(data[i].word)) //make sure no number gets set as class
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
    }
  }
});
