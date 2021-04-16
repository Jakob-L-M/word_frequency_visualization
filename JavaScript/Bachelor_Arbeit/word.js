class Word {
  constructor(x, y, t, g) {
    var options = {
      //Reibung [0,1]
      friction: 0.01,
      frictionAir: 0.02,

      //Elastizität [0,1]
      restitution: 0,

      //Rotation der Boxen verhindern
      inertia: Infinity,
      inverseInertia: 0,

      collisionFilter: {
        'group': 1,
        'category': -31,
        'mask': -1,
      }
    };
    this.g = g; // Weight of word
    this.ratio = getSizeOfText(t, 'Times New Roman', 1); // ratio = width/height
    this.h = Math.sqrt(sketchSize*this.g*(1/this.ratio)); // fontsize | 1pt ~ 4/3px
    this.w = getSizeOfText(t, 'Times New Roman', this.h) * 1.1; // 10% extra

    // Der Body des Worts, welcher in der Physics Engine verwendet wird
    this.body = Bodies.rectangle(x, y, this.w, this.h, options);
    
    // Farbe des Worts
    // todo -> Farbtheorie
    this.color = {r: random(5,255),
      g: random(5,255),
      b: random(5,255)
    }

    World.add(world, this.body);

    /**
     * Setzt das Gewicht des Wort auf einen neuen Wert.
     * @param Double newg 
     */
    this.updateWeight = function(newg) {
      // scale -> Wenn > 1 => Wort soll größer werden. Analog wenn < 1
      var scale = newg/this.g;

      // Gewicht (g) updaten
      this.g = newg;

      // Neuberechnung von height und width
      this.h = Math.sqrt(sketchSize*this.g*(1/this.ratio));
      this.w = getSizeOfText(t, 'Times New Roman', this.h) * 1.1;

      // Body rescalen
      // Math.squt, weil Flächeninhalt
      Body.scale(this.body, Math.sqrt(scale), Math.sqrt(scale));
    }

    this.increaseWeight = function(incg) {
      this.updateWeight(this.g + incg)
    }

    this.decreaseWeight = function(decg) {
      if (this.g - decg > 0) {
        this.updateWeight(this.g - decg)
      }
    }

    /**
     * Diese Funktion wird im draw()-Loop aufgerufen und zeichnet das Wort
     * @param {*} x Position
     * @param {*} y Position
     */
    this.show = function(x, y) {
      var pos = this.body.position;
      push();
      // pos.x += (x - pos.x) * 5
      translate(pos.x, pos.y);
      rectMode(CENTER);

      //Randdicke + Farbe
      strokeWeight(1);
      stroke(255);

      //Füllfarbe
      fill(this.color.r, this.color.g, this.color.b);
      // rect(0, 0, this.w, this.h);
      textSize(this.h);
      textFont('Times New Roman');
      //-3/8 = -1/2 * 4/3
      text(t, -this.w*0.45, this.h*1/4);
      pop();
    };
  }
}

// Berechnen der Text breite, abhängig von der höhe
var ctx = document.createElement('canvas').getContext('2d');
ctx.textBaseline = "top"

function getSizeOfText(txt, fontname, fontsize){

  var fontspec = fontsize + 'px ' + fontname;
  ctx.font = fontspec;
  return ctx.measureText(txt).width;
}