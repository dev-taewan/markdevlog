import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import './App.css';
import TaskList from './components/TaskList';
import WorkLogSection from './components/WorkLogSection';
import ActionButtons from './components/ActionButtons';
import { useTranslation } from 'react-i18next';
import "react-datepicker/dist/react-datepicker.css";
// 1. 초기 데이터를 별도 상수로 분리
const initialWorkLogData = {
  date: new Date(),
  tasks: [],
  todayWork: [],
  nextWork: [],
};

function App() {
  const { t, i18n } = useTranslation();
  const [dateLocale, setDateLocale] = useState(ko);

  const [workLogData, setWorkLogData] = useState(() => {
    const savedData = localStorage.getItem('workLogData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      parsed.date = new Date(parsed.date);
      return parsed;
    }
    return initialWorkLogData;
  });

  useEffect(() => {
    localStorage.setItem('workLogData', JSON.stringify(workLogData));
  }, [workLogData]);

  // 언어가 변경될 때 date-fns의 로케일도 함께 변경
  useEffect(() => {
    setDateLocale(i18n.language.startsWith('ko') ? ko : enUS);
  }, [i18n.language]);

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value + 'T00:00:00');
    setWorkLogData(prev => ({ ...prev, date: selectedDate }));
  };

  const handleTaskChange = (taskId, field, value) => {
    setWorkLogData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, [field]: value } : task
      ),
    }));
  };

  const handleAddTask = () => {
    const newId = workLogData.tasks.length > 0 ? Math.max(...workLogData.tasks.map(t => t.id)) + 1 : 1;
    const newTask = {
      id: newId,
      name: 'New Task',
      type: 'impl',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      progress: 0,
      status: 'waiting',
      resultLink: '',
      notes: '',
    };
    setWorkLogData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm(t('confirmDelete'))) {
      setWorkLogData(prev => ({
        ...prev,
        tasks: prev.tasks.filter(task => task.id !== taskId),
      }));
    }
  };

  // 2. 데이터 초기화 함수 정의
  const handleReset = () => {
    localStorage.removeItem('workLogData');
    setWorkLogData(initialWorkLogData);
  };

  const handleTodayWorkChange = (newItems) => {
    setWorkLogData(prev => ({ ...prev, todayWork: newItems }));
  };

  const handleNextWorkChange = (newItems) => {
    setWorkLogData(prev => ({ ...prev, nextWork: newItems }));
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="date-selector" >
          📅 {format(workLogData.date, 'yyyy-MM-dd (eee)', { locale: dateLocale })}
          <input type="date" value={format(workLogData.date, 'yyyy-MM-dd')} onChange={handleDateChange} />
        </div>
        {/* 3. handleReset 함수를 prop으로 전달 */}
        <ActionButtons 
            workLogData={workLogData} 
            setWorkLogData={setWorkLogData} 
            handleReset={handleReset} 
        />
      </header>

      <main>
        <TaskList
          tasks={workLogData.tasks}
          onTaskChange={handleTaskChange}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
        />
        <WorkLogSection
          title={t('todayWorkTitle')}
          items={workLogData.todayWork}
          allTasks={workLogData.tasks}
          onItemsChange={handleTodayWorkChange}
        />
        <WorkLogSection
          title={t('nextWorkTitle')}
          items={workLogData.nextWork}
          allTasks={workLogData.tasks}
          onItemsChange={handleNextWorkChange}
        />
      </main>
    </div>
  );
}

export default App;