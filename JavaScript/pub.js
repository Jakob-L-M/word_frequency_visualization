const max_day = 25;
const angle_gap = 45;
const line_width = 55;
const line_gap = 5;
const inner_offset = 10;
const width = document.getElementById('graph').clientWidth;
const height = document.getElementById('graph').clientWidth;

var data = [
  {
    word: "Hallo",
    id: 0,
    "start_day": 4,
    "end_day": 6
  },
  {
    word: "Hallo",
    id: 0,
    "start_day": 20,
    "end_day": 25
  },
  {
    word: "Hallo",
    id: 0,
    "start_day": 8,
    "end_day": 10
  },
  {
    word: "Test",
    id: 1,
    "start_day": 10,
    "end_day": 15
  },
  {
    word: "Hi",
    id: 2,
    "start_day": 17,
    "end_day": 21
  },
  {
    word: "Hi",
    id: 2,
    "start_day": 22,
    "end_day": 25
  },
  {
    word: "Test",
    id: 1,
    "start_day": 1,
    "end_day": 9
  },
  {
    word: "Hi",
    id: 2,
    "start_day": 0,
    "end_day": 7,
  }
];

function day_to_radians(day) {
  let result = angle_gap / 2 + (360 - angle_gap) * day / max_day; // relativ day in degrees with the angle_gap subtracted. Day 0 will be mapped to angle_gap/2 aka the start of the circle.
  return result * (Math.PI / 180); // converting to radians
}

function make_arc(word_data) {
  let innerRadius = inner_offset + (line_width+line_gap) * word_data.id;

  return d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + line_width)
    .startAngle(day_to_radians(word_data.start_day)) //converting from degs to radians
    .endAngle(day_to_radians(word_data.end_day))
}

function handleMouseOver(mouse_event, data) {
  console.log(mouse_event.target.classList.value)
  d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', '#3D3BFB')
}

function handleMouseOut(mouse_event, data) {
  d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', '#4BD302')
}

const center = Math.min(width, height)
const vis = d3.select('#graph')
  .append('svg')
  .attr('id', 'svg')
  .attr("width", center)
  .attr("height", center);

const g = vis.append("g").attr("transform", `translate(${center/2}, ${center/2})`)

for (let i = 0; i < data.length; i++) {
  g.append("path")
    .attr("d", make_arc(data[i]))
    .attr("class", data[i].word)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
}

