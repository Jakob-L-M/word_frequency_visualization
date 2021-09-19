## Visualization

All code for web visualization can be found here.

### Folder Structure:
```
visualization
│   README.md
│   style.css    
│   index.php
|   hints.js
|   mouseevents.js
|   pub.js
|   utils.js
└───data
│   └───category1
│       │   main.json
│       │   days/
│       │   words/
│   └───category2
|   └───category3
└───lib
    │   bootstrap-slider.min.js
    │   d3.layout.cloud.js
    |   dbh.php
```

Category Data can be found in the export folder of the category.

`bootstrap-slider.min.js`: https://github.com/seiyria/bootstrap-slider

`d3.layout.cloud.js`: https://github.com/jasondavies/d3-cloud

`dbh.php`: A mysql database connection. Can be ignored if not needed. If ignored php code should be removed from `index.php` 