angular
  .module('core.directive')
  .directive('badgeCarousel',
    function ($timeout) {
      return {
        restrict: 'E',
        scope: {
          badges: '@',
          level: '@'
        },
        templateUrl: 'core/directives/templates/badge-carousel.html',
        link: function postLink(scope, elem) {
          // var count = angular.element('.ul-container > li').length;
          elem.find('#slide-left').hide();
          var liWidth = 0;
          var maxSlideAmt = 0;
          var slideGap = 0;

          // keeping track how much slided
          var slideAmt = 0;

          // setting view port levels (viewport width)
          var vpLevel1 = 1080;
          var vpLevel2 = 720;
          var vpLevel3 = 540;
          var vpLevel4 = 280;

          var _objArr = [];

          if (scope.badges) {
            _objArr = angular.fromJson(scope.badges);
          }
          var _objCount = _objArr.length;
          var _ulCount;

          // keeping track of resizing
          var mdCount = 0;
          var midCount = 0;
          var smCount = 0;
          var xsCount = 0;

          // to load the carousel initailly
          function initialCarouselLoad() {
            var width = angular.element(window).width();
            if (width > 1200) {
              if (mdCount === 0) {
                elem.find("ul").remove();
                configCarousel(12);
                mdCount++;
                xsCount = 0;
                smCount = 0;
              }
            }

            if (width <= 1200 && width > 992) {
              if (midCount === 0) {
                elem.find("ul").remove();
                configCarousel(8);
                midCount++;
                xsCount = 0;
                smCount = 0;
                mdCount = 0;
              }
            }

            if (width <= 992 && width > 600) {
              if (smCount === 0) {
                elem.find("ul").remove();
                configCarousel(6);
                smCount++;
                xsCount = 0;
                mdCount = 0;
              }
            }
            if (width <= 600) {
              if (xsCount === 0) {
                elem.find("ul").remove();
                configCarousel(4);
                xsCount++;
                smCount = 0;
                mdCount = 0;
              }
            }
          }

          initialCarouselLoad();

          // loading the carousel on window resize
          angular.element(window).on('resize', function () {
            var width = angular.element(window).width();
            var currPosition = 0;
            if (width > 1200) {
              if (mdCount === 0) {
                if (slideAmt !== 0) {
                  elem.find('.ul-container').animate({'margin-left': '0px'}, 1000, function () {
                    var currMarginAmount = parseInt(elem.find('.ul-container').css('marginLeft'), 10);
                    if (currMarginAmount === 0) {
                      elem.find('#slide-left').hide();
                    }
                  });
                  slideAmt = 0;
                }

                elem.find("ul").remove();
                configCarousel(12);
                mdCount++;
                xsCount = 0;
                smCount = 0;
                midCount = 0;
                currPosition = parseInt(elem.find('.ul-container').css('marginLeft'), 10) + slideGap;
                if (currPosition === maxSlideAmt) {
                  elem.find('#slide-right').hide();
                } else {
                  elem.find('#slide-right').show(300);
                }
              }
            }

            if (width <= 1200 && width > 992) {
              if (midCount === 0) {
                if (slideAmt !== 0) {
                  elem.find('.ul-container').animate({'margin-left': '0px'}, 1000, function () {
                    var currMarginAmount = parseInt(elem.find('.ul-container').css('marginLeft'), 10);
                    if (currMarginAmount === 0) {
                      elem.find('#slide-left').hide();
                    }
                  });
                  slideAmt = 0;
                }
                elem.find("ul").remove();

                configCarousel(8);
                midCount++;
                xsCount = 0;
                smCount = 0;
                mdCount = 0;
                currPosition = parseInt(elem.find('.ul-container').css('marginLeft'), 10) + slideGap;
                if (currPosition === maxSlideAmt) {
                  elem.find('#slide-right').hide();
                } else {
                  elem.find('#slide-right').show(300);
                }
              }
            }

            if (width <= 992 && width > 600) {
              if (smCount === 0) {
                if (slideAmt !== 0) {
                  elem.find('.ul-container').animate({'margin-left': '0px'}, 1000, function () {
                    var currMarginAmount = parseInt(elem.find('.ul-container').css('marginLeft'), 10);
                    if (currMarginAmount === 0) {
                      elem.find('#slide-left').hide();
                    }
                  });
                  slideAmt = 0;
                }
                elem.find("ul").remove();
                configCarousel(6);
                smCount++;
                xsCount = 0;
                mdCount = 0;
                midCount = 0;
                currPosition = parseInt(elem.find('.ul-container').css('marginLeft'), 10) + slideGap;
                if (currPosition === maxSlideAmt) {
                  elem.find('#slide-right').hide();
                } else {
                  elem.find('#slide-right').show(300);
                }
              }
            }
            if (width <= 600) {
              if (xsCount === 0) {
                if (slideAmt !== 0) {
                  elem.find('.ul-container').animate({'margin-left': '0px'}, 1000, function () {
                    var currMarginAmount = parseInt(elem.find('.ul-container').css('marginLeft'), 10);
                    if (currMarginAmount === 0) {
                      elem.find('#slide-left').hide();
                    }
                  });
                  slideAmt = 0;
                }
                elem.find("ul").remove();
                configCarousel(4);
                xsCount++;
                smCount = 0;
                mdCount = 0;
                midCount = 0;
                currPosition = parseInt(elem.find('.ul-container').css('marginLeft'), 10) + slideGap;
                if (currPosition === maxSlideAmt) {
                  elem.find('#slide-right').hide();
                } else {
                  elem.find('#slide-right').show(300);
                }
              }
            }
          });

          // calculating maximum sliding amount
          function calcmaxSlideAmt(displaySize) {
            if (displaySize === 12) {
              maxSlideAmt = ((liWidth * 6) * _ulCount) * -1;
              slideGap = (liWidth * 6) * -1;
            } else if (displaySize === 8) {
              maxSlideAmt = ((liWidth * 4) * _ulCount) * -1;
              slideGap = (liWidth * 4) * -1;
            } else if (displaySize === 6) {
              maxSlideAmt = ((liWidth * 3) * _ulCount) * -1;
              slideGap = (liWidth * 3) * -1;
            } else if (displaySize === 4) {
              maxSlideAmt = ((liWidth * 2) * _ulCount) * -1;
              slideGap = (liWidth * 2) * -1;
            }
          }

          function addingColorToBadges(level, ulID, liID, isCompleted) {
            var val = parseInt(level, 10);
            if (isCompleted !== null) {
              if (val === 1) {
                elem.find('.ul-' + ulID + ' > .li-' + liID + ' > .datawrapper > .image-holder > span').addClass("red");
              }
              if (val === 2) {
                elem.find('.ul-' + ulID + ' > .li-' + liID + ' > .datawrapper > .image-holder > span').addClass("blue");
              }
              if (val === 3) {
                elem.find('.ul-' + ulID + ' > .li-' + liID + ' > .datawrapper > .image-holder > span').addClass("green");
              }
              if (val === 4) {
                elem.find('.ul-' + ulID + ' > .li-' + liID + ' > .datawrapper > .image-holder > span').addClass("black");
              }
            }
          }

          // carousel creation
          function configCarousel(displaySize) {
            // getting ul count
            _ulCount = parseInt((_objCount / displaySize), 10);
            if ((_objCount % displaySize) !== 0) {
              _ulCount += 1;
            }

            if (_ulCount === 1) {
              elem.find('#slide-right').hide();
            } else {
              elem.find('#slide-right').show();
            }

            var resumePoint = 0;
            // var widthCount = 0;
            var maxeleHeight = 0;
            var maxImgHolderWidth = 0;
            for (var i = 0; i < _ulCount; i++) {
              var loopCount = 0;

              elem.find('.ul-container').append('<ul class="ul-' + i + '"/>');
              for (var j = resumePoint; j < _objCount; j++) {
                if (loopCount === displaySize) {
                  resumePoint = j;
                  loopCount = 0;
                  break;
                } else {
                  elem.find('.ul-' + i).append('<li class="li-' + j + '"><div class="datawrapper"><div class="image-holder"><span class="badge-icon grey"></span><strong class="title"></strong><p class="text"></p></div></div></li>');
                  elem.find('.ul-' + i + ' > .li-' + j + ' > .datawrapper > .image-holder > strong').append(_objArr[j].savvy_title);
                  elem.find('.ul-' + i + ' > .li-' + j + '> .datawrapper > .image-holder > p').append(_objArr[j].title);
                  addingColorToBadges(scope.level, i, j, _objArr[j].earned_at);
                  var tempHeight = elem.find('.ul-' + i + ' > .li-' + j + ' > .datawrapper > .image-holder').innerHeight();
                  var tempWidth = elem.find('.ul-' + i + ' > .li-' + j + ' > .datawrapper').innerWidth();
                  if (maxeleHeight <= tempHeight) {
                    maxeleHeight = tempHeight;
                  }
                  if (maxImgHolderWidth <= tempWidth) {
                    maxImgHolderWidth = tempWidth;
                  }
                  loopCount++;
                }
              }
              // setting height and width for the li's
              var viewPortWidth = parseInt(elem.find('.view-port').innerWidth(), 10);
              if (viewPortWidth === vpLevel1) {
                liWidth = viewPortWidth / 6;
              }
              if (viewPortWidth === vpLevel2) {
                liWidth = viewPortWidth / 4;
              }
              if (viewPortWidth === vpLevel3) {
                liWidth = viewPortWidth / 3;
              }
              if (viewPortWidth === vpLevel4) {
                liWidth = viewPortWidth / 2;
              }

              elem.find('.ul-' + i + '>li').width(liWidth);
              elem.find('ul > li > .datawrapper > .image-holder').height(maxeleHeight);
              // console.log(elem.find('ul > li > .datawrapper > .image-holder').height());
            }
            calcmaxSlideAmt(displaySize);
          }

          function getSlideAmount() {
            var width = angular.element(window).width();
            var size = 0;
            if (width > 1200) {
              size = liWidth * 6;
            }
            if (width <= 1200 && width > 992) {
              size = liWidth * 4;
            }
            if (width <= 992 && width > 600) {
              size = liWidth * 3;
            }
            if (width <= 600) {
              size = liWidth * 2;
            }
            return size;
          }

          // slide button events
          elem.find('#slide-right').bind('click', function () {
            elem.find('#slide-right').prop("disabled", true);
            $timeout(function () {
              elem.find('#slide-right').prop("disabled", false);
            }, 1000);

            var size = getSlideAmount();
            elem.find('.ul-container').stop().animate({'margin-left': '-=' + size + 'px'}, 1000, function () {
              var temp = parseInt(elem.find('.ul-container').css('marginLeft'), 10) * -1;
              var currMarginAmount = slideGap - temp; // adding
              if (currMarginAmount === maxSlideAmt) {
                elem.find('#slide-right').hide();
              }
              slideAmt += size;
            });

            if (elem.find('#slide-left').is(":hidden")) {
              elem.find('#slide-left').show();
            }
          });

          elem.find('#slide-left').bind('click', function () {
            elem.find('#slide-left').prop("disabled", true);

            $timeout(function () {
              elem.find('#slide-left').prop("disabled", false);
            }, 1000);
            var size = getSlideAmount();
            elem.find('.ul-container').stop().animate({'margin-left': '+=' + size + 'px'}, 1000, function () {
              var currMarginAmount = parseInt(elem.find('.ul-container').css('marginLeft'), 10);
              if (currMarginAmount === 0) {
                elem.find('#slide-left').hide();
              }
              slideAmt -= size;
            });
            if (elem.find('#slide-right').is(":hidden")) {
              elem.find('#slide-right').show();
            }
          });
        }
      };
    });
