angular
  .module('app')
  .component('blogCreateCom', {
    templateUrl: 'app/blog/template/create.html',
    controller: function ($scope, $log, $q, $state, $timeout, BlogSDK, alertify, SETTINGS) {
      var self = this;

      self.summernoteOptions = SETTINGS.SUMMERNOTE_CONFIG;
      self.submitBtnClicked = false;
      self.postModel = "";
      self.selectedBlogPostPrivacy = String(9999);
      self.blogFormData = {};
      self.blogFormData.categories = [];
      self.blogFormData.selectedTags = [];
      self.blogFormData.tagItem = null;
      self.selectedCategories = [];
      var lastUserStringInput = null;

      // Loaders
      self.isNewBlogProcessing = false;

      // Directive controls
      self.profileImageCtrl = {};

      /* Public Methods */
      self.onNewBlogClicked = onNewBlogClicked;
      self.onBlogCategoryChanged = onBlogCategoryChanged;
      // self.filterTagStringList = filterTagStringList;
      self.tagSubmitEnterEvent = tagSubmitEnterEvent;
      self.onSearchTag = onSearchTag;
      self.onAddTagItem = onAddTagItem;
      self.onRemoveTagItem = onRemoveTagItem;

      /**
       * Init
      */
      function _init() {
        getBlogMetaData();
      }
      _init();

      /**
       * New Blog Add Button Click
       */
      var tagTemp = [];
      function onNewBlogClicked() {
        self.submitBtnClicked = true;
        $log.log(self.blogCreateForm);
        $log.log(self.blogFormData);

        self.newBlogApiObj = {
          title: self.blogFormData.title,
          tagline: self.blogFormData.tagline,
          content: self.postModel,
          image: self.blogFormData.image
        };

        if (self.blogFormData.categories.length > 0) {
          self.newBlogApiObj.categories = angular.toJson(self.blogFormData.categories);
        }

        if (self.blogFormData.selectedTags.length > 0) {
          tagTemp = [];
          for (var t = 0; t < self.blogFormData.selectedTags.length; t++) {
            tagTemp.push({name: self.blogFormData.selectedTags[t].readableName});
          }
          self.newBlogApiObj.tags = angular.toJson(tagTemp);
        }

        if (self.selectedBlogPostPrivacy === String(9999)) {
          self.newBlogApiObj.privacy = Number(1);
        } else {
          self.newBlogApiObj.privacy = self.selectedBlogPostPrivacy;
        }

        $log.log(self.newBlogApiObj);
        if (self.blogCreateForm.$valid) {
          $log.log("API Called...");
          createBlogAPI(self.newBlogApiObj);
        }
      }

      /**
       * Creates a blog api call.
       *
       * @param      {Object}  newBlogObj  The new blog object
       * @return     {Object}  API call response
       */
      function createBlogAPI(newBlogObj) {
        self.isNewBlogProcessing = true;
        var deferred = $q.defer();
        BlogSDK.makePost(newBlogObj, true).then(function (response) {
          if (response.status === 201) {
            alertify.okBtn("OK").alert("Your blog post has been successfully published.", function () {
              $state.go('blog', ({blogslug: null}));
            });
          } else {
            alertify.okBtn("OK").alert("Thanks for your valuable contribution! Parelli Central will review your post & contact you when it is posted or if edits are needed. All content submitted are subject to our Terms & Conditions which can be viewed <a href='http://www.parelli.com/terms-and-conditions.html' target='_blank'> HERE</a> ", function () {
              $state.go('blog', ({blogslug: null}));
            });
          }
          $log.log(response);
          deferred.resolve(response);
          self.isNewBlogProcessing = false;
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again.');
          deferred.reject(error);
          self.isNewBlogProcessing = false;
        });
        return deferred.promise;
      }

      /**
       * Gets the blog meta data.
       *
       * @return     {Object}  The blog meta data.
       */
      function getBlogMetaData() {
        var deferred = $q.defer();
        BlogSDK.getMeta(true).then(function (response) {
          self.blogCategories = response.content.blog_categories;
          $log.log(response);
          deferred.resolve(response);
        }, function (error) {
          $log.error(error);
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Category Checkbox Change Event
       *
       * @param      {Object}  categoryItems  The category items
       */
      function onBlogCategoryChanged(categoryItems) {
        self.blogFormData.categories = [];
        angular.forEach(categoryItems, function (value, key) {
          if (value) {
            self.blogFormData.categories.push({id: key});
          }
        });
      }

      // function filterTagStringList(userInput) {
      //   lastUserStringInput = userInput;
      //   var filter = $q.defer();
      //   var normalisedInput = userInput.toLowerCase();

      //   var filteredArray = self.dropdownTags.filter(function (tag) {
      //     return tag.toLowerCase().indexOf(normalisedInput) === 0;
      //   });

      //   filter.resolve(filteredArray);
      //   return filter.promise;
      // }

      /**
       * Enter Press Key Event
      */
      function tagSubmitEnterEvent() {
        $timeout(function () {
          if (self.blogFormData.tagItem !== null) {
            if (self.blogFormData.tagItem.replace(/\s/g, '').length === 0) {
              return;
            }
          }
          if (self.blogCreateForm.tag.$valid) {
            var tagName = self.blogFormData.tagItem || lastUserStringInput;
            onAddTagItem({readableName: tagName});
          }
        }, 300);
      }

      /**
       * Tag Search input-dropdown
       */
      self.searching = false;
      self.dropdownTags = [];
      function onSearchTag(query) {
        lastUserStringInput = query;
        var filter = $q.defer();
        if (self.searching) {

        } else {
          self.searching = true;
          if (angular.isDefined(self.dropdownTags)) {
            self.dropdownTags.splice(0, self.dropdownTags.length);
          }
          BlogSDK.searchTag(query, false).then(function (response) {
            $log.log(response.content);
            self.tempInstuctors = response.content;
            /*eslint-disable */
            if (response.content) {
              for (var r = 0; r < response.content.tag.length; r++) {

                for (var t = 0; t < self.blogFormData.selectedTags.length; t++) {
                  if (self.blogFormData.selectedTags[t] === response.content.tag[r]) {
                    continue;
                  }
                }

                self.dropdownTags.push({id: response.content.tag[r].id, readableName: response.content.tag[r].name});
              }
            }

            /*eslint-enable */
            $log.debug(self.dropdownTags);
            filter.resolve(self.dropdownTags);
            self.searching = false;
          }, function (error) {
            $log.error(error);
            self.searching = false;
          });
        }
        return filter.promise;
      }

      /**
       * Blog Tag add event
       */
      self.blogFormData.selectedTags = [];
      function onAddTagItem(item) {
        // self.blogFormData.tagItem = null;
        item.readableName = item.readableName.replace(/\s+/g, "-");
        for (var s = 0; s < self.blogFormData.selectedTags.length; s++) {
          if (self.blogFormData.selectedTags[s].readableName === item.readableName) {
            return;
          }
        }
        self.blogFormData.tagItem = " ";
        self.blogFormData.selectedTags.push(item);
      }

      /**
       * Blog Tag Remove Event
       *
       * @param      {Integer}  index   The index
       */
      function onRemoveTagItem(index) {
        self.blogFormData.selectedTags.splice(index, 1);
      }
    }
  });
