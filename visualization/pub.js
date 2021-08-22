let loaded_data;

const angle_gap = 5;
const rotation_angle = 0 * (Math.PI) / 180;
const inner_offset = 25;

var line_width, line_gap;

const category = 'corona'

const width = document.getElementById('graph').clientWidth;
const height = document.getElementById('graph').clientHeight;

// scaling by .85 to leave space for labeling
const center = Math.min(width / 2, height / 2) * 0.9

// needs to be extracted from meta-data
var max_day = 456;
const start_date = "2020-01-09"; // YYYY-MM-DD

var start_day = parseInt(document.getElementById('start_day').innerHTML);
var end_day = parseInt(document.getElementById('end_day').innerHTML);
const start_timestamp = Date.parse(start_date)

var total_days = end_day - start_day

function day_to_radians(day) {
  let result = angle_gap / 2 + (360 - angle_gap) * day / total_days; // relativ day in degrees with the angle_gap subtracted. Day 0 will be mapped to angle_gap/2 aka the start of the circle.
  return result * (Math.PI / 180); // converting to radians
}

function make_arc(id, days) {

  // if days end before the interval or begin after the intervall
  if (days[1] <= start_day || days[0] >= end_day) {
    return null
  }

  let innerRadius = inner_offset + (line_width + line_gap) * id;

  let arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + line_width)

  if (start_day < days[0]) {
    arc.startAngle(day_to_radians(days[0] - start_day) + rotation_angle)
  } else {
    arc.startAngle(day_to_radians(0) + rotation_angle)
  }

  if (end_day > days[1]) {
    arc.endAngle(day_to_radians(days[1] - start_day) + rotation_angle)
  } else {
    arc.endAngle(day_to_radians(total_days) + rotation_angle)
  }

  return arc
}

function get_color(i, n) {
  //colors from color pallet
  let c1 = [209, 232, 226] // [0, 1/2)
  let c2 = [46, 156, 202] // 
  let c3 = [41, 100, 138] // [1/2, 1]

  let pos = i / n // intervall [0, 1]

  if (pos < 1 / 2) {
    pos *= 2
    return [Math.round((1 - pos) * c1[0] + pos * c2[0]), Math.round((1 - pos) * c1[1] + pos * c2[1]), Math.round((1 - pos) * c1[2] + pos * c2[2])]
  } else {
    pos = (pos * 2) - 1
    return [Math.round((1 - pos) * c2[0] + pos * c3[0]), Math.round((1 - pos) * c2[1] + pos * c3[1]), Math.round((1 - pos) * c2[2] + pos * c3[2])]
  }
}

function get_date(i) {
  let date_str = new Date(i * 86400000 + start_timestamp).toDateString()
  return date_str.substr(8, 2) + date_str.substr(3, 4) + date_str.substr(10, 5)
}

function color_to_hex(c_arr) {
  return `#${c_arr[0].toString(16)}${c_arr[1].toString(16)}${c_arr[2].toString(16)}`
}

const vis = d3.select('#graph')
  .append('svg')
  .attr('id', 'svg')
  .attr("width", "100%")
  .attr("height", "100%");

var g = vis.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);


// main creation
$.getJSON(`../data/${category}/main.json`, function (data) {

  loaded_data = data;

  update_graph(data);
});

function update_graph(data) {

  start_day = parseInt(document.getElementById('start_day').value);
  end_day = parseInt(document.getElementById('end_day').value);
  total_days = end_day - start_day

  // store length of data - equal to the number of different words
  n = 25 // hardcoded um Sachen zu testen :D max: 148 bzw data.length
  line_width = (center - 2 * inner_offset) * 0.8 / n
  line_gap = line_width * 0.25
  skip_rings = Math.ceil(n / 25) // number of rings where no dotted line should be drawn

  let j = 1; // Variable to ensure we get a maximum of 100 lines

  // dotted lines
  var lable_data = []
  let current_days = [];

  for (let i = 1; i <= total_days; i++) {
    if (total_days / j < 100) {

      let angle = (((360 - angle_gap) * (i - 0.5) / total_days + angle_gap / 2) * (Math.PI) / 180)

      let outer_x = Math.sin(angle) * center;
      let outer_y = -Math.cos(angle) * center;

      current_days.push(start_day + i)
      lable_data.push({ 'day': start_day + i, 'angle': angle, 'o_x': outer_x, 'o_y': outer_y })

      j = 1;
    } else {
      j++;
    }
  }

  let past_days = $('.graph_date').map(function () {
    return parseInt($(this).attr('id'));
  });
  for (let i = 0; i < past_days.length; i++) {
    if (current_days.indexOf(past_days[i]) == -1) {
      $(` .${past_days[i]} `).remove();
    }
  }

  update_lines();

  update_dates();

  // circle bars
  var empty_arcs = 0;
  for (let i = 0; i < n; i++) {

    var changed = false

    for (let j = 0; j < data[i].days.length; j++) {

      let arc = make_arc(i - empty_arcs, data[i].days[j])
      if (arc == null) {
        continue
      }
      changed = true

      // to satisfy d3 syntax this has to be done
      let appendix = { 'color': color_to_hex(get_color(i, n)), 'data': data[i] }


      g.append("path")
        .data([appendix])
        .attr("d", arc)
        .attr("class", String(data[i].word)) //make sure no number gets set as class
        .attr("fill", appendix.color)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleMouseClick)
    }
    if (!changed) {
      empty_arcs++
    }
  }


  function update_lines() {
    let u = vis.selectAll('.graph_line')
      .data(lable_data, function (d) { return d.day; });

    u.enter()
      .append("line")
      .attr("class", function (d) { return `graph_line ${d.day}`; })
      .attr("id", function (d) { return d.day; })
      .attr("transform", function (d) { return `translate(${width / 2}, ${height / 2})`; })
      .merge(u)
      .transition()
      .duration(1000)
      .attr("x1", function (d) { return Math.sin(d.angle) * (inner_offset + 0.5 * (line_width - line_gap)); }) // x position of the first end of the line
      .attr("y1", function (d) { return -Math.cos(d.angle) * (inner_offset + 0.5 * (line_width - line_gap)); }) // y position of the first end of the line
      .attr("x2", function (d) { return d.o_x * 0.92; }) // x position of the second end of the line
      .attr("y2", function (d) { return d.o_y * 0.92; })
      .attr("stroke-dasharray", `${line_gap}, ${(line_width + line_gap) * skip_rings - line_gap}`);
  }

  function update_dates() {
    let u = vis.selectAll('.graph_date')
      .data(lable_data, function (d) { return d.day; });

    u.enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("class", function (d) { return `graph_date ${d.day}`; })
      .attr("id", function (d) { return d.day; })
      .attr("transform", function (d) { return `translate(${width / 2}, ${height / 2})rotate(${270 + d.angle * 180 / Math.PI})`; })
      .merge(u)
      .transition()
      .duration(1000)
      .text(function (d) { return `${get_date(d.day - 1)}`; })
      .attr("dominant-baseline", "central")
      .attr("transform", function (d) { return `translate(${d.o_x * 1.02 + width / 2},${d.o_y * 1.02 + height / 2})rotate(${270 + d.angle * 180 / Math.PI})`; })
      .style("font-size", `${center / 25}`);
  }

}
