angular
  .module('core.directive')
  .directive('pathwayProgress',
    function () {
      return {
        restrict: 'A',
        scope: {
          itemid: '@',
          progress: '@'
        },
        link: function postLink(scope, elem) {
          /*eslint-disable */
          function roundPathCorners(pathString, radius, useFractionalRadius) {
            function moveTowardsLength(movingPoint, targetPoint, amount) {
              var width = (targetPoint.x - movingPoint.x);
              var height = (targetPoint.y - movingPoint.y);

              var distance = Math.sqrt(width * width + height * height);

              return moveTowardsFractional(movingPoint, targetPoint, Math.min(1, amount / distance));
            }

            function moveTowardsFractional(movingPoint, targetPoint, fraction) {
              return {
                x: movingPoint.x + (targetPoint.x - movingPoint.x) * fraction,
                y: movingPoint.y + (targetPoint.y - movingPoint.y) * fraction
              };
            }

            // Adjusts the ending position of a command
            function adjustCommand(cmd, newPoint) {
              if (cmd.length > 2) {
                cmd[cmd.length - 2] = newPoint.x;
                cmd[cmd.length - 1] = newPoint.y;
              }
            }

            // Gives an {x, y} object for a command's ending position
            function pointForCommand(cmd) {
              return {
                x: parseFloat(cmd[cmd.length - 2]),
                y: parseFloat(cmd[cmd.length - 1]),
              };
            }

            // Split apart the path, handing concatonated letters and numbers
            var pathParts = pathString
              .split(/[,\s]/)
              .reduce(function(parts, part) {
                var match = part.match("([a-zA-Z])(.+)");
                if (match) {
                  parts.push(match[1]);
                  parts.push(match[2]);
                } else {
                  parts.push(part);
                }

                return parts;
              }, []);

            // Group the commands with their arguments for easier handling
            var commands = pathParts.reduce(function(commands, part) {
              if (parseFloat(part) == part && commands.length) {
                commands[commands.length - 1].push(part);
              } else {
                commands.push([part]);
              }

              return commands;
            }, []);

            // The resulting commands, also grouped
            var resultCommands = [];

            if (commands.length > 1) {
              var startPoint = pointForCommand(commands[0]);

              // Handle the close path case with a "virtual" closing line
              var virtualCloseLine = null;
              if (commands[commands.length - 1][0] == "Z" && commands[0].length > 2) {
                virtualCloseLine = ["L", startPoint.x, startPoint.y];
                commands[commands.length - 1] = virtualCloseLine;
              }

              // We always use the first command (but it may be mutated)
              resultCommands.push(commands[0]);

              for (var cmdIndex = 1; cmdIndex < commands.length; cmdIndex++) {
                var prevCmd = resultCommands[resultCommands.length - 1];

                var curCmd = commands[cmdIndex];

                // Handle closing case
                var nextCmd = (curCmd == virtualCloseLine) ?
                  commands[1] :
                  commands[cmdIndex + 1];

                // Nasty logic to decide if this path is a candidite.
                if (nextCmd && prevCmd && (prevCmd.length > 2) && curCmd[0] == "L" && nextCmd.length > 2 && nextCmd[0] == "L") {
                  // Calc the points we're dealing with
                  var prevPoint = pointForCommand(prevCmd);
                  var curPoint = pointForCommand(curCmd);
                  var nextPoint = pointForCommand(nextCmd);

                  // The start and end of the cuve are just our point moved towards the previous and next points, respectivly
                  var curveStart, curveEnd;

                  if (useFractionalRadius) {
                    curveStart = moveTowardsFractional(curPoint, prevCmd.origPoint || prevPoint, radius);
                    curveEnd = moveTowardsFractional(curPoint, nextCmd.origPoint || nextPoint, radius);
                  } else {
                    curveStart = moveTowardsLength(curPoint, prevPoint, radius);
                    curveEnd = moveTowardsLength(curPoint, nextPoint, radius);
                  }

                  // Adjust the current command and add it
                  adjustCommand(curCmd, curveStart);
                  curCmd.origPoint = curPoint;
                  resultCommands.push(curCmd);

                  // The curve control points are halfway between the start/end of the curve and
                  // the original point
                  var startControl = moveTowardsFractional(curveStart, curPoint, .5);
                  var endControl = moveTowardsFractional(curPoint, curveEnd, .5);

                  // Create the curve 
                  var curveCmd = ["C", startControl.x, startControl.y, endControl.x, endControl.y, curveEnd.x, curveEnd.y];
                  // Save the original point for fractional calculations
                  curveCmd.origPoint = curPoint;
                  resultCommands.push(curveCmd);
                } else {
                  // Pass through commands that don't qualify
                  resultCommands.push(curCmd);
                }
              }

              // Fix up the starting point and restore the close path if the path was orignally closed
              if (virtualCloseLine) {
                var newStartPoint = pointForCommand(resultCommands[resultCommands.length - 1]);
                resultCommands.push(["Z"]);
                adjustCommand(resultCommands[0], newStartPoint);
              }
            } else {
              resultCommands = commands;
            }

            return resultCommands.reduce(function(str, c) {
              return str + c.join(" ") + " ";
            }, "");
          }
          /*eslint-enable */

          function describeProgressBar(width, height, stroke, isReversed) {
            var _width = width + stroke;
            var _height = height + stroke;

            var r = [
              "M", stroke, stroke,
              "L", _width, stroke,
              "L", _width, _height,
              "L", stroke, _height
            ].join(" ");

            if (isReversed) {
              r = [
                "M", _width, stroke,
                "L", stroke, stroke,
                "L", stroke, _height,
                "L", _width, _height
              ].join(" ");
            }

            return roundPathCorners(r, 30, false);
          }

          // function describeProgress(width, height, stroke, progress, isReversed) {
          //   var _width = width + stroke;
          //   var _height = height + stroke;
          //   var _perimeter = (_width * 2) + _height;
          //   var _progress = (_perimeter / 100) * progress;
          //   var _p = [];
          //   console.log('progress: ' + progress);
          //   if(isReversed) {
          //   } else {
          //     _p.push("M", stroke, stroke);
          //     if (0 === _progress) {
          //       _p.push("L", stroke, stroke);
          //     } else if (0 < _progress && _width > _progress) {
          //       _p.push("L", _progress, stroke);
          //     } else if (_width <= _progress && (_height + _width) > _progress) {
          //       _progress - _width;
          //       _p.push("L", _width, stroke, "L", _width, _progress);
          //     } else if ((_height + _width) <= _progress && _perimeter > _progress) {
          //       _progress - (_height + _width);
          //       _p.push("L", _width, stroke, "L", _width, _height, "L", _progress, _height);
          //     } else {
          //       _p.push("L", _width, stroke, "L", _width, _height, "L", stroke, _height);
          //     }
          //   }

          //   return roundPathCorners(_p.join(" "), 30, false);
          // }

          function calculateProgress(perimeter, progress) {
            var _progress = (perimeter / 100) * progress;
            return {
              perimeter: perimeter,
              progress: (perimeter - _progress)
            };
          }

          function calculateDimensions(_e, isSmall) {
            var _dim;
            if (isSmall) {
              _dim = {
                height: _e.height,
                width: ((_e.parentWidth / 2) - 10)
              };
            } else {
              _dim = {
                height: _e.height,
                width: ((_e.parentWidth / 2) - (_e.badgeWidth + 50) - 10)
              };
            }
            return _dim;
          }

          // Draw progress bar
          function drawProgressBar() {
            elem.find('svg').remove();
            var _drawSmall = angular.element(window).width() <= 768;
            var _stroke = 10;
            var _elem = {
              height: elem.height(),
              parentWidth: elem.parent().width(),
              badgeWidth: elem.find('.pw-badge').width()
            };
            var _dimensions = calculateDimensions(_elem, _drawSmall);
            var _progressBarContainer = {
              width: _dimensions.width,
              height: (_dimensions.height - _stroke),
              stroke: (_stroke / 2),
              isReversed: (scope.itemid % 2)
            };
            var _svg = {
              id: 'pathway-progress-' + scope.itemid,
              width: (_dimensions.width + _stroke),
              height: _dimensions.height
            };

            if (angular.element('#' + _svg.id).length < 1) {
              elem.append('<svg id="' + _svg.id + '" width="' + _svg.width + '" height="' + _svg.height + '" class="pw-progress"></svg>');
            }

            /*eslint-disable */
            var paper = Snap('#' + _svg.id);
            /*eslint-enable */

            var progressBarContainer = paper.path(describeProgressBar(_progressBarContainer.width, _progressBarContainer.height, _progressBarContainer.stroke, !_progressBarContainer.isReversed)).attr({
              class: 'pw-progress__container',
              strokeWidth: _stroke
            });

            var progressBar = paper.path(describeProgressBar(_progressBarContainer.width, _progressBarContainer.height, _progressBarContainer.stroke, !_progressBarContainer.isReversed)).attr({
              class: 'pw-progress__progress',
              strokeWidth: _stroke
            });

            var _progress = calculateProgress(progressBar.getTotalLength(), scope.progress);
            progressBar.attr({
              strokeDasharray: _progress.perimeter,
              strokeDashoffset: _progress.progress
            });
            paper.g(progressBarContainer, progressBar);
          }

          angular.element(window).on('resize orientationchange', function () {
            drawProgressBar();
          });
          drawProgressBar();
        }
      };
    });
