export default {
  'assignment.status': '{isOpen, select, true {Đang mở} other {Đã đóng} }',
  'assignment.finished': 'Đã kết thúc',
  'assignment.coefficient.error': 'Lỗi',
  'assignment.add': 'Thêm bài thi',
  'assignment.create.success': 'Tạo bài thi thành công!',
  'assignment.delete': 'Xoá bài thi',
  'assignment.delete.success': 'Xoá bài thi thành công!',
  'assignment.update': 'Cập nhật bài thi',
  'assignment.update.success': 'Cập nhật bài thi thành công',
  'assignment.empty': 'Hiện tại không có bài thi nào!',
  'assignment.search': 'Tìm bằng tên, chú thích,...',
  'assignment.change-selected': 'Đang hiển thị thông tin cho bài thi <b>"{name}"</b>. Để thay đổi bài thi, vui lòng nhấn vào <a href="{link}">đây</a>.',
  'assignment.select-selected': 'Đang hiển thị tất cả. Để hiển thị theo bài thi, vui lòng nhấn vào <a href="{link}">đây</a>.',
  // Table
  'assignment.table.coefficient': 'Hệ số',
  'assignment.table.submissions': 'Lượt nộp bài',
  'assignment.table.start-time': 'Bắt đầu',
  'assignment.table.finish-time': 'Kết thúc',
  'assignment.table.score-board': 'Bảng điểm',
  'assignment.table.language': 'Ngôn ngữ',
  'assignment.table.problem-used-in-which-assignment': 'Sử dụng trong các bài thi',
  'assignment.table.problem-name': 'Tên vấn đề',
  // Form
  'assignment.form.name.label': 'Tên bài thi',
  'assignment.form.name.placeholder': 'Thi thử đợt 1',
  'assignment.form.description.label': 'Chú thích',
  'assignment.form.description.placeholder': 'Bài thi này được sử dụng cho...',
  'assignment.form.time.label': 'Thời gian diễn ra',
  'assignment.form.time.withFinish': 'Kèm thời gian kết thúc',
  'assignment.form.extra-time.label': 'Thời gian thêm (phút)',
  'assignment.form.extra-time.placeholder': '60',
  'assignment.form.late-rule.label': 'Coefficient rule',
  'assignment.form.late-rule.description': 'Mã PHP không đi kèm <code>&lt;?php ?&gt;</code> tags. Bạn có thể sử dụng 3 biến: <code>$extra_time</code>, <code>$delay</code>, <code>$submit_time</code>',
  'assignment.form.late-rule.placeholder': 'Coefficient rule',
  'assignment.form.problems.label': 'Vấn đề',
  'assignment.form.problems.description':
    'Chọn, đặt tên, điểm và thứ tự cho các vấn đề xuất hiện trong bài thi này.<br />Nếu bạn xoá các vấn đề bên dưới, các bài nộp của vấn đề đó sẽ không xoá theo mà tên và điểm của vấn đề sẽ được đặt lại lúc bạn thêm nó vào lại bài thi.<br />Bạn đã thêm <span class="special">{count_problems}</span> vấn đề cùng tổng điểm là <span class="special">{total_score}</span>',
  'assignment.form.problems.search.placeholder': 'Tìm vấn đề bằng tên',
  'assignment.form.problems.search.no-result': 'Không tìm thấy vấn đề nào!',
  'assignment.form.problems.no-selected': 'Không có vấn đề nào được chọn',
  'assignment.form.participants.label': 'Học viên',
  'assignment.form.participants.description': 'Chọn và thêm những học viên có thể làm bài thi này.',
  'assignment.form.participants.is-public': 'Tất cả học viên',
  'assignment.form.participants.search.placeholder': 'Tìm kiếm bằng tên hoặc email,...',
  'assignment.form.participants.no-selected': 'Không có học viên nào được chọn',
  'assignment.form.participants.search.no-result': 'Không tìm thấy học viên nào!',
  // Actions
  'assignment.actions.view-problems': 'Xem vấn đề',
  // Form exceptions
  'exception.assignment.no-do': 'Bạn không thể thực hiện bài thi này vì nó đã kết thúc (hoặc chưa bắt đầu)',
  'exception.assignment.form.name.no-named': 'Vui lòng nhập tên bài thi',
  'exception.assignment.form.participants.no-selected': 'Vui lòng chọn ít nhất 1 học viên',
  'exception.assignment.form.problems.no-selected': 'Vui lòng chọn ít nhất 1 vấn đề',
  // Exceptions
  'exception.assignment.notfound':
    '{ isMany, select, true {Các b} other {B} }ài thi này không tồn tại trong hệ thống!',
};
