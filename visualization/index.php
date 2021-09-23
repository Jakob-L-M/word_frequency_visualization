<?php
    include_once 'lib/dbh.php'
?>

<!DOCTYPE html>

<head>
    <title>Covid News Visualization</title>
    <meta charset="UTF-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300&display=swap" rel="stylesheet">
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script language="javascript" type="text/javascript" src="lib/bootstrap-slider.min.js"></script>
    <script language="javascript" type="text/javascript" src="utils.js"></script>
    <script language="javascript" type="text/javascript" src="lib/d3.layout.cloud.js"></script>
    <script language="javascript" type="text/javascript" src="mouseevents.js" defer></script>
    <script language="javascript" type="text/javascript" src="pub.js" defer></script>
    <script language="javascript" type="text/javascript" src="hints.js"></script>
    <link rel="stylesheet" href="style.css">

<body>
    <div id='graph'></div>
    <input id='slider' type="text" data-slider-handle="custom">
    <text id='date_range'></text>
    <button id='hints' onclick='show_hint()'>HINTS</button>
    <text id='word_preview'></text>
    <div id='detail_words'>
        <text id="word_lable"></text>
        <div id='appearance'>

            <div id='a_first'>
                <text class="detail_text">First</text>
                <text id="dt_first" class="detail_date"></text>
            </div>

            <div id='a_most'>
                <text class="detail_text">Most</text>
                <text id="dt_most" class="detail_date"></text>
            </div>

            <div id='a_last'>
                <text class="detail_text">Last</text>
                <text id="dt_last" class="detail_date"></text>
            </div>
        </div>
        <div id='w_plot'></div>
    </div>
    <div id='detail_day'>
        <text id='day_lable'></text>
        <div id='day_word_cloud'></div>
    </div>

    <button id="about">About</button>
    <div id="about_modal" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <span style="white-space: pre-line">This is the project for my bachelor thesis.

        The website was build and tested using Google Chrome. For my example visualization I am using Twitter Data of German news agencies. All Tweets will be filtered by corona keywords.

        In general the whole project can be used with your own dataset. Alternatively Twitter data can be used with other key- and stopwords. Even though my example is using german Tweets, the code supports 20+ Languages.

        All Textdata is tagged with a timestamp. Im using TF-IDF the calculate word relevance by day. We then smooth relevance by weeks. The final visualization shows radial stacked timelines for the different words. The User is able to select a date range and interact with the graph by clicking on words or dates.

        All code available at <a href="https://github.com/Jakob-L-M/word_frequency_visualization" target="_blank">my github repo</a>.

        Request: request@*
        Contact: contact@*

        *: j-l-m.eu

        <a href="https://www.j-l-m.eu/impressum.html" target="_blank">Impressum – Legal Notice</a>
        </span>
        </div>
      </div>
    <?php
		$sql = "INSERT INTO `corona_vis` (`IP`, `Browser`, `TIME`) VALUES ('" . $_SERVER['REMOTE_ADDR'] . "', '" . $_SERVER['HTTP_USER_AGENT'] . "', '" . round(microtime(true) * 1000) ."');";
		$res = mysqli_query($conn, $sql);
	?>
    
</body>

</html>