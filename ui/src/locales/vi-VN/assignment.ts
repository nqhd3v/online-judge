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
  // Coefficient-rules
  'assignment.coefficient-rules.warning': '<b>Cảnh báo! Thiết lập của bạn dường như có một chút vấn đề:</b>',
  // Form exceptions
  'exception.assignment.no-do': 'Bạn không thể thực hiện bài thi này vì nó đã kết thúc (hoặc chưa bắt đầu)',
  'exception.assignment.form.name.no-named': 'Vui lòng nhập tên bài thi',
  'exception.assignment.form.participants.no-selected': 'Vui lòng chọn ít nhất 1 học viên',
  'exception.assignment.form.problems.no-selected': 'Vui lòng chọn ít nhất 1 vấn đề',
  // Form - Coefficient rule
  'exception.assignment.form.coefficient-rules.error-need-fix': 'Vui lòng chỉnh sửa các thiết lập hệ số đúng theo định dạng!',
  'exception.assignment.form.coefficient-rules.no-effect': 'Bài thi này không có thời gian kết thúc, hoặc không cho phép nộp muộn (<code>Thời gian thêm</code> = 0), nên việc có hay không thiết lập hệ số không ảnh hưởng đến kết quả!.',

  'exception.assignment.form.coefficient-rules.invalid': 'Danh sách thiết lập không đúng định dạng!',
  'exception.assignment.form.coefficient-rule.invalid': 'Thiết lập này không đúng định dạng!',

  'exception.assignment.form.coefficient-rule.time-range.invalid': 'Phạm vi trễ không hợp lệ (0 <= <code>Phạm vi trễ 1</code> < <code>Phạm vi trễ 2</code> <= 1440).',
  'exception.assignment.form.coefficient-rule.base-mins.invalid': 'Thời gian nền không hợp lệ (0 <= <code>Thời gian nền</code>).',
  'exception.assignment.form.coefficient-rule.time-range.smaller-extra': 'Thời gian thêm của bạn quá ngắn so với phạm vi trễ và thời gian nền (<code>Phạm vi trễ</code> + <code>Thời gian nền</code> <= <code>Thời gian thêm</code>).',
  'exception.assignment.form.coefficient-rule.coefficient-value.empty': 'Vui lòng không để trống giá trị hệ số!',
  'exception.assignment.form.coefficient-rule.coefficient-value.conflict': 'Một lỗi nào đó đã xảy ra khiến thiết lập này bị lỗi! Tải lại trang để thử lại!',
  'exception.assignment.form.coefficient-rule.coefficient-value.const-invalid': 'Giá trị hệ số không hợp lệ (0 <= <code>Hệ số</code> <= 100).',
  'exception.assignment.form.coefficient-rule.coefficient-value.vot-invalid': 'Giá trị biến thêm không hợp lệ (0 <= <code>Giá trị biến thiên đầu</code> < <code>Giá trị biến thiên cuối</code> <= 100)',
  // Exceptions
  'exception.assignment.get-problems.unknown': 'Một lỗi nào đó đã xảy ra lúc truy vấn danh sách vấn đề cần giải quyết!',
  'exception.assignment.notfound':
    '{ isMany, select, true {Các b} other {B} }ài thi này không tồn tại trong hệ thống!',
};
