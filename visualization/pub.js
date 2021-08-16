let loaded_data;

const angle_gap = 0;
const rotation_angle = 0*(Math.PI)/180;
const inner_offset = 25;

var line_width, line_gap;

const category = 'corona'

const width = document.getElementById('graph').clientWidth;
const height = document.getElementById('graph').clientHeight;
const center = Math.min(width/2, height/2)

var start_day = 0;
// needs to be extracted from meta-data
var end_day = 45;

function day_to_radians(day) {
  let result = angle_gap / 2 + (360 - angle_gap) * day / end_day; // relativ day in degrees with the angle_gap subtracted. Day 0 will be mapped to angle_gap/2 aka the start of the circle.
  return result * (Math.PI / 180); // converting to radians
}

function make_arc(id, days) {
  let innerRadius = inner_offset + (line_width + line_gap) * id;
  
  return d3.arc()
  .innerRadius(innerRadius)
  .outerRadius(innerRadius + line_width)
  .startAngle(day_to_radians(days[0]) + rotation_angle) //converting from degs to radians
  .endAngle(day_to_radians(days[1]) + rotation_angle)
}

function get_color(i, n) {
  //colors from color pallet
  let c1 = [209, 232, 226] // [0, 1/2)
  let c2 = [46, 156, 202] // 
  let c3 = [41, 100, 138] // [1/2, 1]

  let pos = i/n // intervall [0, 1]

  if(pos < 1/2) {
    pos *= 2
    return [Math.round((1-pos)*c1[0] + pos*c2[0]), Math.round((1-pos)*c1[1] + pos*c2[1]), Math.round((1-pos)*c1[2] + pos*c2[2])]
  } else {
    pos = (pos*2)-1
    return [Math.round((1-pos)*c2[0] + pos*c3[0]), Math.round((1-pos)*c2[1] + pos*c3[1]), Math.round((1-pos)*c2[2] + pos*c3[2])]
  }
}

function color_to_hex(c_arr) {
  return `#${c_arr[0].toString(16)}${c_arr[1].toString(16)}${c_arr[2].toString(16)}`
}

function handleMouseOver(mouse_event, data) {
  // #15DB95 accent color from pallet
  d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', '#15DB95')
  console.log(data)
  document.getElementById("word_lable").innerHTML = data.data.word
}

function handleMouseOut(mouse_event, data) {
  d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', data.color)
}

const vis = d3.select('#graph')
.append('svg')
.attr('id', 'svg')
.attr("width", "100%")
.attr("height", "100%");

const g = vis.append("g").attr("transform", `translate(${width/2}, ${height/2})`)

$.getJSON(`../data/${category}/main.json`, function(data) {

  loaded_data = data;

  // store length of data - equal to the number of different words
  n = 8 // hardcoded um Sachen zu testen :D max: 148 bzw data.length
  line_width = (center - inner_offset)*0.8/n
  line_gap = line_width*0.25
  skip_rings = Math.ceil(n/25) // number of rings where no dotted line should be drawn
  let j = 1; // Variable to ensure we get a maximum of 100 lines
  
  // dotted lines
  for (let i = start_day; i <= end_day; i++) {
    if(end_day/j < 100) {
      let angle = (((360-angle_gap) * (i-0.5)/end_day + angle_gap/2)*(Math.PI)/180)
      g.append("line")
        .attr("x1", Math.sin(angle)*(inner_offset+2.375*line_width+2*line_gap))     // x position of the first end of the line
        .attr("y1", -Math.cos(angle)*(inner_offset+2.375*line_width+2*line_gap))      // y position of the first end of the line
        .attr("x2", Math.sin(angle)*center)     // x position of the second end of the line
        .attr("y2", -Math.cos(angle)*center)
        .attr("stroke-dasharray", `${line_gap}, ${(line_width+line_gap)*skip_rings-line_gap}`)
        .attr("class", "graph_line");
      j = 1;
      g.append("text")
        .attr("x", Math.sin(angle)*center)
        .attr("y", -Math.cos(angle)*center)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .text("A")
    } else {
      j++;
    }
  }
  
  // circle bars
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < data[i].days.length; j++) {
      // to satisfy d3 syntax this has to be done
      let appendix = {'color': color_to_hex(get_color(i,n)), 'data': data[i]}
      g.append("path")
        .data([appendix])
        .attr("d", make_arc(i, data[i].days[j]))
        .attr("class", String(data[i].word)) //make sure no number gets set as class
        .attr("fill", appendix.color)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
    }
  }
});
