import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

// 날짜 포맷 함수: YYYY-MM-DD (요일)
const formatDateWithDay = (date) => {
  return format(new Date(date), 'yyyy-MM-dd (eee)', { locale: ko });
};

// 기간 계산 및 포맷 함수: MM.DD-MM.DD(N일)
const formatDuration = (start, end) => {
  if (!start) return '';
  const startDate = new Date(start);
  if (!end || start === end) {
    return `${format(startDate, 'MM.dd')}(1)`;
  }
  const endDate = new Date(end);
  const days = differenceInDays(endDate, startDate) + 1;
  return `${format(startDate, 'MM.dd')}-${format(endDate, 'MM.dd')}(${days})`;
};

// 오늘/다음 업무 목록을 재귀적으로 렌더링하는 함수
const renderWorkItemsMarkdown = (items, depth = 0) => {
  let md = '';
  const indent = '    '.repeat(depth); // 4칸 들여쓰기

  items.forEach(item => {
    // 이슈와 일반 업무 제목 모두 굵게 처리
    const title = `**${item.content.replace(/(\⚠️ 이슈)\[(.*)\]/, '$1[$2]')}**`;
    md += `${indent}* ${title}\n`;
    if (item.subItems && item.subItems.length > 0) {
      md += renderWorkItemsMarkdown(item.subItems, depth + 1);
    }
  });
  return md;
};

// 메인 마크다운 생성 함수
export const generateMarkdown = (log) => {
  // 1. 날짜
  let md = `📅 ${formatDateWithDay(log.date)}\n\n`;

  // 2. 업무 리스트
  md += `#### **⏳업무 리스트**\n`;
  md += `| 번호 | 업무 | 종류 | 기한 | 진행률 | 결과물 | 특이사항 |\n`;
  md += `|:---:|:---|:---|:---|:---|:---|:---|\n`;
  log.tasks.forEach((task, index) => {
    const duration = formatDuration(task.startDate, task.endDate);
    const progress = `${task.progress}%${task.status}`;
    const result = task.resultLink ? `[링크](${task.resultLink})` : '-';
    md += `| ${index + 1} | ${task.name} | ${task.type} | ${duration} | ${progress} | ${result} | ${task.notes || ''} |\n`;
  });
  md += '\n';

  // 3. 오늘 진행 업무
  md += `#### **✅ 오늘 진행 업무:**\n`;
  md += renderWorkItemsMarkdown(log.todayWork);
  md += '\n';

  // 4. 다음 진행할 업무
  md += `#### **☑️ 다음 진행할 업무:**\n`;
  md += renderWorkItemsMarkdown(log.nextWork);

  return md;
};