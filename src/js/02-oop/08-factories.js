console.log('Factories');

/*
 * in case property and parameter have the same name
 * the name can be omitted instead automatic assignmet takes place

function createCircle(radius) {
  return {
    radius: radius,
    draw: function() {
      console.log('draw');
    }
  };
}

  */

function createCircle(radius) {
	return {
		radius,
		draw: function () {
			console.log('draw');
		},
	};
}

const circle = createCircle(1);
circle.draw();
