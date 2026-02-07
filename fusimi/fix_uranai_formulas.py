# -*- coding: utf-8 -*-
import zipfile
import re
import os

path = r'f:\AI\manga\cursor\fusimi\uranai.xlsm'

with zipfile.ZipFile(path, 'r') as z:
    sheet1 = z.read('xl/worksheets/sheet1.xml').decode('utf-8', errors='replace')

# R19: currently IF(X20=11,"11",MOD(X20-1,9)+1) - missing 22, 33
old_r19 = 'IF(K20="","",IF(X20=11,"11",MOD(X20-1,9)+1))'
new_r19 = 'IF(K20="","",IF(X20=11,"11",IF(X20=22,"22",IF(X20=33,"33",MOD(X20-1,9)+1))))'

# P19: has 22, 11 but not 33. Formula: IF(V21=22,"22",IF(V21=11,"11",MOD(V21-1,9)+1))
old_p19 = 'IF(K20="","",IF(V21=22,"22",IF(V21=11,"11",MOD(V21-1,9)+1)))'
new_p19 = 'IF(K20="","",IF(V21=22,"22",IF(V21=11,"11",IF(V21=33,"33",MOD(V21-1,9)+1))))'

# Also row 23 and 28: X23, X28 (same pattern with K23, K28)
old_r19_23 = 'IF(K23="","",IF(X23=11,"11",MOD(X23-1,9)+1))'
old_r19_28 = 'IF(K28="","",IF(X28=11,"11",MOD(X28-1,9)+1))'
new_r19_23 = 'IF(K23="","",IF(X23=11,"11",IF(X23=22,"22",IF(X23=33,"33",MOD(X23-1,9)+1))))'
new_r19_28 = 'IF(K28="","",IF(X28=11,"11",IF(X28=22,"22",IF(X28=33,"33",MOD(X28-1,9)+1))))'

# P19 row 23, 28: V24, V29
old_p19_23 = 'IF(K23="","",IF(V24=22,"22",IF(V24=11,"11",MOD(V24-1,9)+1)))'
old_p19_28 = 'IF(K28="","",IF(V29=22,"22",IF(V29=11,"11",MOD(V29-1,9)+1)))'
new_p19_23 = 'IF(K23="","",IF(V24=22,"22",IF(V24=11,"11",IF(V24=33,"33",MOD(V24-1,9)+1))))'
new_p19_28 = 'IF(K28="","",IF(V29=22,"22",IF(V29=11,"11",IF(V29=33,"33",MOD(V29-1,9)+1))))'

changes = [
    (old_r19, new_r19), (old_p19, new_p19),
    (old_r19_23, new_r19_23), (old_r19_28, new_r19_28),
    (old_p19_23, new_p19_23), (old_p19_28, new_p19_28),
]

sheet1_new = sheet1
for old_f, new_f in changes:
    n = sheet1_new.count(old_f)
    if n:
        sheet1_new = sheet1_new.replace(old_f, new_f)
        print('Replaced %d: %s...' % (n, old_f[:45]))
    else:
        print('Not found:', old_f[:45])


with zipfile.ZipFile(path, 'r') as z_in:
    with zipfile.ZipFile(path + '.new', 'w', zipfile.ZIP_DEFLATED) as z_out:
        for name in z_in.namelist():
            data = z_in.read(name)
            if name == 'xl/worksheets/sheet1.xml':
                data = sheet1_new.encode('utf-8')
            z_out.writestr(name, data)

os.replace(path + '.new', path)
print('Done. uranai.xlsm updated.')
