var clicked_word;
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
        d3.selectAll(`.${mouse_event.target.classList.value.split(' ')[1]}`).style('fill', '#ffb648')
    }
}

function handleMouseOut(mouse_event, data) {
    if (data.data.word != clicked_word) {
        d3.selectAll(`.${mouse_event.target.classList.value.split(' ')[1]}`).style('fill', data.color)
    }
}

function handleMouseClick(mouse_event, data) {

    document.getElementById('detail_words').style.visibility = 'visible'
    document.getElementById('detail_day').style.visibility = 'hidden'

    let word = data.data.word;

    if (word != clicked_word) {
        d3.selectAll(`.${clicked_word}`).style('fill', data.color)
        d3.selectAll(`.${word}`).style('fill', '#15DB95')
        clicked_word = word;
        document.getElementById("word_lable").innerHTML = word;

        document.getElementById("dt_first").innerHTML = get_date(data.data.days[0][0])
        document.getElementById("dt_last").innerHTML = get_date(data.data.days[data.data.days.length - 1][1] - 1)

        $.getJSON(`/data/${category}/words/${word}.json`, function (day_w) {

            let plot_data = [];
            // unpacking day array
            var days = [];

            let counter = 0
            for (let i = 0; i < data.data.days.length; i++) {
                plot_data.push({ "x": data.data.days[i][0] - 1, "y": 0 })
                for (let j = data.data.days[i][0]; j < data.data.days[i][1]; j++) {
                    plot_data.push({ "x": j, "y": day_w[counter] })
                    days.push(j)
                    counter++
                }
                plot_data.push({ "x": data.data.days[i][1], "y": 0 })
            }

            document.getElementById("dt_most").innerHTML = get_date(days[argmax(day_w)])

            update_plot(plot_data)
        })
    }
}

const wc_rect = (document.getElementById('day_word_cloud').getClientRects())[0]

function handleDateClick(mouse_event, data) {
    let day = data.day

    document.getElementById('detail_words').style.visibility = 'hidden'
    document.getElementById('detail_day').style.visibility = 'visible'

    document.getElementById('day_lable').innerHTML = get_date(day - 1)
    $.getJSON(`/data/${category}/days/${day}.json`, function (json_data) {

        var layout = cloud()
            .size([wc_rect.width, wc_rect.height])
            .words(json_data.words.map(function (d) {
                return { text: d, size: 24 * (0.5 + Math.random()) }
            }))
            .fontSize(function (d) { return d.size })
            .on("end", draw_cloud)
        layout.start()
    })
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

function draw_cloud(words) {

    document.getElementById('day_word_cloud').innerHTML = ''

    d3.select("#day_word_cloud").append("svg")
        .attr("width", wc_rect.width)
        .attr("height", wc_rect.height)
        .append("g")
        .attr("transform", `translate(${wc_rect.width / 2},${wc_rect.height / 2})`)
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function (d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", "steelblue")
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function (d) { return d.text; });
}