from pathlib import Path
import zipfile
r=Path(__file__).resolve().parents[1]
target=r/'广工大学城3D地图-网页部署包.zip'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in (r/'dist').rglob('*'):
        if p.is_file():z.write(p,p.relative_to(r/'dist'))
with zipfile.ZipFile(target) as z:
    assert 'index.html' in z.namelist()
    assert not any(n.startswith(('research/','scripts/','.runtime/')) for n in z.namelist())
print(f'Web-only archive: {target.name}; {target.stat().st_size} bytes')
