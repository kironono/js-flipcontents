/*
 flipcontents.js

 Copyright 2013 Junichi Kakisako.
 Licensed under the MIT License:
 http://www.opensource.org/licenses/mit-license.php

 * Requirement
 - jQuery 1.7.1
   http://jquery.com/
 - flipsnap.js
   http://pxgrid.github.com/js-flipsnap/
*/

(function(window, document, undefined) {
  var FlipContents = function(opts) {
    this.options = $.extend(true, {}, this.default_options, opts);
  };

  FlipContents.prototype = {
    default_options: {
      selector: {
        contents_base: ".itemContents",
        flip_contents: {
          flip: ".flickableContents ul",
          items: ".flickableContents li"
        },
        controls: {
          base: ".flickableControl",
          indicator: {
            base: ".indicator",
            dots: "span"
          },
          move: {
            prev: ".prev",
            next: ".next"
          }
        },
        display: {
          title: ".itemTitle .inner"
        }
      },
      num: 3,
      indicator_tip_width: 13,
      title_attr: "data-title",
      fix_padding: null,
      init_pos: null,
      x_threshold: 15,
      y_threshold: 5,
      animate_duration: 350
    },
    options: {},
    _flip: null,

    _get_base: function() {
      return $(this.options.selector.contents_base);
    },
    _get_flip: function() {
      return this._get_base()
        .find(this.options.selector.flip_contents.flip);
    },
    _get_flip_items: function() {
      return this._get_base()
          .find(this.options.selector.flip_contents.items);
    },
    _get_controls: function() {
      return this._get_base()
        .find(this.options.selector.controls.base);
    },
    _get_indicator: function() {
      return this._get_controls()
        .find(this.options.selector.controls.indicator.base);
    },
    _get_indicator_dots: function() {
      return this._get_indicator()
        .find(this.options.selector.controls.indicator.dots);
    },
    _get_move_prev: function() {
      return this._get_controls()
        .find(this.options.selector.controls.move.prev);
    },
    _get_move_next: function() {
      return this._get_controls()
        .find(this.options.selector.controls.move.next);
    },
    _get_display_title: function() {
      return this._get_base()
        .find(this.options.selector.display.title);
    },

    _calc_item_width: function() {
      return Math.floor(this._get_base().width() / this.options.num);
    },

    _calc_flip_padding: function() {
      if (this.options.fix_padding === null) {
        return Math.floor((this._get_base().width() / 2) -
                          (this._calc_item_width() / 2));
      } else {
        return this.options.fix_padding;
      }
    },

    flip_factory: function(selector, conf) {
      this._flip = Flipsnap(selector, conf);
    },

    on_resize: function() {
      var flip = this._get_flip();
      var flip_items = this._get_flip_items();

      var indicator = this._get_indicator();

      var item_count = flip_items.size();
      var item_width = this._calc_item_width();

      // update flip items
      flip_items.css({
        'width': item_width
      });
      flip.css({
        'width': item_width * item_count
      }).css({
        'padding-left': this._calc_flip_padding()
      });

      // update indicator
      if (indicator) {
        indicator.css({
          'width': (item_count * this.options.indicator_tip_width) + 'px'
        });
      }

      this._flip.conf.distance = item_width;
      this._flip.refresh();
    },

    update_controls: function() {
      // update indicator
      var indicator_dots = this._get_indicator_dots();
      var current = this._flip.currentPoint;

      if (indicator_dots) {
        indicator_dots.removeClass("current");
        indicator_dots.eq(current).addClass("current");
      }

      // update move control
      var prev = this._get_move_prev();
      var next = this._get_move_next();

      if (this._flip.hasNext()) {
        next.removeClass('disabled');
      } else {
        next.addClass('disabled');
      }
      if (this._flip.hasPrev()) {
        prev.removeClass('disabled');
      } else {
        prev.addClass('disabled');
      }

    },

    update_title: function() {
      var title_ele = this._get_display_title();

      if (title_ele.size() !== 0) {
        var current = this._flip.currentPoint;
        var flip_items = this._get_flip_items();
        var target_item = flip_items.eq(current);

        var title = target_item.attr(this.options.title_attr);
        var link = target_item.children("a").attr("href");
        var html = $('<a>').attr('href', link).html(title);
        title_ele.html(html);
      }
    },

    add_event_moveend: function() {
      var self = this;
      this._flip.element.addEventListener('fsmoveend', function() {
        self.update_controls();
        self.update_title();
      }, false);
    },

    add_event_resize: function() {
      var self = this;
      $(window).bind("resize", function() {
        self.on_resize();
      });
    },

    add_event_move: function() {
      var self = this;
      this._get_move_prev().click(function() {
        self._flip.toPrev();
        return false;
      });
      this._get_move_next().click(function() {
        self._flip.toNext();
        return false;
      });
    },

    _init: function() {
      var indicator = this._get_indicator();
      var flip_items = this._get_flip_items();
      // init indicator
      if (indicator) {
        indicator.empty();
        for (var i = 0; i < flip_items.size(); i++) {
          indicator.append("<span></span>");
        }
      }

      this.on_resize();
      this.update_controls();
      this.update_title();

      // move to initialize position.
      if (this.options.init_pos !== null) {
        this._flip.moveToPoint(this.options.init_pos - 1);
      }
    },

    setup: function() {
      // create flip object
      this.flip_factory(this._get_flip().selector, {
        deltaXThreshold: this.options.x_threshold,
        deltaYThreshold: this.options.y_threshold,
        animateDuration: this.options.animate_duration
      });

      // setup event
      this.add_event_resize();
      this.add_event_move();
      this.add_event_moveend();

      // initialize
      this._init();
    },

    attach_event: function(type, func) {
      this._flip.element.addEventListener(type, func);
    },

    get_current_point: function() {
      return this._flip.currentPoint;
    },

    move_to_point: function(point) {
      this._flip.moveToPoint(point);
    }
  };

  window.FlipContents = FlipContents;

})(window, window.document);
