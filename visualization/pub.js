let loaded_data;

const angle_gap = 5;
const rotation_angle = 0 * (Math.PI) / 180;
const inner_offset = 25;

var line_width, line_gap, skip_rings;

const category = 'corona'

const transition_time = 1000;

const width = document.getElementById('graph').clientWidth;
const height = document.getElementById('graph').clientHeight;

// scaling by .85 to leave space for labeling
const center = Math.min(width / 2, height / 2) * 0.85

// is set by meta-data
var max_day = 458;
const start_date = '2020-01-07'; // YYYY-MM-DD

var start_day = 0;
var end_day = max_day;
const start_timestamp = Date.parse(start_date)

var total_days = end_day - start_day

function day_to_radians(day) {
  let result = angle_gap / 2 + (360 - angle_gap) * day / total_days; // relativ day in degrees with the angle_gap subtracted. Day 0 will be mapped to angle_gap/2 aka the start of the circle.
  return result * (Math.PI / 180); // converting to radians
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
  .attr('width', '100%')
  .attr('height', '100%');

const dates = vis.append('g').attr('id', 'dates');
const lines = vis.append('g').attr('id', 'lines');
const arcs = vis.append('g').attr('id', 'arcs');

// var g = vis.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);


// main creation
$.getJSON(`/data/${category}/main.json`, function (data) {

  loaded_data = data;

  update_graph(0, max_day);

  create_slider(start_date, max_day);
});

function create_slider(start_date, max_day) {
  $('#slider').slider({
    min: 0,
    max: max_day,
    range: true,
    value: 0,
    tooltip: 'hidden',
    tooltip_split: true,
  }).on('slideStop', callback)

  function callback(d) {
    if (d.value[0] != d.value[1]) {
      update_graph(d.value[0], d.value[1])
    }
  }
}

function update_graph(start, end) {

  let data = loaded_data;

  // update global variables
  start_day = start
  end_day = end
  total_days = end_day - start_day

  let arc_data = [];
  var empty_arcs = 0;
  for (let i = 0; i < data.length; i++) {

    var changed = false

    for (let j = 0; j < data[i].d.length; j++) {

      //check if there is any overlap
      if (data[i].d[j][1] <= start_day || data[i].d[j][0] >= end_day) {
        continue
      }
      changed = true

      // preparing date for arc creation
      arc_data.push({
        'id': (i - empty_arcs) * data.length + j,
        'ind': i - empty_arcs,
        'word': data[i].w,
        'days': data[i].d,
        'start': Math.max(data[i].d[j][0], start_day),
        'end': Math.min(data[i].d[j][1], end_day)
      })
    }
    if (!changed) {
      empty_arcs++
    } else {
    }
  }

  //equal to the number of different words in given time intervall
  var n = data.length - empty_arcs

  //update of global variables used to generate arcs, lines and dates
  line_width = ((center - inner_offset)*0.8) / n
  line_gap = line_width * 0.25
  skip_rings = Math.floor(n / 25) // number of rings where no dotted line should be drawn

  let j = 1; // Variable to ensure we get a maximum of 100 lines

  // dotted lines
  var lable_data = [];

  for (let i = 0; i < total_days; i++) {
    if (total_days / j < 100) {

      let angle = day_to_radians(i + 0.5) //prob -0.5

      let outer_x = Math.sin(angle) * center;
      let outer_y = -Math.cos(angle) * center;

      lable_data.push({ 'date': start_day + i, 'angle': angle, 'o_x': outer_x, 'o_y': outer_y })

      j = 1;
    } else {
      j++;
    }
  }

  update_lines();

  update_dates();

  update_arcs();

  // circle bars
  function update_arcs() {
    let u = arcs.selectAll('.graph_arc')
      .data(arc_data, function (d) { return d.id })

    let total_arcs = arc_data[arc_data.length - 1].ind + 1

    u.enter()
      .append('path')
      .attr('class', function (d) { return `graph_arc ${d.word}` })
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('click', handleMouseClick)
      .attr('transform', `translate(${width / 2}, ${height / 2})`)
      .merge(u)
      .transition()
      .duration(transition_time)
      .attr('d', d3.arc()
        .innerRadius((d) => inner_offset + (line_width + line_gap) * d.ind)
        .outerRadius((d) => inner_offset + (line_width + line_gap) * d.ind + line_width)
        .startAngle((d) => day_to_radians(d.start - start_day) + rotation_angle)
        .endAngle((d) => day_to_radians(d.end - start_day) + rotation_angle))
      .attr('fill', (d) => color_to_hex(get_color(d.ind, total_arcs)))

    u.exit().remove()
  }

  function update_lines() {
    let u = lines.selectAll('.graph_line')
      .data(lable_data, function (d) { return d.day; });

    u.enter()
      .append('line')
      .attr('class', 'graph_line')
      .attr('id', function (d) { return d.day; })
      .attr('transform', function (d) { return `translate(${width / 2}, ${height / 2})`; })
      .merge(u)
      .transition()
      .duration(transition_time)
      .attr('x1', function (d) { return Math.sin(d.angle) * (inner_offset + 0.5 * (line_width - line_gap)); }) // x position of the inner end of the line
      .attr('y1', function (d) { return -Math.cos(d.angle) * (inner_offset + 0.5 * (line_width - line_gap)); }) // y position of the inner end of the line
      .attr('x2', function (d) { return d.o_x }) // x position of the outer end of the line
      .attr('y2', function (d) { return d.o_y }) // y position of the outer end of the line
      .attr('stroke-dasharray', `${line_gap}, ${(line_width + line_gap) * skip_rings + line_width}`);

    u.exit().remove()
  }

  function update_dates() {
    let u = dates.selectAll('.graph_date')
      .data(lable_data, function (d) { return d.day; });

    u.enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('class', 'graph_date')
      .attr('id', function (d) { return d.date; })
      .attr('transform', function (d) { return `translate(${width / 2}, ${height / 2})rotate(${270 + d.angle * 180 / Math.PI})`; })
      .on('click', handleDateClick)
      .attr('dominant-baseline', 'central')
      .merge(u)
      .transition()
      .duration(transition_time)
      .text(function (d) { return `${get_date(d.day)}`; })
      .attr('transform', function (d) { return `translate(${d.o_x * 1.07 + width / 2},${d.o_y * 1.07 + height / 2})rotate(${270 + d.angle * 180 / Math.PI})`; })
      .style('font-size', `${center / 25}`);

    u.exit().remove()
  }

}
