var max_day = 455;
const angle_gap = 25;
const line_width = 2;
const line_gap = 0.8;
const inner_offset = 10;
const width = document.getElementById('graph').clientWidth;
const height = document.getElementById('graph').clientHeight;

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
  d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', '#3D3BFB')
}

function handleMouseOut(mouse_event, data) {
  d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', '#4BD302')
}

const center = Math.min(width/2, height/2)
const vis = d3.select('#graph')
.append('svg')
.attr('id', 'svg')
.attr("width", "100%")
.attr("height", "100%");

const g = vis.append("g").attr("transform", `translate(${width/2}, ${height/2})`)

$.getJSON("main.json", function(data) {
  console.log(data)
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].days.length; j++) {
      g.append("path")
        .attr("d", make_arc(i, data[i].days[j]))
        .attr("class", data[i].word)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
    }
  }
});
