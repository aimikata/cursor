import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

type LicenseResult = {
  features: string[];
};

const FEATURE_MAP: Record<string, string> = {
  C: 'manga', // access_manga
  D: 'ehon',  // access_ehon
  E: 'gift',  // access_gift
  F: 'biz',   // access_biz
};

function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error('Missing Google Sheets environment variables');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, '\n'), // 環境変数の \n を実際の改行に変換
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, spreadsheetId };
}

export async function POST(req: NextRequest) {
  try {
    const { email, licenseKey } = await req.json();

    if (!email || !licenseKey) {
      return NextResponse.json(
        { error: 'email and licenseKey are required' },
        { status: 400 }
      );
    }

    const { sheets, spreadsheetId } = getSheetsClient();

    // A列〜F列のデータを取得（2行目以降、1行目はヘッダー想定）
    const range = 'A2:F';
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = data.values ?? [];

    // ライセンスキー（A列）とメールアドレス（B列）で照合
    const matchedRow = rows.find(
      (row) =>
        (row[0] ?? '').trim() === licenseKey.trim() &&
        (row[1] ?? '').trim().toLowerCase() === email.trim().toLowerCase()
    );

    if (!matchedRow) {
      return NextResponse.json(
        { features: [] satisfies string[] },
        { status: 200 }
      );
    }

    // C列〜F列の値をチェック（'active' なら有効）
    const features: string[] = [];
    const columns = ['C', 'D', 'E', 'F'] as const;
    
    columns.forEach((col, index) => {
      const value = (matchedRow[2 + index] ?? '').trim().toLowerCase();
      if (value === 'active') {
        features.push(FEATURE_MAP[col]);
      }
    });

    const result: LicenseResult = { features };
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('License verification error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
