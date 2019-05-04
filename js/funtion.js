(function() {
  var LetterView, LettersView;

  function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Backbone view,  managing state an all letters
   **/
  LettersView = Backbone.View.extend({
    el: '#letters',
    views: [],

    events: {
      'click button': 'explode'
    },

    initialize: function() {
      /* Determins if the letters are animations or not */
      this.model = new Backbone.Model({
        play: false
      });

      /* Extracting letters from html */
      this.letters = this.$('h1').text().split('');
      this.$('h1').text('');

      /* Looping through all letters an creates backbone view for each letter */
      for (var i in this.letters) {
        var view = new LetterView({
          state: this.model,
          container: this.el,
          letter: this.letters[i]
        });
        this.views.push(view);
        this.$('h1').append(view.el);
        view.render();
      }

      this.renderButton = this.renderButton.bind(this);
      this.listenTo(this.model, 'change:play', this.renderButton);
    },

    /* Toggle display of button */
    renderButton: function() {
      var play = this.model.get('play');
      if (play) {
        this.$('button').addClass('hidden');
      } else {
        this.$('button').removeClass('hidden');
      }
    },

    /* Starts animation */
    explode: function() {
      var play = this.model.get('play');
      this.model.set('play', true);
    }
  });

  /**
   * Backbone view managing individual letter
   **/
  LetterView = Backbone.View.extend({
    tagName: 'span',

    /* Width of the area the letters kan float */
    containerWidth: 0,

    /* Height of the area the letters kan float */
    containerHeight: 0,

    /* The letter's width */
    width: 0,

    /* The letter's height */
    height: 0,

    initialize: function(options) {
      /* Global state of the application */
      this.state = options.state;

      /* The current letter */
      this.letter = options.letter;

      /* jQuery reference to the container of the letters */
      this.$container = Backbone.$(options.container);

      /* Adding the letter to the view */
      this.$el.html(this.letter);

      /* Local model holding the letter's attributes */
      this.model = new Backbone.Model();

      /* Binding functions to LetterView */
      this.renderForces = this.renderForces.bind(this);
      this.play = this.play.bind(this);

      /* If local model changes rerender the letter's forces */
      this.listenTo(this.model, 'change', this.renderForces);

      /* If global state changes, start animation */
      this.listenTo(this.state, 'change:play', this.play);
    },

    /* Calculats container dimentions and letter boundaries */
    setDimentions: function() {
      this.containerWidth = this.$container.width();
      this.containerHeight = this.$container.height();
      this.width = this.$el.width();
      this.height = this.$el.height();
    },

    /* Initial position is the position in the string. Adding random speed. */
    createInitialForces: function() {
      var obj = {
        offset: this.$el.offset(),

        /* no rotation in intitial state */
        xpos: 0,
        ypos: 0,
        xRotationVector: 0,
        yRotationVector: 0,
        zRotationVector: 1,
        rotation: 0,

        /* random velocity on x and y axix */
        velX: randomNumber(-3, 3),
        velY: randomNumber(-3, 3),

        /* random rotation speed */
        rotSpeed: randomNumber(-0.5, 0.5),
        xVecSpeed: randomNumber(-0.5, 0.5),
        yVecSpeed: randomNumber(-0.5, 0.5),
        zVecSpeed: randomNumber(-0.5, 0.5)
      };

      this.model.set(obj);
    },

    applyForces: function() {
      var
        pos,
        obj = this.model.toJSON();

      /* Adding velocity */
      obj.xpos += obj.velX;
      obj.ypos += obj.velY;
      obj.xRotationVector += obj.xVecSpeed;
      obj.yRotationVector += obj.yVecSpeed;
      obj.zRotationVector += obj.zVecSpeed;
      obj.rotation += obj.rotSpeed;

      pos = {
        x: (obj.offset.left + obj.xpos),
        y: (obj.offset.top + obj.ypos)
      };

      /* If letter hits the one of the edges on the x-axis reverse x-direction */
      if ((pos.x + this.width) >= this.containerWidth || pos.x <= 0) {
        obj.velX *= -1;
      }

      /* If letter hits the one of the edges on the y-axis reverse y-direction */
      if ((pos.y + this.height) >= this.containerHeight || pos.y <= 0) {
        obj.velY *= -1;
      }

      this.model.set(obj);
    },

    /* start animation */
    play: function() {
      var play = this.state.get('play');
      if (play) {
        requestAnimationFrame(this.play);
      }
      this.applyForces();
    },

    /* Writing the position and rotation to the html as css transform */
    renderForces: function() {
      var obj = this.model.toJSON();
      var css = 'translate3d(' + obj.xpos + 'px,' + obj.ypos + 'px, 0) rotate3d(' + obj.xRotationVector + ',' + obj.yRotationVector + ',' + obj.zRotationVector + ',' + obj.rotation + 'deg)';
      this.$el.css('transform', css);
    },

    render: function() {
      this.setDimentions();
      this.createInitialForces();
      this.renderForces();
    }
  });

  Backbone.$(function() {
    var letters = new LettersView();
  });

})(Backbone);
