angular
  .module('app')
  .component('blogCom', {
    templateUrl: 'app/blog/template/blog.html',
    controller: function ($log, $q, $state, $window, BlogSDK, UserSDK, moment, blockUI) {
      var self = this;

      self.blogs = [];
      self.archives = [];
      self.userId = UserSDK.getUserId();

      // Loaders
      const blogPostsLoad = blockUI.instances.get('blogPostsLoading');
      const blogArchivesLoad = blockUI.instances.get('blogArchivesLoading');
      self.isLoadingBlogs = false;

      // Pagination
      var _pagination = {
        index: 1,
        limit: 10
      };
      self.hasReachedEnd = false;

      // Models
      self.orderBy = 1;
      self.searchModel = null;
      self.searchedQuery = null;
      self.archive = {
        year: null,
        month: null
      };

      // *************************************************

      self.onArchiveClicked = changeArchives;
      self.resetArchive = resetArchives;
      self.loadBlogPosts = loadBlogs;
      self.searchBlogPosts = searchPosts;
      self.filterBlogPosts = filterBlogPosts;
      self.goToBlogPost = goToBlogPost;
      self.onBlogSearchClear = onBlogSearchClear;

      _init();

      function _init() {
        _getBlogs();
        getArchives();
      }

      // **************************************************

      /**
       * Get blog posts
       *
       * @param {Integer} page Page index
       * @param {Integer} order Posts order (1: Latest, 2: Popular)
       * @param {String} search Search query
       * @param {Integer} year Year
       * @param {Integer} month Month
       * @returns Blog posts
       */
      function getBlogs(page, order, search, year, month) {
        var deferred = $q.defer();
        BlogSDK.getBlogs(page.index, page.limit, order, false, search, year, month ? moment().month(month).format('M') : month).then(function (response) {
          if (response.content === null) {
            self.hasReachedEnd = true;
          } else if (response.content.length < page.limit) {
            self.blogs = self.blogs.concat(response.content);
            self.hasReachedEnd = true;
          } else if (!response.content.length < page.limit) {
            self.blogs = self.blogs.concat(response.content);
          }
          page.index += 1;
          deferred.resolve();
        }, function (error) {
          $log.error(error);
          self.hasReachedEnd = true;
          deferred.reject();
        });
        return deferred.promise;
      }

      /**
       * Get blogs init
       */
      function _getBlogs() {
        blogPostsLoad.start();
        self.blogs = [];
        self.hasReachedEnd = false;
        _pagination.index = 1;
        getBlogs(_pagination, self.orderBy, self.searchModel, self.archive.year, self.archive.month).then(function () {
          blogPostsLoad.stop();
        }, function () {
          blogPostsLoad.stop();
        });
      }

      /**
       * Load blogs
       */
      function loadBlogs() {
        self.isLoadingBlogs = true;
        getBlogs(_pagination, self.orderBy, self.searchModel, self.archive.year, self.archive.month).then(function () {
          self.isLoadingBlogs = false;
        }, function () {
          self.isLoadingBlogs = false;
        });
      }

      /**
       * Search blog posts
       *
       * @param {String} query Search query
       */
      function searchPosts(query) {
        resetArchives();
        self.searchModel = query;
        self.searchedQuery = query;
        _getBlogs();
      }

      /**
       * Get blog archives
       *
       * @returns Archives
       */
      function getArchives() {
        blogArchivesLoad.start();
        BlogSDK.getArchives().then(function (response) {
          self.archives = response.content;
          blogArchivesLoad.stop();
        }, function (error) {
          $log.error(error);
          blogArchivesLoad.stop();
        });
      }

      /**
       * Get blog posts from archives
       *
       * @param {Integer} y Year
       * @param {String} m Month name
       */
      function changeArchives(y, m) {
        // onBlogSearchClear();
        self.searchModel = null;
        self.searchedQuery = null;
        self.archive = {
          year: y,
          month: m
        };
        _getBlogs();
      }

      /**
       * Reset selected archive
       */
      function resetArchives() {
        self.archive = {
          year: null,
          month: null
        };
        _getBlogs();
      }

      /**
       * Change blog posts filter
       *
       * @param {Integer} filter Posts filter (1: Latest, 2: Popular)
       */
      function filterBlogPosts(filter) {
        self.orderBy = filter;
        self.searchModel = null;
        self.searchedQuery = null;
        self.archive = {
          year: null,
          month: null
        };
        _getBlogs();
      }

      /**
       * Check user and Go to Blog post
       */
      function goToBlogPost(blog) {
        if (blog.privacy === "everyone" || self.userId) {
          $state.go('blogdetail', ({slug: blog.slug}));
        } else {
          $state.go('^.blog', ({blogslug: blog.slug}));
          angular.element('#authenticationPopup').modal('show');
        }
      }

      /**
       * Reset Blog Search
       */
      function onBlogSearchClear() {
        self.searchModel = null;
        self.searchedQuery = null;
        _getBlogs();
      }

      if ($window.innerWidth > 1200) {
        self.blogTitleTruncateLimit = 65;
      } else if ($window.innerWidth > 1000) {
        self.blogTitleTruncateLimit = 55;
      } else if ($window.innerWidth > 700) {
        self.blogTitleTruncateLimit = 155;
      } else if ($window.innerWidth > 600) {
        self.blogTitleTruncateLimit = 140;
      } else if ($window.innerWidth > 400) {
        self.blogTitleTruncateLimit = 80;
      } else if ($window.innerWidth > 300) {
        self.blogTitleTruncateLimit = 70;
      }
    }
  });
