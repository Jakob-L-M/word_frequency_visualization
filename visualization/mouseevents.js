var clicked_word;
var first_click = true;
var margin = { top: 10, right: 30, bottom: 30, left: 50 }
const plot_width = document.getElementById('w_plot').clientWidth - margin.left - margin.right,
    plot_height = document.getElementById('w_plot').clientHeight - margin.top - margin.bottom

var plot = d3.selectAll('#w_plot')
    .append('svg')
    .attr('width', plot_width + margin.left + margin.right)
    .attr('height', plot_height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

var x = d3.scaleLinear().range([0, plot_width + 20]);
var xAxis = d3.axisBottom().scale(x);
plot.append("g")
    .attr("transform", `translate(0,${plot_height})`)
    .attr("class", "x_axis")

var y = d3.scaleLinear().range([plot_height, 0]);
var yAxis = d3.axisLeft().scale(y);
plot.append("g")
    .attr("class", "y_axis")


function handleMouseOver(mouse_event, data) {
    // #15DB95 accent color from pallet
    if (data.data.word != clicked_word) {
        d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', '#ffb648')
    }
}

function handleMouseOut(mouse_event, data) {
    if (data.data.word != clicked_word) {
        d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', data.color)
    }
}

function handleMouseClick(mouse_event, data) {

    if (first_click) {
        init_view();
        first_click = false;
    }

    let word = data.data.word;

    if (word != clicked_word) {
        d3.selectAll(`.${clicked_word}`).style('fill', data.color)
        d3.selectAll(`.${word}`).style('fill', '#15DB95')
        clicked_word = word;
        document.getElementById("word_lable").innerHTML = word;

        document.getElementById("dt_first").innerHTML = get_date(data.data.days[0][0])
        document.getElementById("dt_last").innerHTML = get_date(data.data.days[data.data.days.length - 1][1] - 1)

        $.getJSON(`../data/${category}/words/${word}.json`, function (day_w) {

            // unpacking day array
            var days = [];
            for (let i = 0; i < data.data.days.length; i++) {
                for (let j = data.data.days[i][0]; j < data.data.days[i][1]; j++)
                    days.push(j)
            }

            document.getElementById("dt_most").innerHTML = get_date(days[argmax(day_w)])

            let plot_data = [];
            for (let i = days[0]; i < days[days.length - 1]; i++) {

                let ind = days.indexOf(i);

                if (ind != -1) {
                    plot_data.push({ "x": days[ind], "y": day_w[ind] })
                } else {
                    plot_data.push({ "x": i, "y": 0 })
                }

            }

            update_plot(plot_data)
        })
    }
}

function init_view() {
    document.getElementById('appearance').style.visibility = 'visible'
}

function update_plot(data) {
    // Create the X axis:
    x.domain([data[0].x, d3.max(data, function (d) { return d.x })]);
    plot.selectAll(".x_axis").transition()
        .duration(1000)
        .call(xAxis);

    // create the Y axis
    y.domain([0, d3.max(data, function (d) { return d.y })]);
    plot.selectAll(".y_axis")
        .transition()
        .duration(1000)
        .call(yAxis);

    // Create a update selection: bind to the new data
    var u = plot.selectAll(".line")
        .data([data], function (d) { return d.x });

    // Update the line
    u
        .enter()
        .append("path")
        .attr("class", "line")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .x(function (d) { return x(d.x); })
            .y(function (d) { return y(d.y); }))
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2.5)
}