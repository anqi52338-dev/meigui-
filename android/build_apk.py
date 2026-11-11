"""Build/sign the APK with verified Android build tools; keep signing material outside Git."""
import argparse, base64, hashlib, pathlib, secrets, shutil, subprocess, zipfile

p=argparse.ArgumentParser();p.add_argument('--tools-root',required=True);p.add_argument('--signing-root',required=True);p.add_argument('--output',required=True);a=p.parse_args()
src=pathlib.Path(__file__).resolve().parent;repo=src.parent;tools=pathlib.Path(a.tools_root).resolve();signing=pathlib.Path(a.signing_root).resolve();output=pathlib.Path(a.output).resolve()
if signing.is_relative_to(repo):raise SystemExit('Signing directory must be outside the repository')
build=src/'build';build.mkdir(exist_ok=True);signing.mkdir(parents=True,exist_ok=True);output.parent.mkdir(parents=True,exist_ok=True)
java=next((tools/'java17').glob('*/bin/java.exe'));javac=java.with_name('javac.exe');keytool=java.with_name('keytool.exe')
aapt=next((tools/'build-tools35').rglob('aapt2.exe'));zipalign=aapt.with_name('zipalign.exe');apkSigner=next((tools/'build-tools35').rglob('apksigner.jar'));d8=next((tools/'build-tools35').rglob('d8.jar'));platform=next((tools/'platform35').rglob('android.jar'))
def run(args):
    subprocess.run([str(x) for x in args],check=True,cwd=src)
res=build/'res';(res/'values').mkdir(parents=True,exist_ok=True);(res/'drawable').mkdir(exist_ok=True)
shutil.copyfile(src/'res/values/styles.xml',res/'values/styles.xml');shutil.copyfile(repo/'dist/app-icon27-192.png',res/'drawable/ic_launcher.png')
compiled=build/'resources.zip';base=build/'resources.apk'
run([aapt,'compile','--dir',res,'-o',compiled]);run([aapt,'link','-I',platform,'--manifest',src/'AndroidManifest.xml','-o',base,compiled])
classes=build/'classes';classes.mkdir(exist_ok=True);run([javac,'--release','8','-encoding','UTF-8','-classpath',platform,'-d',classes,src/'MainActivity.java'])
dex=build/'dex';dex.mkdir(exist_ok=True);run([java,'-cp',d8,'com.android.tools.r8.D8','--lib',platform,'--min-api','24','--output',dex,*classes.rglob('*.class')])
unsigned=build/'unsigned.apk';shutil.copyfile(base,unsigned)
with zipfile.ZipFile(unsigned,'a',zipfile.ZIP_DEFLATED) as z:
    z.write(dex/'classes.dex','classes.dex')
    for f in sorted((repo/'dist').rglob('*')):
        if not f.is_file() or f.suffix.lower() in ('.apk','.zip','.gz') or 'downloads' in f.relative_to(repo/'dist').parts:continue
        name=f.relative_to(repo/'dist').as_posix();data=f.read_bytes()
        if name=='index.html':data=data.decode('utf-8').replace('</body>','<script src="native30.js"></script></body>').encode('utf-8')
        if name=='upgrade22.js':
            text=data.decode('utf-8');needle="download('玫瑰小手机-完整搬家-";assert text.count(needle)==1;text=text.replace(needle,'await '+needle);data=text.encode('utf-8')
        z.writestr('assets/www/'+name,data)
    z.write(src/'native30.js','assets/www/native30.js')
aligned=build/'aligned.apk';run([zipalign,'-f','4',unsigned,aligned])
key=signing/'rose-phone.p12';password=signing/'signing.password'
if key.exists() and not password.exists():raise SystemExit('Signing password file is missing; do not generate a replacement identity')
if not key.exists():
    password.write_text(secrets.token_urlsafe(40),encoding='ascii')
    run([keytool,'-genkeypair','-keystore',key,'-storetype','PKCS12','-storepass:file',password,'-keypass:file',password,'-alias','rose-phone','-keyalg','RSA','-keysize','3072','-validity','10000','-dname','CN=Rose Phone, O=Rose Phone, C=CN'])
run([java,'-jar',apkSigner,'sign','--ks',key,'--ks-key-alias','rose-phone','--ks-pass','file:'+str(password),'--out',output,aligned])
run([java,'-jar',apkSigner,'verify','--verbose','--print-certs',output]);run([zipalign,'-c','4',output])
with zipfile.ZipFile(output) as z:
    assert 'classes.dex' in z.namelist() and 'assets/www/index.html' in z.namelist()
    assert 'await download(' in z.read('assets/www/upgrade22.js').decode('utf-8')
    assert not any(n.endswith(('.p12','.jks','.password','.keystore')) for n in z.namelist())
digest=hashlib.sha256(output.read_bytes()).hexdigest();output.with_suffix('.apk.sha256').write_text(digest+'  '+output.name+'\n',encoding='utf-8')
print('APK built and signature verified: '+str(output),flush=True);print('SHA256: '+digest,flush=True)
