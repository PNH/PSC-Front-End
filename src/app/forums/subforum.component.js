angular
  .module('app')
  .component('subForumCom', {
    templateUrl: 'app/forums/template/subforum.html',
    controller: function ($stateParams, $log, $q, ForumsSDK, SETTINGS, blockUI, alertify) {
      var self = this;

      self.subForumId = null;

      self.summernoteOptions = SETTINGS.SUMMERNOTE_CONFIG;

      // Pagination
      var _topicsIndex = 1;
      var _topicLimit = 5;
      var _hasCreatedTopic = false;
      self._topicReachedEnd = false;

      // Loading
      const subForumLoad = blockUI.instances.get('subForumLoading');
      self.createTopicProcessing = false;
      self.topicLoadIsProcessing = false;

      // Models
      self.topicModel = null;

      // Data
      self.subForum = null;
      self.topics = [];
      self.stickies = [];

      // Errors
      self.validSubforum = true;
      self.validSubforumError = '';

      /**
       * Merge given two arrays
       *
       * @param {Array} arr1 Array 1
       * @param {Array} arr2 Array 2
       * @returns Merged array
       */
      function mergeArray(arr1, arr2) {
        var temp = arr1;
        if (_hasCreatedTopic) {
          angular.forEach(arr2, function (value) {
            var hasFound = false;
            for (var i = 0; i < temp.length; i++) {
              if (value.id === temp[i].id) {
                hasFound = true;
              }
            }
            if (!hasFound) {
              temp.push(value);
            }
          });
        } else {
          angular.forEach(arr2, function (value) {
            temp.push(value);
          });
        }
        return temp;
      }

      /**
       * Get sub forum
       *
       * @param {Integer} sid Sub forums ID
       * @param {Integer} page Page index
       * @param {Integer} limit Page limit
       */
      function _getSubForum(sid, page, limit) {
        subForumLoad.start();
        ForumsSDK.getSubForum(sid, page, limit, true).then(function (response) {
          self.subForum = response.content;
          self.stickies = response.content.stickies;
          if (response.content.topics.length === 0) {
            self._topicReachedEnd = true;
          } else if (response.content.topics.length < limit) {
            self.topics = response.content.topics;
            self._topicReachedEnd = true;
          } else if (!response.content.topics.length < limit) {
            self.topics = response.content.topics;
          }
          _topicsIndex += 1;
          subForumLoad.stop();
          self.validSubforum = true;
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later.');
          subForumLoad.stop();
          self.validSubforum = false;
          self.validSubforumError = 'We\'re sorry. This is an invalid Sub-Forum!';
        });
      }

      /**
       * Get topics
       *
       * @param {Integer} forumId
       * @param {Integer} page
       * @param {Integer} limit
       */
      function getTopics(forumId, page, limit) {
        self.topicLoadIsProcessing = true;
        ForumsSDK.getTopics(forumId, page, limit, true).then(function (response) {
          if (response.content === null) {
            self._topicReachedEnd = true;
          } else if (response.content.length < limit) {
            self.topics = mergeArray(self.topics, response.content);
            self._topicReachedEnd = true;
          } else if (!response.content.length < limit) {
            self.topics = mergeArray(self.topics, response.content);
          }
          _topicsIndex += 1;
          self.topicLoadIsProcessing = false;
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later.');
          self.topicLoadIsProcessing = false;
        });
      }

      /**
       * Create a topic
       *
       * @param {Integer} subforumId Subforum ID
       * @param {String} content Topic content
       */
      function createTopic(subforumId, content) {
        self.createTopicProcessing = true;
        content.status = 1;
        content.privacy = 1;
        ForumsSDK.createTopic(subforumId, content, false).then(function (response) {
          if (response.status === 200) {
            alertify.success('Topic has been successfully created.');
            self.topics.unshift(response.content);
            _hasCreatedTopic = true;
          } else {
            alertify.error(response.message);
          }
          self.createTopicProcessing = false;
          self.topicModel = null;
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later.');
          self.createTopicProcessing = false;
          self.topicModel = null;
        });
      }

      /**
       * Public methods
       */
      self.onLoadMoreTopicsClicked = function onLoadMoreTopicsClicked() {
        getTopics(self.subForumId, _topicsIndex, _topicLimit);
      };
      self.onCreateTopicClicked = createTopic;

      /**
       * Init
       */
      function _init() {
        self.subForumId = Number($stateParams.subforumid);
        if (self.subForumId && !isNaN(self.subForumId)) {
          _getSubForum(self.subForumId, _topicsIndex, _topicLimit);
        } else {
          self.validSubforum = false;
          self.validSubforumError = 'We\'re sorry. This is an invalid Sub-Forum!';
        }
      }
      _init();
    }
  });
