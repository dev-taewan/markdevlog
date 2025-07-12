import React from 'react';
import { useTranslation } from 'react-i18next';
import DateRangePicker from './DateRangePicker'; // 1. DateRangePicker 임포트

const taskTypeKeys = ["env", "review", "design", "impl", "bug", "test", "ai", "study"];
const taskStatusKeys = ["waiting", "doing", "done"];

function TaskList({ tasks, onTaskChange, onAddTask, onDeleteTask }) {
  const { t } = useTranslation();

  return (
    <div className="task-table-wrapper">
      <h4><strong>{t('taskListTitle')}</strong></h4>
      <table className="task-table">
        <thead>
          <tr>
            <th>{t('headerNumber')}</th>
            <th>{t('headerTask')}</th>
            <th>{t('headerType')}</th>
            <th>{t('headerDueDate')}</th>
            <th>{t('headerProgress')}</th>
            <th>{t('headerResult')}</th>
            <th>{t('headerNotes')}</th>
            <th>{t('headerDelete')}</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={task.id}>
              <td>{index + 1}</td>
              <td><input type="text" value={task.name} onChange={(e) => onTaskChange(task.id, 'name', e.target.value)} /></td>
              <td>
                <select value={task.type} onChange={(e) => onTaskChange(task.id, 'type', e.target.value)}>
                  {taskTypeKeys.map(key => <option key={key} value={key}>{t(`taskTypes.${key}`)}</option>)}
                </select>
              </td>
              {/* 2. 기한(DueDate) 셀을 새로운 컴포넌트로 교체 */}
              <td>
                <DateRangePicker task={task} onTaskChange={onTaskChange} />
              </td>
              <td className="progress-cell">
                 <input type="range" min="0" max="100" value={task.progress} onChange={(e) => onTaskChange(task.id, 'progress', Number(e.target.value))} />
                 <span>{task.progress}%</span>
                 <select value={task.status} onChange={(e) => onTaskChange(task.id, 'status', e.target.value)}>
                    {taskStatusKeys.map(key => <option key={key} value={key}>{t(`taskStatuses.${key}`)}</option>)}
                 </select>
              </td>
              <td><input type="text" placeholder="Result link" value={task.resultLink} onChange={(e) => onTaskChange(task.id, 'resultLink', e.target.value)} /></td>
              <td><input type="text" value={task.notes} onChange={(e) => onTaskChange(task.id, 'notes', e.target.value)} /></td>
              <td className="action-cell">
                <button onClick={() => onDeleteTask(task.id)} title="Delete row">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-actions">
        <button onClick={onAddTask} className="button-secondary">{t('addRow')}</button>
      </div>
    </div>
  );
}

export default TaskList;