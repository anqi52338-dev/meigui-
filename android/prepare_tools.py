"""Download verified official Java/Android packages into a separate local tools folder."""
import argparse, hashlib, json, os, pathlib, urllib.request, zipfile, xml.etree.ElementTree as ET

p=argparse.ArgumentParser();p.add_argument('--tools-root',required=True);p.add_argument('--proxy');args=p.parse_args()
root=pathlib.Path(args.tools_root).resolve();root.mkdir(parents=True,exist_ok=True)
if all((root/name/'.ready').is_file() for name in ('java17','build-tools35','platform35')):
    print('Verified toolchain already present');raise SystemExit(0)
opener=urllib.request.build_opener(urllib.request.ProxyHandler({'http':args.proxy,'https':args.proxy}) if args.proxy else urllib.request.ProxyHandler())
opener.addheaders=[('User-Agent','Mozilla/5.0 RosePhoneBuild/1.0')]
def get(url):
    with opener.open(url,timeout=90) as r:return r.read()
def install(name,url,expected,algorithm):
    folder=root/name
    if (folder/'.ready').is_file():return
    archive=root/(name+'.zip')
    if not archive.is_file() or hashlib.new(algorithm,archive.read_bytes()).hexdigest()!=expected:
        print('Downloading '+name,flush=True)
        with opener.open(url,timeout=120) as response,open(str(archive)+'.part','wb') as out:
            while True:
                chunk=response.read(1024*1024)
                if not chunk:break
                out.write(chunk)
        temp=pathlib.Path(str(archive)+'.part')
        if hashlib.new(algorithm,temp.read_bytes()).hexdigest()!=expected:raise RuntimeError(name+' checksum mismatch')
        temp.replace(archive)
    folder.mkdir(exist_ok=True)
    with zipfile.ZipFile(archive) as z:
        for item in z.infolist():
            if not (folder/item.filename).resolve().is_relative_to(folder):raise RuntimeError('Unsafe archive path')
        z.extractall(folder)
    (folder/'.ready').write_text(expected,encoding='ascii');print(name+' verified and extracted',flush=True)
try:
    java=json.loads(get('https://api.adoptium.net/v3/assets/latest/17/hotspot?architecture=x64&os=windows&image_type=jdk'))[0]['binary']['package']
except urllib.error.HTTPError:
    release=json.loads(get('https://api.github.com/repos/adoptium/temurin17-binaries/releases/latest'))
    asset=next(a for a in release['assets'] if a['name'].startswith('OpenJDK17U-jdk_x64_windows_hotspot_') and a['name'].endswith('.zip'))
    checksum=get(asset['browser_download_url']+'.sha256.txt').decode().split()[0]
    java={'link':asset['browser_download_url'],'checksum':checksum}
install('java17',java['link'],java['checksum'],'sha256')
xml=ET.fromstring(get('https://dl.google.com/android/repository/repository2-3.xml'))
def tag(e,name):return next((x for x in e if x.tag.rsplit('}',1)[-1]==name),None)
for name,package in [('build-tools35','build-tools;35.0.0'),('platform35','platforms;android-35')]:
    node=next(e for e in xml.iter() if e.tag.endswith('remotePackage') and e.attrib.get('path')==package)
    for a in tag(node,'archives'):
        host=tag(a,'host-os')
        if host is not None and host.text!='windows':continue
        complete=tag(a,'complete');url=tag(complete,'url').text;checksum=tag(complete,'checksum')
        install(name,'https://dl.google.com/android/repository/'+url,checksum.text,checksum.attrib.get('type','sha1'));break
print('Toolchain ready',flush=True)
