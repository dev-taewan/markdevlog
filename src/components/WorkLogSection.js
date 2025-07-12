import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function WorkLogItem({ item, path, onUpdate, onDelete, onAddSubItem, onAddIssue, isTopLevel = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.content);

  const handleUpdate = () => {
    onUpdate(path, editText);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleUpdate();
    else if (e.key === 'Escape') setIsEditing(false);
  };

  const isIssue = item.content.startsWith('⚠️');
  const isBold = isTopLevel || isIssue;

  return (
    <li>
      <div className="worklog-item">
        <div className="worklog-item-content">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleUpdate}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <span
              className={`item-text ${isBold ? 'is-bold' : ''}`}
              onDoubleClick={() => setIsEditing(true)}
              title="Double click to edit"
            >
              {item.content}
            </span>
          )}
          <div className="worklog-item-actions">
            <button onClick={() => onAddSubItem(path)} title="Add sub-item">➕</button>
            <button onClick={() => onAddIssue(path)} title="Add issue">💥</button>
            <button onClick={() => setIsEditing(true)} title="Edit">✏️</button>
            <button onClick={() => onDelete(path)} title="Delete">🗑️</button>
          </div>
        </div>
        {item.subItems && item.subItems.length > 0 && (
          <ul className="worklog-sub-items">
            {item.subItems.map((subItem, index) => (
              <WorkLogItem
                key={subItem.id}
                item={subItem}
                path={`${path}.subItems.${index}`}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddSubItem={onAddSubItem}
                onAddIssue={onAddIssue}
                isTopLevel={false}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function WorkLogSection({ title, items, allTasks, onItemsChange }) {
  const { t } = useTranslation();
  const [selectedTask, setSelectedTask] = useState('');

  const updateItems = (callback) => {
    const newItems = JSON.parse(JSON.stringify(items));
    callback(newItems);
    onItemsChange(newItems);
  };

  const handleUpdate = (path, newContent) => {
    updateItems(draft => {
      const pathParts = path.split('.');
      let target = draft;
      for (let i = 0; i < pathParts.length - 1; i++) target = target[pathParts[i]];
      target[pathParts[pathParts.length - 1]].content = newContent;
    });
  };

  const handleDelete = (path) => {
    if (!window.confirm(`${t('confirmDeleteWorkList')}`)) return;
    updateItems(draft => {
      const pathParts = path.split('.');
      const index = parseInt(pathParts.pop());
      const parentPath = pathParts;
      let target = draft;
      for (let i = 0; i < parentPath.length; i++) target = target[parentPath[i]];
      target.splice(index, 1);
    });
  };

  const addSubItemToPath = (path, content) => {
    updateItems(draft => {
      const pathParts = path.split('.');
      let target = draft;
      for (let i = 0; i < pathParts.length; i++) target = target[pathParts[i]];
      if (!target.subItems) target.subItems = [];
      target.subItems.push({ id: Date.now(), content, subItems: [] });
    });
  };
 t()
  const handleAddSubItem = (path) => addSubItemToPath(path, "New sub-item");
  const handleAddIssue = (path) => addSubItemToPath(path, `⚠️ ${t('issueTile')} [${t('issueDescription')}]`);
  
  const handleAddTopLevelItem = (content) => {
    const newItems = [...items, { id: Date.now(), content, subItems: [] }];
    onItemsChange(newItems);
  };

  return (
    <div className="worklog-section">
      <h4><strong>{title}</strong></h4>
      <ul>
        {items.map((item, index) => (
          <WorkLogItem
            key={item.id}
            item={item}
            path={`${index}`}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAddSubItem={handleAddSubItem}
            onAddIssue={handleAddIssue}
            isTopLevel={true}
          />
        ))}
      </ul>
      <div className="worklog-section-adder">
        <select value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)}>
          <option value="">{t('selectFromList')}</option>
          {allTasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
        </select>
        <button onClick={() => selectedTask && handleAddTopLevelItem(allTasks.find(t => t.id == selectedTask)?.name || '')} className="button-secondary">{t('addTask')}</button>
        <button onClick={() => handleAddTopLevelItem(`⚠️ ${t('issueTile')} [${t('issueDescription')}]`)} className="button-secondary">{t('addIssue')}</button>
      </div>
    </div>
  );
}

export default WorkLogSection;