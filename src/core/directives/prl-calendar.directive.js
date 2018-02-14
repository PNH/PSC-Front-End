angular
  .module('core.directive')
  .directive('prlCalendar',
    function (moment) {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/prl-calendar.html',
        transclude: 'true',
        scope: {
          selected: '=selected',
          format: '=format',
          prlCalendarControls: '=prlCalendarControls'
        },
        link: function (scope) {
          scope.internalControl = scope.prlCalendarControls || {};
          scope.selected = _removeTime(scope.selected || moment());
          scope.month = angular.copy(scope.selected);
          scope.day = moment(new Date(), 'YYYY-MM-DD');
          scope.highlighted = null;
          var start = scope.selected.clone();
          start.date(1);
          _removeTime(start.day(0));

          _buildMonth(scope, start, scope.month);

          scope.select = function (day) {
            scope.highlighted = day.date;
            scope.internalControl.datePicked(day.date);
          };

          scope.internalControl.resetPicked = function () {
            scope.reset();
          };

          scope.reset = function reset() {
            scope.highlighted = moment(new Date(), 'YYYY-MM-DD').date;
          };

          scope.next = function () {
            var next = scope.month.clone();
            next.date(1);
            _removeTime((next.month(next.month() + 1)).day(0));
            scope.month.month(scope.month.month() + 1);
            _buildMonth(scope, next, scope.month);
          };

          scope.previous = function () {
            var previous = scope.month.clone();
            previous.date(1);
            _removeTime(previous.month(previous.month() - 1).day(0));
            scope.month.month(scope.month.month() - 1);
            _buildMonth(scope, previous, scope.month);
          };

          // private
          function _removeTime(date) {
            return date.hour(0).minute(0).second(0).millisecond(0);
          }

          function _buildMonth(scope, start, month) {
            scope.weeks = [];
            var done = false;
            var date = start.clone();
            var monthIndex = date.month();
            var count = 0;
            while (!done) {
              scope.weeks.push({
                days: _buildWeek(date.clone(), month)
              });
              date.add(1, "w");
              done = count++ > 2 && monthIndex !== date.month();
              monthIndex = date.month();
            }
          }

          function _buildWeek(date, month) {
            var days = [];
            for (var i = 0; i < 7; i++) {
              days.push({
                name: date.format("dd").substring(0, 1),
                number: date.date(),
                isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), "day"),
                date: date
              });
              date = date.clone();
              date.add(1, "d");
            }
            return days;
          }
        }
      };
    });
