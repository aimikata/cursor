/**
 * FB広告セミナー書き起こしをスプレッドシート用CSV/TSVに変換
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fbDir = path.resolve(__dirname, 'fb広告書き起こし');
const outDir = path.join(__dirname, '広告関連');

function cleanText(text) {
  if (!text || !text.trim()) return '';
  return text.replace(/\s+/g, '').replace(/　/g, '');
}

function formatTime(str) {
  const m = str.match(/(\d+):(\d{2})/);
  if (m) {
    const min = parseInt(m[1], 10);
    const sec = parseInt(m[2], 10);
    if (min >= 60) {
      return `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
    return `${min}:${String(sec).padStart(2, '0')}`;
  }
  return str;
}

const mokutekiMap = {
  'fb1-1': 'セミナー全体の把握・学習ゴールの理解',
  'fb1-2': 'ビジネスマネージャー作成手順の習得',
  'fb1-3': '広告アカウント作成と紐付けの理解',
  'fb2-1': '広告の全体像とプラン→DO→OBSERVEの理解',
  'fb2-2': '広告構造と媒体特性の理解',
  'fb2-3': '運用よりクリエイティブ重視の考え方の定着',
  'fb3-1': '購買意欲レベル（AISAS）の概念理解',
  'fb3-2': '各レベル別アプローチ手法の習得',
  'fb4-1': 'リサーチの3要素と価値訴求の理解',
  'fb4-2': '顧客リサーチの具体的進め方',
  'fb4-3': '商品・競合リサーチの具体的進め方',
  'fb4-4': 'リサーチ結果のまとめ方',
  'fb5-1': '見出しの重要性とテストの考え方',
  'fb5-2': '見出し作成の具体的手法',
  'fb5-3': '見出しのよくある間違いの回避',
  'fb6-1': 'ボディコピーの基本と好まれるコンテンツの理解',
  'fb6-2': 'ボディコピー作成の型の習得',
  'fb6-3': 'ボディコピーの具体例と実践',
  'fb6-4': 'ボディコピーの検証と改善',
  'fb7-1': '広告画像の考え方と注意を引く画像の理解',
  'fb7-2': '画像選定の具体的手法',
  'fb7-3': '画像検索と素材活用の実践',
  'fb8-1': '重要指標（CPA・CTR・CVR）の理解',
  'fb8-2': '数値分析と改善ポイントの特定',
  'fb8-3': '広告マネージャーでの指標確認方法',
  'fbfuroku': '出稿実作業デモ・操作手順の習得',
};

function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\n/);
  const blocks = [];
  let currentTime = '';
  let currentContent = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(\d{1,2}:\d{2}(?::\d{2})?):\s*(.*)$/);
    if (match) {
      if (currentTime && currentContent.length > 0) {
        blocks.push({ start: currentTime, content: cleanText(currentContent.join(' ')) });
      }
      currentTime = match[1];
      currentContent = [match[2].trim()];
    } else if (currentContent.length > 0 && trimmed) {
      currentContent.push(trimmed);
    }
  }
  if (currentTime && currentContent.length > 0) {
    blocks.push({ start: currentTime, content: cleanText(currentContent.join(' ')) });
  }
  return blocks;
}

function getTimeRange(blocks, index) {
  const start = formatTime(blocks[index].start);
  const end = index < blocks.length - 1 ? formatTime(blocks[index + 1].start) : '〜';
  return `${start} - ${end}`;
}

if (!fs.existsSync(fbDir)) {
  console.error('Folder not found:', fbDir);
  process.exit(1);
}
const allFiles = fs.readdirSync(fbDir);
const files = allFiles
  .filter(f => f.endsWith('.txt') && f.includes('fb'))
  .sort((a, b) => {
    if (a.includes('furoku')) return 1;
    if (b.includes('furoku')) return -1;
    const numA = a.match(/fb(\d+)-(\d+)/);
    const numB = b.match(/fb(\d+)-(\d+)/);
    if (numA && numB) {
      return (parseInt(numA[1], 10) * 10 + parseInt(numA[2], 10)) -
             (parseInt(numB[1], 10) * 10 + parseInt(numB[2], 10));
    }
    return a.localeCompare(b);
  });

const rows = [['ステップ', 'タイムコード', '項目狙い', '書き起こし']];

for (const file of files) {
  const baseName = path.basename(file, '.txt');
  const stepKey = baseName.replace(/\s+/g, '');
  const mokuteki = mokutekiMap[stepKey] || '該当ブロックの学習ポイント';
  const stepLabel = baseName.includes('furoku')
    ? '付録'
    : baseName.replace(/^fb/, 'ステップ').replace(/\s+/g, '');

  const blocks = parseFile(path.join(fbDir, file));
  for (let i = 0; i < blocks.length; i++) {
    if (!blocks[i].content) continue;
    const komoku = blocks.length === 1
      ? mokuteki
      : i === 0
        ? `${mokuteki} - 全体像`
        : `${mokuteki} - 手順${i}`;
    rows.push([stepLabel, getTimeRange(blocks, i), komoku, blocks[i].content]);
  }
}

function escapeCsv(val) {
  const s = String(val);
  return (s.includes(',') || s.includes('"') || s.includes('\n')) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'FB広告セミナー_書き起こし_スプレッドシート用.csv'), '\uFEFF' + rows.map(r => r.map(escapeCsv).join(',')).join('\n'), 'utf8');
fs.writeFileSync(path.join(outDir, 'FB広告セミナー_書き起こし_貼り付け用.tsv'), rows.map(r => r.join('\t')).join('\n'), 'utf8');

console.log('FB広告セミナー書き起こし: %dブロックをCSV/TSVに出力しました', rows.length - 1);
