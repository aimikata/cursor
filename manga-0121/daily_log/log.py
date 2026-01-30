# log.py - 今日やったことを1行でログに追記する
import sys
from datetime import datetime

def main():
    if len(sys.argv) < 2:
        print("Usage: python log.py \"やったこと\"")
        print("Example: python log.py \"Chapter3の下書きを書いた\"")
        return
    line = " ".join(sys.argv[1:])
    now = datetime.now()
    log_file = "daily_log.txt"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(f"{now:%Y-%m-%d %H:%M} {line}\n")
    print(f"Logged: {now:%Y-%m-%d %H:%M} {line}")

if __name__ == "__main__":
    main()
