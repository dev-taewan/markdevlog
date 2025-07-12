import React, { forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
// date-fns 로케일을 react-datepicker에 등록합니다.
registerLocale('ko', ko);
/**
 * 시작일, 종료일, 제외할 날짜 배열을 기반으로 실제 업무일을 계산합니다.
 * @param {string | null} start - 시작일 (YYYY-MM-DD)
 * @param {string | null} end - 종료일 (YYYY-MM-DD)
 * @param {string[]} [excluded=[]] - 제외할 날짜 문자열 배열
 * @returns {number} 실제 업무일수
 */
const calculateWorkingDays = (start, end, excluded = []) => {
  if (!start || !end) return 0;

  let count = 0;
  const startDate = new Date(start);
  const endDate = new Date(end);

  // 날짜 비교 시 발생할 수 있는 시간대 문제를 피하기 위해, 각 날짜를 순회하며 비교합니다.
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const currentDateStr = format(d, 'yyyy-MM-dd');
    if (!excluded.includes(currentDateStr)) {
      count++;
    }
  }
  return count;
};

/**
 * 달력 팝업을 여는 커스텀 버튼 컴포넌트입니다.
 * forwardRef를 사용하여 DatePicker가 필요한 ref를 전달할 수 있도록 합니다.
 */
const CustomInputButton = forwardRef(({ children, onClick }, ref) => (
<button type="button" className="date-picker-trigger-button" onClick={onClick} ref={ref}>
{children}
</button>
));

/**
 * 기한 관리를 위한 메인 DateRangePicker 컴포넌트입니다.
 */
const DateRangePicker = ({ task, onTaskChange }) => {
const { t } = useTranslation(); // 3. t 함수 가져오기

  // task 객체에서 날짜 정보를 가져와 Date 객체로 변환합니다.
  const startDate = task.startDate ? new Date(task.startDate + 'T00:00:00') : null;
  const endDate = task.endDate ? new Date(task.endDate + 'T00:00:00') : null;

  // DatePicker의 날짜 범위가 변경될 때 호출되는 핸들러입니다.
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    onTaskChange(task.id, 'startDate', start ? format(start, 'yyyy-MM-dd') : null);
    onTaskChange(task.id, 'endDate', end ? format(end, 'yyyy-MM-dd') : null);
  };

  /**
   * 달력의 각 날짜 셀을 커스텀 렌더링하는 함수입니다.
   * 이를 통해 우클릭 이벤트를 제어할 수 있습니다.
   * @param {number} day - 날짜 숫자 (e.g., 15)
   * @param {Date} date - 해당 날짜의 전체 Date 객체
   */
  const renderDayContents = (day, date) => {
    const dayStr = format(date, 'yyyy-MM-dd');
    const isExcluded = (task.excludedDates || []).includes(dayStr);

    // 오른쪽 클릭 이벤트 핸들러
    const handleContextMenu = (e) => {
      // 브라우저의 기본 우클릭 메뉴를 막습니다.
      e.preventDefault();

      const currentExcluded = task.excludedDates || [];
      let newExcluded;

      if (isExcluded) {
        // 이미 제외된 날짜면, 다시 포함시킵니다.
        newExcluded = currentExcluded.filter(d => d !== dayStr);
      } else {
        // 새로 제외할 날짜를 목록에 추가합니다.
        newExcluded = [...currentExcluded, dayStr];
      }
      onTaskChange(task.id, 'excludedDates', newExcluded.sort());
    };

    return (
      <div
        className={isExcluded ? 'custom-day excluded-day' : 'custom-day'}
        onContextMenu={handleContextMenu}
        title={t('toggleHolidays')}
      >
        {day}
      </div>
    );
  };

  // 계산된 실제 업무일을 구합니다.
  const workingDays = calculateWorkingDays(task.startDate, task.endDate, task.excludedDates);

  // 셀 안에 항상 표시될 텍스트를 생성합니다.
  const durationText = task.startDate && task.endDate
    ? `${format(startDate, 'MM.dd')} - ${format(endDate, 'MM.dd')} (${workingDays}${t('workDuration')})`
    : t('scheduleNotset');

  return (
    <div className="date-picker-cell-layout">
      {/* 정보 텍스트 표시 영역 */}
      <span className="duration-text-display">{durationText}</span>

      {/* DatePicker 팝업 영역 */}
      <DatePicker
        locale="ko"
        selected={startDate}
        onChange={handleDateChange}
        startDate={startDate}
        endDate={endDate}
        renderDayContents={renderDayContents}
        selectsRange
        monthsShown={2}
        customInput={<CustomInputButton>{t('scheduleEditBtn')}</CustomInputButton>}
        popperPlacement="bottom-end"
      />
    </div>
  );
};

export default DateRangePicker;