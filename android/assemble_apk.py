"""Reconstruct already-signed APKs from size-bounded Git blobs for Pages publishing."""
from pathlib import Path
import hashlib,json,re

repo=Path(__file__).resolve().parents[1]
output=repo/'dist'/'downloads'
output.mkdir(parents=True,exist_ok=True)
for manifest in sorted((repo/'android'/'apk-parts').glob('v*/manifest.json')):
    data=json.loads(manifest.read_text(encoding='utf-8'))
    version=data['version']
    if type(version) is not int or not 1<=version<=1000000:raise ValueError('Invalid package version')
    if not re.fullmatch(r'[a-f0-9]{64}',data['sha256']):raise ValueError('Invalid package hash')
    parts=data['parts']
    if not isinstance(parts,list) or not 1<=len(parts)<=64:raise ValueError('Invalid package parts')
    signed=bytearray()
    for index,part in enumerate(parts):
        name=f'part-{index:03}.bin'
        if part['name']!=name:raise ValueError('Invalid part path/order')
        content=(manifest.parent/name).read_bytes()
        if len(content)!=part['size'] or len(content)>1024*1024 or hashlib.sha256(content).hexdigest()!=part['sha256']:raise ValueError('Part integrity failure')
        signed.extend(content)
    if len(signed)!=data['size'] or hashlib.sha256(signed).hexdigest()!=data['sha256']:raise ValueError('APK integrity failure')
    target=output/f'rose-phone-android-v{version}.apk'
    checksum=target.with_suffix('.apk.sha256')
    if checksum.exists() and checksum.read_text(encoding='utf-8').split()[0]!=data['sha256']:raise ValueError('Published checksum mismatch')
    temporary=target.with_suffix('.apk.tmp')
    temporary.write_bytes(signed)
    temporary.replace(target)
    print(f'Verified and assembled {target.name}: {len(signed)} bytes')
