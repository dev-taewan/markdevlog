import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { generateMarkdown } from '../utils/markdownGenerator';
import { copyToClipboard, saveAsFile, handleFileLoad } from '../utils/fileHandlers';

function ActionButtons({ workLogData, setWorkLogData, handleReset }) {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef(null);

  const handleCopyMarkdown = () => {
    // === 핵심 수정: t 함수를 두 번째 인자로 전달 ===
    const markdown = generateMarkdown(workLogData, t);
    copyToClipboard(markdown);
  };

  const handleSaveMarkdown = () => {
    // === 핵심 수정: t 함수를 두 번째 인자로 전달 ===
    const markdown = generateMarkdown(workLogData, t);
    saveAsFile(markdown, 'worklog.md', 'text/markdown;charset=utf-8;');
  };

  const handleSaveBackup = () => {
    const json = JSON.stringify(workLogData, null, 2);
    saveAsFile(json, 'worklog-backup.json', 'application/json;charset=utf-8;');
  };
  
  const handleLoadBackup = () => {
    fileInputRef.current.click();
  };

  const confirmAndReset = () => {
    if (window.confirm(t('resetConfirmWarning', 'Are you sure you want to reset all data? This action cannot be undone.'))) {
      handleReset();
    }
  }

  return (
    <div className="action-buttons-container">
      <div className="button-group">
        <button onClick={handleCopyMarkdown} className="button-primary">{t('copyMarkdown')}</button>
        <button onClick={handleSaveMarkdown} className="button-primary">{t('saveMarkdown')}</button>
        <button onClick={handleSaveBackup} className="button-secondary">{t('saveBackup')}</button>
        <button onClick={handleLoadBackup} className="button-secondary">{t('loadBackup')}</button>
        <button onClick={confirmAndReset} className="button-danger">{t('resetData')}</button>
      </div>
      
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