import { format, differenceInDays } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';

// 실제 업무일을 계산하는 함수
const calculateWorkingDays = (start, end, excluded = []) => {
  if (!start || !end) return 0;
  let count = 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const currentDateStr = format(d, 'yyyy-MM-dd');
    if (!excluded.includes(currentDateStr)) {
      count++;
    }
  }
  return count;
};


// 날짜 포맷 함수: YYYY-MM-DD (요일)
const formatDateWithDay = (date, locale) => {
  return format(new Date(date), 'yyyy-MM-dd (eee)', { locale });
};

// 오늘/다음 업무 목록을 재귀적으로 렌더링하는 함수
const renderWorkItemsMarkdown = (items, depth = 0) => {
  let md = '';
  const indent = '    '.repeat(depth);

  items.forEach(item => {
    // 최상위 업무와 이슈만 굵게 처리
    const isTopLevel = depth === 0;
    const isIssue = item.content.startsWith('⚠️');
    const content = (isTopLevel || isIssue) ? `**${item.content}**` : item.content;
    
    md += `${indent}* ${content}\n`;
    if (item.subItems && item.subItems.length > 0) {
      md += renderWorkItemsMarkdown(item.subItems, depth + 1);
    }
  });
  return md;
};

// === 메인 마크다운 생성 함수 (수정됨) ===
export const generateMarkdown = (log, t) => {
  // 현재 언어에 맞는 date-fns 로케일을 선택
  const dateLocale = t('appLanguage') === 'ko' ? ko : enUS;

  // 1. 날짜
  let md = `📅 ${formatDateWithDay(log.date, dateLocale)}\n\n`;

  // 2. 업무 리스트 (헤더부터 번역)
  md += `#### **${t('taskListTitle')}**\n`;
  md += `| ${t('headerNumber')} | ${t('headerTask')} | ${t('headerType')} | ${t('headerDueDate')} | ${t('headerProgress')} | ${t('headerResult')} | ${t('headerNotes')} |\n`;
  md += `|:---:|:---|:---|:---|:---|:---|:---|\n`;
  log.tasks.forEach((task, index) => {
    // === 핵심 수정: 키 값을 번역 함수 t()로 변환 ===
    const taskType = t(`taskTypes.${task.type}`);
    const status = t(`taskStatuses.${task.status}`);
    const progress = `${task.progress}%  (${status})`;
    
    const workingDays = calculateWorkingDays(task.startDate, task.endDate, task.excludedDates);
    const duration = task.startDate && task.endDate
      ? `${format(new Date(task.startDate), 'MM.dd')}-${format(new Date(task.endDate), 'MM.dd')} (${workingDays}일)`
      : '-';
    
    const result = task.resultLink ? `[Link](${task.resultLink})` : '-';
    
    md += `| ${index + 1} | ${task.name} | ${taskType} | ${duration} | ${progress} | ${result} | ${task.notes || ''} |\n`;
  });
  md += '\n';

  // 3. 오늘 진행 업무
  md += `#### **${t('todayWorkTitle')}**\n`;
  md += renderWorkItemsMarkdown(log.todayWork);
  md += '\n';

  // 4. 다음 진행할 업무
  md += `#### **${t('nextWorkTitle')}**\n`;
  md += renderWorkItemsMarkdown(log.nextWork);

  return md;
};