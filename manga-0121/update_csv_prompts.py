import csv
import os

# 追加するヘッダー
HEADER_TEXT = """◆CRITICAL: Refer to [Ref: REF_IMG_N] and reproduce the character 100% accurately.
[Ref: REF_IMG_1] :: [Alex.png]
[Ref: REF_IMG_2] :: [Cursor.png]
[Ref: REF_IMG_3] :: [David.png]
◆【NOTE】Words enclosed in 【brackets】 denote emotions or situations

"""

def update_csv_prompts(input_file, output_file):
    """CSVファイルのC列プロンプトを更新"""
    rows = []
    
    # CSVファイルを読み込み
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)  # ヘッダー行
        rows.append(header)
        
        for row in reader:
            if len(row) >= 3:
                # C列（index 2）のプロンプトを修正
                original_prompt = row[2]
                
                # 既に追加されている場合はスキップ
                if "◆CRITICAL: Refer to [Ref: REF_IMG_N]" not in original_prompt:
                    row[2] = HEADER_TEXT + original_prompt
                
                rows.append(row)
            else:
                rows.append(row)
    
    # 修正したCSVファイルを書き込み
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    
    print(f"[OK] Updated: {os.path.basename(output_file)}")

def main():
    # 現在のディレクトリ
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 全19章を処理
    for i in range(1, 20):
        input_file = os.path.join(base_dir, f"cursor-chapter{i}.csv")
        output_file = os.path.join(base_dir, f"cursor-chapter{i}-updated.csv")
        
        if os.path.exists(input_file):
            update_csv_prompts(input_file, output_file)
        else:
            print(f"[SKIP] File not found: cursor-chapter{i}.csv")
    
    print("\n[SUCCESS] All CSV files updated successfully!")
    print("\n[NOTE] Updated files are saved as 'cursor-chapter{N}-updated.csv'")
    print("Please review the updated files and replace the originals if satisfied.")

if __name__ == "__main__":
    main()
