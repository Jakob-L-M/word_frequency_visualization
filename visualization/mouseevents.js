const wc_rect = (document.getElementById('day_word_cloud').getClientRects())[0]
var clicked_word;
var clicked_day;
var margin = { top: 10, right: 30, bottom: 30, left: 50 }
const plot_width = document.getElementById('w_plot').clientWidth - margin.left - margin.right,
    plot_height = document.getElementById('w_plot').clientHeight - margin.top - margin.bottom

var plot = d3.selectAll('#w_plot')
    .append('svg')
    .attr('width', plot_width + margin.left + margin.right)
    .attr('height', plot_height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

var w_cloud = d3.selectAll('#day_word_cloud')
    .append('svg')
    .attr('width', wc_rect.width)
    .attr('height', wc_rect.height)

var x = d3.scaleLinear().range([0, plot_width + 20]);
var xAxis = d3.axisBottom().scale(x).ticks(5).tickFormat((d) => get_date(d));
plot.append("g")
    .attr("transform", `translate(0,${plot_height})`)
    .attr("class", "x_axis")

var y = d3.scaleLinear().range([plot_height, 0]);
var yAxis = d3.axisLeft().scale(y);
plot.append("g")
    .attr("class", "y_axis")


function handleMouseOver(mouse_event, data) {
    // #15DB95 accent color from pallet
    if (`_${data.word}` != clicked_word) {
        d3.selectAll(`._${data.word}`).style('fill', '#FFA34C')
        document.getElementById('word_preview').innerHTML = data.word
    }
}

function handleMouseOut(mouse_event, data) {
    if (`_${data.word}` != clicked_word) {
        d3.selectAll(`._${data.word}`).style('fill', data.color)
        document.getElementById('word_preview').innerHTML = ""
    }
}

function handleMouseClick(mouse_event, data) {

    document.getElementById('word_preview').innerHTML = ""

    document.getElementById('detail_words').style.visibility = 'visible'
    document.getElementById('detail_day').style.visibility = 'hidden'

    let word = data.word;

    if (word != clicked_word) {
        d3.selectAll(`.${clicked_word}`).style('fill', data.color)
        d3.selectAll(`._${word}`).style('fill', '#15DB95')
        clicked_word = `_${word}`;
        

        const context = document.createElement("canvas").getContext("2d");
        var fontSize = 6
        context.font = `${fontSize}vw Ubuntu`

        var diff = context.measureText(word).width - document.getElementById("word_lable").clientWidth

        while (diff > 0) {
            fontSize = fontSize - 0.2
            context.font =  `${fontSize}vw Ubuntu`
            diff = context.measureText(word).width - document.getElementById("word_lable").clientWidth
        }
        
        document.getElementById("word_lable").style.fontSize = `${fontSize}vw`
        document.getElementById("word_lable").innerHTML = word;
        document.getElementById("dt_first").innerHTML = get_date(data.days[0][0])
        document.getElementById("dt_last").innerHTML = get_date(data.days[data.days.length - 1][1] - 1)

        $.getJSON(`/data/${category}/words/${word}.json`, function (day_w) {

            let plot_data = [];
            // unpacking day array
            var days = [];

            let counter = 0
            for (let i = 0; i < data.days.length; i++) {
                plot_data.push({ "x": data.days[i][0] - 1, "y": 0 })
                for (let j = data.days[i][0]; j < data.days[i][1]; j++) {
                    plot_data.push({ "x": j, "y": day_w[counter] })
                    days.push(j)
                    counter++
                }
                plot_data.push({ "x": data.days[i][1], "y": 0 })
            }

            document.getElementById("dt_most").innerHTML = get_date(days[argmax(day_w)])

            update_plot(plot_data)
        })
    }
}


function handleDateClick(mouse_event, data) {
    let day = data.day

    document.getElementById('detail_words').style.visibility = 'hidden'
    document.getElementById('detail_day').style.visibility = 'visible'
    document.getElementById('day_lable').innerHTML = get_date(day)
    $.getJSON(`/data/${category}/days/${day}.json`, function (json_data) {

        let words = []
        for (let i=0; i < json_data.w.length; i++) {
            words.push({text: json_data.w[i], size: wc_rect.width*(json_data.r[i])})
        }

        var layout = cloud()
            .size([wc_rect.width, wc_rect.height])
            .words(words)
            .fontSize(function (d) { return d.size })
            .on("end", draw_cloud)
        layout.start()
    })

}

function handleDateOver(mouse_event, data) {
    if (`_${data.day}` != clicked_day) {
        d3.selectAll(`.graph_date._${data.day}`).style('fill', '#59FFC6')
        d3.selectAll(`.graph_line._${data.day}`).style('stroke', '#59FFC6')
    }

}

function handleDateOut(mouse_event, data) {
    if (`_${data.day}` != clicked_day) {
        d3.selectAll(`.graph_date._${data.day}`).style('fill', '#FFA34C')
        d3.selectAll(`.graph_line._${data.day}`).style('stroke', '#FFA34C')
    }

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
        .attr("stroke", "#244AB3")
        .attr("stroke-width", 2.5)
}

function draw_cloud(words) {

    let u = w_cloud.selectAll('.cloud_text')
        .data(words, function(d) {return d.text})


    u.enter()
        .append('text')
        .attr('class', 'cloud_text')
        .attr('transform', `translate(${wc_rect.width/2},${wc_rect.height/2})`)
        .merge(u)
        .transition()
        .duration(500)
        .text((d) => d.text)
        .style("font-size", (d) => `${d.size}px`)
        .attr("transform", (d) => `translate(${[d.x+wc_rect.width/2, d.y+wc_rect.height/2]})rotate(${d.rotate})`)
        .attr('fill', color_to_hex(get_color2(Math.random())));
    
    u.exit().remove()
}