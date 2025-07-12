// 클립보드에 복사
export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('마크다운이 클립보드에 복사되었습니다.');
  }, (err) => {
    alert('복사에 실패했습니다: ' + err);
  });
};

// 파일로 저장
export const saveAsFile = (text, filename, type) => {
  const blob = new Blob([text], { type });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 파일 불러오기 이벤트 핸들러
export const handleFileLoad = (event, onFileParsed) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      const parsedJson = JSON.parse(content);
      // JSON 객체에서 날짜 문자열을 다시 Date 객체로 변환
      if (parsedJson.date) {
        parsedJson.date = new Date(parsedJson.date);
      }
      onFileParsed(parsedJson);
      alert('데이터를 성공적으로 불러왔습니다.');
    } catch (error) {
      alert('파일을 불러오는 데 실패했습니다. 유효한 JSON 백업 파일인지 확인해주세요.');
      console.error("Failed to parse JSON file:", error);
    }
  };
  reader.readAsText(file);

  // 같은 파일을 다시 선택해도 onChange 이벤트가 발생하도록 value를 초기화
  event.target.value = null;
};