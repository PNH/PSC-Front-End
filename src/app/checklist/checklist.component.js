angular
  .module('app')
  .component('checklistCom', {
    templateUrl: 'app/checklist/template/checklist.html',
    controller: function ($sce) {
      var self = this;
      var checklist = "<ul><li><strong>Interdum</strong> et malesuada fames ac ante ipsum primis in faucibus.</li><li>Cras ut neque in lorem imperdiet scelerisque eget vel nibh.</li><li>Nullam ac molestie nibh.</li><li>Integer ac ligula sit amet velit gravida consectetur.&nbsp;</li></ul>";
      self.checklist = $sce.trustAsHtml(checklist);
    }
  });
