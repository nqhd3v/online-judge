export default {
  'assignment.status': '{ isOpen, select, true, {Opening} other {Closed} }',
  'assignment.finished': 'Finished',
  'assignment.coefficient.error': 'Error',
  'assignment.add': 'Add assignment',
  'assignment.create.success': 'Create assignment successfully!',
  'assignment.delete': 'Delete assignment',
  'assignment.delete.success': 'Delete assignment successfully!',
  'assignment.update': 'Edit assignment',
  'assignment.update.success': 'Updated assignment successfully!',
  'assignment.empty': 'No assignment was created!',
  'assignment.change-selected': 'Showing data for assignment <b>"{name}"</b>. To change, please click to <a href="{link}">here</a>',
  'assignment.select-selected': 'Showing all. To show by assignment, Please click to <a href="{link}">here</a>',
  // Table
  'assignment.table.coefficient': 'Coefficient',
  'assignment.table.submissions': 'Submissions',
  'assignment.table.start-time': 'Start',
  'assignment.table.finish-time': 'Finish',
  'assignment.table.score-board': 'Score board',
  'assignment.table.language': 'Languages',
  'assignment.table.problem-used-in-which-assignment': 'Used in assignments',
  'assignment.table.problem-name': 'Problem name',
  // Form
  'assignment.form.name.label': 'Name',
  'assignment.form.name.placeholder': 'Assignment 01',
  'assignment.form.description.label': 'Description',
  'assignment.form.description.placeholder': 'This assignment is used to...',
  'assignment.form.time.label': 'Time',
  'assignment.form.time.withFinish': 'With finish-time',
  'assignment.form.extra-time.label': 'Extra time (min)',
  'assignment.form.extra-time.placeholder': '60',
  'assignment.form.late-rule.label': 'Coefficient rule',
  'assignment.form.late-rule.description': 'PHP script without <code>&lt;?php ?&gt;</code> tags. You can use with 3 variables: <code>$extra_time</code>, <code>$delay</code>, <code>$submit_time</code>',
  'assignment.form.late-rule.placeholder': 'Coefficient rule',
  'assignment.form.problems.label': 'Problems',
  'assignment.form.problems.description':
    'Select, set name or score for problems in this assignment.<br />Remove one problem from assignment won\'t remove the submissions of that problem but will reset its alias and score to default if you re-add it later.<br />Currently: <span class="special">{count_problems}</span> problems with a total score of <span class="special">{total_score}</span>',
  'assignment.form.problems.search.placeholder': 'Find problem by name',
  'assignment.form.problems.no-selected': 'No problems were selected!',
  'assignment.form.participants.label': 'Participants',
  'assignment.form.participants.description': 'Find and select student, who can do this assignment.',
  'assignment.form.participants.is-public': 'All students',
  'assignment.form.participants.search.placeholder': 'Find by name, or email,...',
  'assignment.form.participants.no-selected': 'No student was selected!',
  'assignment.form.participants.search.no-result': 'No student was found!',
  // Actions
  'assignment.actions.view-problems': 'View problems',
  // Form exceptions
  'exception.assignment.no-do': 'You can not do this assignment because it finished (or not start)!',
  'exception.assignment.form.name.no-named': 'Name is required',
  'exception.assignment.form.participants.no-selected': 'Please select at least of student',
  'exception.assignment.form.problems.no-selected': 'Please select at least of problem',
  // Exceptions
  'exception.assignment.notfound':
    '{ isMany, select, true {These assignments are} other {This assignment is} } not existed in our system!',
};
