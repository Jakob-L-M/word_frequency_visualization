var hint_generated = false;
var hints_hidden = false;

function show_hint() {

    if (!hint_generated) {
        var first_hint = document.createElement('p')
        first_hint.innerHTML = "Each ring in the graph represents a word. The arcs show us at what days the words were relevant. You can hover over them and click them to get a detailed view for the specific word."
        first_hint.classList.add('hint');
        first_hint.style.top = "15%"
        document.body.append(first_hint)

        var second_hint = document.createElement('p')
        second_hint.innerHTML = "You can also hover and click a specific date. This will revile a word cloud showing you the most relevant words on that day."
        second_hint.classList.add('hint');
        second_hint.style.top = "40%"
        second_hint.style.color = "#FFA34C"
        document.body.append(second_hint)

        var third_hint = document.createElement('p')
        third_hint.innerHTML = "You can also shrink the date range with the slider at the bottom. You can move each end and get a better look at a smaller intervall."
        third_hint.classList.add('hint');
        third_hint.style.top = "60%"
        document.body.append(third_hint)

        hint_generated = true
    } else {
        if (hints_hidden) {

            document.getElementById('detail_words').style.visibility = "hidden"
            document.getElementById('detail_day').style.visibility = "hidden"

            var x = document.getElementsByClassName('hint')
            for (let i = 0; i < x.length; i++) {
                x[i].style.display = 'block';
            }
            hints_hidden = false
        }
    }
}

function hide_hint() {
    if (!hints_hidden) {
        var x = document.getElementsByClassName('hint')
        for (let i = 0; i < x.length; i++) {
            x[i].style.display = 'none';
        }
        hints_hidden = true
    }

}