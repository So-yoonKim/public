"""SRTM 1-arc-second 타일(N33E126.hgt.gz)에서 제주도 범위를 잘라 웹용 높이맵(uint16 little-endian, 미터)으로 저장합니다.

사용 (numpy 가 있는 파이썬, 예: Blender 번들 파이썬):
  blender -b --python tools/make_dem.py -- <N33E126.hgt.gz> <출력 jeju_dem.bin>
범위: 경도 126.14~126.98, 위도 33.08~33.58 / 8x8 평균 → 378 x 225
"""
import gzip
import sys

import numpy as np

src, out = sys.argv[sys.argv.index("--") + 1:][:2]
raw = gzip.open(src, "rb").read()
n = int(round((len(raw) / 2) ** 0.5))  # 3601
dem = np.frombuffer(raw, dtype=">i2").reshape(n, n).astype(np.float32)
dem[dem < -1000] = 0  # 결측값

lon0, lon1, lat0, lat1 = 126.14, 126.98, 33.08, 33.58
c0, c1 = int(round((lon0 - 126) * (n - 1))), int(round((lon1 - 126) * (n - 1)))
r0, r1 = int(round((34 - lat1) * (n - 1))), int(round((34 - lat0) * (n - 1)))  # 행 0 = 위도 34
crop = dem[r0:r1, c0:c1]
step = 8
h, w = crop.shape[0] // step, crop.shape[1] // step
small = crop[: h * step, : w * step].reshape(h, step, w, step).mean(axis=(1, 3))
small = np.clip(small, 0, 2000).astype("<u2")
small.tofile(out)
print("size", w, h, "max", int(small.max()), "bytes", small.nbytes)
