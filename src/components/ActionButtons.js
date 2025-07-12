import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next'; // 1. 다국어 훅 임포트
import { generateMarkdown } from '../utils/markdownGenerator';
import { copyToClipboard, saveAsFile, handleFileLoad } from '../utils/fileHandlers';

// 2. handleReset 함수를 props로 받도록 추가
function ActionButtons({ workLogData, setWorkLogData, handleReset }) {
  const { t, i18n } = useTranslation(); // 3. 다국어 훅 사용
  const fileInputRef = useRef(null);

  const handleCopyMarkdown = () => {
    const markdown = generateMarkdown(workLogData, t); // t 함수 전달
    copyToClipboard(markdown);
  };

  const handleSaveMarkdown = () => {
    const markdown = generateMarkdown(workLogData, t); // t 함수 전달
    saveAsFile(markdown, 'worklog.md', 'text/markdown;charset=utf-8;');
  };

  const handleSaveBackup = () => {
    const json = JSON.stringify(workLogData, null, 2);
    saveAsFile(json, 'worklog-backup.json', 'application/json;charset=utf-8;');
  };
  
  const handleLoadBackup = () => {
    fileInputRef.current.click();
  };

  // 4. 초기화 확인 및 실행 함수
  const confirmAndReset = () => {
    if (window.confirm('정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      handleReset();
    }
  }

  return (
    <div className="action-buttons-container">
      {/* 기능 버튼 그룹 */}
      <div className="button-group">
        <button onClick={handleCopyMarkdown} className="button-primary">{t('copyMarkdown')}</button>
        <button onClick={handleSaveMarkdown} className="button-primary">{t('saveMarkdown')}</button>
        <button onClick={handleSaveBackup} className="button-secondary">{t('saveBackup')}</button>
        <button onClick={handleLoadBackup} className="button-secondary">{t('loadBackup')}</button>
        {/* 5. 초기화 버튼 추가 */}
        <button onClick={confirmAndReset} className="button-danger">{t('resetData')}</button>
      </div>
      
      {/* 6. 언어 선택 버튼 그룹 (위치 이동) */}
      <div className="language-switcher">
          <button onClick={() => i18n.changeLanguage('ko')} className={i18n.language.startsWith('ko') ? 'active' : ''}>KO</button>
          <button onClick={() => i18n.changeLanguage('en')} className={i18n.language.startsWith('en') ? 'active' : ''}>EN</button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={(e) => handleFileLoad(e, setWorkLogData)}
      />
    </div>
  );
}

export default ActionButtons;