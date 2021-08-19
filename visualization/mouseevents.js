var clicked_word;
var first_click = true;

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

        })
    }
}

function initview() {
    document.getElementById('appearance').style.visibility = 'visible'
}