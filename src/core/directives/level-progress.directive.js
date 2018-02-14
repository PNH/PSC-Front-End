angular
  .module('core.directive')
  .directive('levelProgress',
    function () {
      return {
        restrict: 'E',
        scope: {
          level: '@',
          showprogress: '@'
        },
        link: function postLink(scope, elem) {
          function degreesToRadians(degrees) {
            return degrees * (Math.PI / 180);
          }

          function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
            var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

            return {
              x: centerX + (radius * Math.cos(angleInRadians)),
              y: centerY + (radius * Math.sin(angleInRadians))
            };
          }

          function describeArc(x, y, radius, startAngle, endAngle) {
            var start = polarToCartesian(x, y, radius, endAngle);
            var end = polarToCartesian(x, y, radius, startAngle);

            var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

            var d = [
              "M", start.x, start.y,
              "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
            ].join(" ");

            return d;
          }

          function describeSeperator(x, y, radius, startAngle, stroke) {
            var end = polarToCartesian(x, y, radius, startAngle);

            if (startAngle >= 0 && startAngle < 90) {
              end.y -= stroke * Math.cos(degreesToRadians(startAngle));
              end.x += stroke * Math.sin(degreesToRadians(startAngle));
            } else if (startAngle >= 90 && startAngle < 180) {
              startAngle = 180 - startAngle;
              end.y += stroke * Math.cos(degreesToRadians(startAngle));
              end.x += stroke * Math.sin(degreesToRadians(startAngle));
            } else if (startAngle >= 180 && startAngle < 270) {
              startAngle -= 180;
              end.y += stroke * Math.cos(degreesToRadians(startAngle));
              end.x -= stroke * Math.sin(degreesToRadians(startAngle));
            } else if (startAngle >= 270 && startAngle < 360) {
              startAngle = 360 - startAngle;
              end.y -= stroke * Math.cos(degreesToRadians(startAngle));
              end.x -= stroke * Math.sin(degreesToRadians(startAngle));
            }

            var d = [
              radius, radius, end.x, end.y
            ];

            return d;
          }

          function calculateArc(arcAngle, startAngle, percentage) {
            return ((arcAngle / 100) * percentage) + startAngle;
          }

          function addOverrallProgress(percentage, color) {
            elem.append('<div class="level-progress__progress" style="background-color: ' + color + '">' + percentage + '&#37;<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span></div>');
          }

          // Draw circle
          function drawCircle(_d) {
            elem.append('<svg id="level' + _d.level.id + '"></svg>');
            var circleContainer = elem;
            var w = circleContainer.get(0).getBoundingClientRect().width - 100;

            var radius = (w / 2);
            var stroke = (radius / 100) * 35;
            var outerCircleRadius = 8;
            var viewBox = (radius * 2) + stroke + outerCircleRadius;

            /*eslint-disable */
            // Create elements
            var paper = Snap('#level' + _d.level.id);
            /*eslint-enable */
            paper.attr({
              viewBox: [(-(stroke + outerCircleRadius) / 2), (-(stroke + outerCircleRadius) / 2), viewBox, viewBox].join(" ")
            });

            var arcAngle = 359.99 / _d.savvies.length;

            paper.circle(radius, radius, radius + outerCircleRadius)
              .attr({
                fill: '#ffffff'
              });
            // Create arcs
            _d.savvies.forEach(function (d, i) {
              var arcContainer = paper.path(describeArc(radius, radius, radius, arcAngle * i, arcAngle * (i + 1)))
                .attr({
                  fill: 'none',
                  stroke: '#cccccc',
                  strokeWidth: stroke
                });
              var arc = paper.path(describeArc(radius, radius, radius, arcAngle * i, calculateArc(arcAngle, arcAngle * i, d.percentageComplete)))
                .attr({
                  fill: 'none',
                  stroke: _d.level.color,
                  strokeWidth: stroke
                });

              var label = paper.text('', '', d.title).attr({
                textpath: arcContainer,
                class: 'arc-label',
                dy: 2
              });
              label.textPath.attr({
                startOffset: '50%'
              });
              paper.g(arcContainer, arc, label);
            });

            // Draw seperators
            for (var i = 0; i < _d.savvies.length; i++) {
              var seperatorCordinates = describeSeperator(radius, radius, radius, arcAngle * i, (stroke / 2) + 10);
              paper.line(seperatorCordinates[0], seperatorCordinates[1], seperatorCordinates[2], seperatorCordinates[3])
                .attr({
                  stroke: '#ffffff',
                  strokeWidth: stroke / 3
                });
            }

            paper.text(radius, (radius + 5), _d.level.title).attr({
              class: 'circle-label'
            });

            if (scope.showprogress) {
              addOverrallProgress(_d.level.percentageComplete, _d.level.color);
            }
          }
          drawCircle(angular.fromJson(scope.level));
        }
      };
    });
