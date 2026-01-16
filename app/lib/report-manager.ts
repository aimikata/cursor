// レポート管理ユーティリティ

export type ReportType = 'research' | 'world' | 'story' | 'panel' | 'image';

export interface SavedReport {
  id: string;
  type: ReportType;
  title: string;
  content: string;
  data?: any; // 構造化データ（JSON形式）
  createdAt: number;
  updatedAt: number;
}

// すべてのレポートを取得（保存は無効化）
export function getAllReports(): SavedReport[] {
  return [];
}

// レポートを保存（保存は無効化）
export function saveReport(report: Omit<SavedReport, 'id' | 'createdAt' | 'updatedAt'>): SavedReport {
  return {
    ...report,
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// レポートを削除（保存は無効化）
export function deleteReport(_reportId: string): void {
  return;
}

// タイプ別にレポートを取得
export function getReportsByType(type: ReportType): SavedReport[] {
  return getAllReports().filter(r => r.type === type);
}

// すべてのレポートを削除
export function clearAllReports(): void {
  return;
}

// すべてのレポートをZIP形式でダウンロード（テキストファイルとして）
export function downloadAllReportsAsZip(): void {
  const reports = getAllReports();
  if (reports.length === 0) {
    alert('保存されたレポートがありません。');
    return;
  }

  // 各レポートをテキストファイルとして作成
  const files: Array<{ name: string; content: string }> = [];
  
  reports.forEach(report => {
    const extension = report.type === 'research' ? 'md' : 'txt';
    const safeTitle = report.title.replace(/[\/\?<>\\:\*\|":]/g, '').replace(/\s+/g, '_');
    files.push({
      name: `${report.type}_${safeTitle}_${new Date(report.createdAt).toISOString().split('T')[0]}.${extension}`,
      content: report.content
    });
  });

  // すべてのファイルを1つのテキストファイルにまとめる
  let combinedContent = `=== マンガスタジオ レポート一式 ===\n`;
  combinedContent += `生成日時: ${new Date().toISOString()}\n`;
  combinedContent += `レポート数: ${reports.length}\n\n`;
  combinedContent += `${'='.repeat(60)}\n\n`;

  reports.forEach((report, index) => {
    combinedContent += `\n【レポート ${index + 1}】\n`;
    combinedContent += `タイプ: ${report.type}\n`;
    combinedContent += `タイトル: ${report.title}\n`;
    combinedContent += `作成日時: ${new Date(report.createdAt).toLocaleString('ja-JP')}\n`;
    combinedContent += `${'-'.repeat(60)}\n\n`;
    combinedContent += report.content;
    combinedContent += `\n\n${'='.repeat(60)}\n\n`;
  });

  // ダウンロード
  const blob = new Blob([combinedContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `manga_studio_reports_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
