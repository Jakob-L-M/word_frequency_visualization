function handleMouseOver(mouse_event, data) {
    // #15DB95 accent color from pallet
    d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', '#15DB95')
  }
  
  function handleMouseOut(mouse_event, data) {
    d3.selectAll(`.${mouse_event.target.classList.value}`).style('fill', data.color)
  }
  
  function handleMouseClick(mouse_event, data) {
    document.getElementById("word_lable").innerHTML = data.data.word
  }