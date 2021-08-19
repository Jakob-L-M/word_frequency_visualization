function handleMouseOver(mouse_event, data) {
    // #15DB95 accent color from pallet
    d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', '#15DB95')
}
  
function handleMouseOut(mouse_event, data) {
    d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', data.color)
}

function handleMouseClick(mouse_event, data) {
    let word = data.data.word;
    document.getElementById("word_lable").innerHTML = word;

    document.getElementById("dt_first").innerHTML = get_date(data.data.days[0][0])
    document.getElementById("dt_last").innerHTML = get_date(data.data.days[data.data.days.length-1][1]-1)

    $.getJSON(`../data/${category}/words/${word}.json`, function(day_w) {

        // unpacking day array
        var days = [];
        for(let i = 0; i < data.data.days.length; i++) {
            for(let j = data.data.days[i][0]; j < data.data.days[i][1]; j++)
            days.push(j)
        }
        
        document.getElementById("dt_most").innerHTML = get_date(days[argmax(day_w)])

    })
}