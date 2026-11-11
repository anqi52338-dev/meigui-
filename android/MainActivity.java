package cn.rosepalais.phone;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.ClipData;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.webkit.*;
import android.widget.Toast;
import android.widget.FrameLayout;
import java.io.*;
import java.net.URLConnection;
import java.util.*;

public class MainActivity extends Activity {
  private WebView web;
  private ValueCallback<Uri[]> chooser;
  private PermissionRequest mediaRequest;
  private String saveToken;
  private OutputStream saveStream;
  private static final String HOST="appassets.androidplatform.net", PREFIX="/assets/www/";
  private static final int PICK=1001, SAVE=1002, MEDIA=1003;

  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    FrameLayout frame=new FrameLayout(this);frame.setBackgroundColor(0xfffff8fb);
    web=new WebView(this);frame.addView(web,new FrameLayout.LayoutParams(-1,-1));setContentView(frame);web.setBackgroundColor(0xfffff8fb);
    int uiFlags=android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;if(android.os.Build.VERSION.SDK_INT>=26)uiFlags|=android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
    getWindow().getDecorView().setSystemUiVisibility(uiFlags);
    if(android.os.Build.VERSION.SDK_INT>=30)getWindow().setDecorFitsSystemWindows(false);
    else getWindow().getDecorView().setSystemUiVisibility(uiFlags|android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE|android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    frame.setOnApplyWindowInsetsListener((v,insets)->{
      if(android.os.Build.VERSION.SDK_INT>=30){
        android.graphics.Insets bars=insets.getInsets(android.view.WindowInsets.Type.systemBars()|android.view.WindowInsets.Type.displayCutout());
        android.graphics.Insets ime=insets.getInsets(android.view.WindowInsets.Type.ime());
        v.setPadding(bars.left,bars.top,bars.right,Math.max(bars.bottom,ime.bottom));
      }else{
        // Legacy adjustResize already subtracts the keyboard from the root bounds.
        int nav=getResources().getIdentifier("navigation_bar_height","dimen","android");
        int bottom=nav==0?insets.getSystemWindowInsetBottom():Math.min(insets.getSystemWindowInsetBottom(),getResources().getDimensionPixelSize(nav));
        v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),bottom);
      }
      return android.os.Build.VERSION.SDK_INT>=30?android.view.WindowInsets.CONSUMED:insets.consumeSystemWindowInsets();
    });frame.requestApplyInsets();
    rememberFirstVersion31();
    WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setDatabaseEnabled(true);
    s.setAllowFileAccess(false);s.setAllowContentAccess(true);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
    s.setMediaPlaybackRequiresUserGesture(false);s.setSupportMultipleWindows(false);
    web.addJavascriptInterface(new SaveBridge(),"NativeRose");
    web.setWebViewClient(new WebViewClient(){
      @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){return asset(request.getUrl());}
      @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
        Uri u=request.getUrl();if(local(u))return false;if(request.isForMainFrame())external(u);return true;
      }
    });
    web.setWebChromeClient(new WebChromeClient(){
      @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
        if(chooser!=null)chooser.onReceiveValue(null);chooser=callback;
        try{Intent intent=params.createIntent();intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,params.getMode()==FileChooserParams.MODE_OPEN_MULTIPLE);startActivityForResult(intent,PICK);return true;}
        catch(Exception e){chooser=null;callback.onReceiveValue(null);message("无法打开系统文件选择器");return true;}
      }
      @Override public void onPermissionRequest(PermissionRequest req){runOnUiThread(()->{
        if(!HOST.equals(req.getOrigin().getHost())){req.deny();return;}
        if(mediaRequest!=null){req.deny();return;}List<String> permissions=new ArrayList<>();
        for(String r:req.getResources()){
          String p=PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)?Manifest.permission.RECORD_AUDIO:PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r)?Manifest.permission.CAMERA:null;
          if(p==null){req.deny();return;}if(checkSelfPermission(p)!=PackageManager.PERMISSION_GRANTED&&!permissions.contains(p))permissions.add(p);
        }
        if(permissions.isEmpty())req.grant(req.getResources());else{mediaRequest=req;requestPermissions(permissions.toArray(new String[0]),MEDIA);}
      });}
      @Override public void onPermissionRequestCanceled(PermissionRequest req){if(mediaRequest==req)mediaRequest=null;}
    });
    web.setDownloadListener((url,agent,disposition,mime,size)->{if(url.startsWith("https://"))external(Uri.parse(url));else message("请使用应用内的导出按钮保存文件");});
    web.loadUrl("https://"+HOST+PREFIX+"index.html?app=1");
  }
  private boolean local(Uri u){return "https".equals(u.getScheme())&&HOST.equals(u.getHost())&&u.getPath()!=null&&u.getPath().startsWith(PREFIX);}
  private WebResourceResponse asset(Uri uri){
    if(!HOST.equals(uri.getHost()))return null;
    String path=uri.getPath();
    if(!local(uri)||path.contains("\\")||Arrays.asList(path.split("/")).contains(".."))return response(403,"Forbidden");
    path=path.substring(PREFIX.length());if(path.isEmpty())path="index.html";
    String mime=path.endsWith(".js")?"application/javascript":path.endsWith(".css")?"text/css":path.endsWith(".json")||path.endsWith(".webmanifest")?"application/json":URLConnection.guessContentTypeFromName(path);
    if(mime==null)mime="application/octet-stream";
    try{WebResourceResponse r=new WebResourceResponse(mime,"UTF-8",getAssets().open("www/"+path));r.setResponseHeaders(Collections.singletonMap("Cache-Control","no-cache"));return r;}
    catch(IOException e){return response(404,"Not Found");}
  }
  private WebResourceResponse response(int status,String text){return new WebResourceResponse("text/plain","UTF-8",status,text,Collections.emptyMap(),new ByteArrayInputStream(text.getBytes(java.nio.charset.StandardCharsets.UTF_8)));}
  private void external(Uri uri){if(!Arrays.asList("https","http","mailto","tel").contains(uri.getScheme()))return;try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception e){message("没有可打开此链接的应用");}}
  private void message(String text){runOnUiThread(()->Toast.makeText(this,text,Toast.LENGTH_LONG).show());}
  @Override public void onRequestPermissionsResult(int code,String[] names,int[] results){super.onRequestPermissionsResult(code,names,results);if(code!=MEDIA||mediaRequest==null)return;PermissionRequest r=mediaRequest;mediaRequest=null;boolean ok=results.length>0;for(int v:results)ok&=v==PackageManager.PERMISSION_GRANTED;if(ok)r.grant(r.getResources());else r.deny();}
  @Override protected void onActivityResult(int code,int result,Intent data){super.onActivityResult(code,result,data);
    if(code==PICK&&chooser!=null){ValueCallback<Uri[]> callback=chooser;chooser=null;List<Uri> list=new ArrayList<>();if(result==RESULT_OK&&data!=null){ClipData clip=data.getClipData();if(clip!=null){for(int i=0;i<clip.getItemCount();i++)list.add(clip.getItemAt(i).getUri());}else if(data.getData()!=null)list.add(data.getData());}callback.onReceiveValue(list.isEmpty()?null:list.toArray(new Uri[0]));}
    if(code==SAVE){String token;boolean ok=false;synchronized(this){token=saveToken;if(result==RESULT_OK&&data!=null&&data.getData()!=null)try{saveStream=getContentResolver().openOutputStream(data.getData(),"wt");ok=saveStream!=null;}catch(Exception ignored){}if(!ok){saveToken=null;closeSave();}}if(token!=null){final String js="window.nativeSaveReady30&&window.nativeSaveReady30("+org.json.JSONObject.quote(token)+","+ok+")";web.evaluateJavascript(js,null);}}
  }
  private synchronized void closeSave(){if(saveStream!=null)try{saveStream.close();}catch(IOException ignored){}saveStream=null;}
  private void rememberFirstVersion31(){
    android.content.SharedPreferences p=getSharedPreferences("app-release",MODE_PRIVATE);
    if(p.contains("firstVersion"))return;
    int first=31;try{android.content.pm.PackageInfo i=getPackageManager().getPackageInfo(getPackageName(),0);if(i.firstInstallTime<i.lastUpdateTime)first=30;}catch(Exception ignored){}
    p.edit().putInt("firstVersion",first).commit();
  }
  public class SaveBridge {
    @JavascriptInterface public String getAppInfo31(){try{return new org.json.JSONObject().put("currentVersion",31).put("firstVersion",getSharedPreferences("app-release",MODE_PRIVATE).getInt("firstVersion",31)).toString();}catch(Exception e){return "{}";}}
    @JavascriptInterface public String beginSave(String name,String mime){
      final String token;synchronized(MainActivity.this){if(saveToken!=null)return "";token=UUID.randomUUID().toString();saveToken=token;}
      final String safe=name==null?"rose-phone-backup.json":name.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]","_");
      runOnUiThread(()->{try{Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(mime==null||mime.isEmpty()?"application/octet-stream":mime);i.putExtra(Intent.EXTRA_TITLE,safe.length()>120?safe.substring(0,120):safe);startActivityForResult(i,SAVE);}catch(Exception e){synchronized(MainActivity.this){saveToken=null;}web.evaluateJavascript("window.nativeSaveReady30&&window.nativeSaveReady30("+org.json.JSONObject.quote(token)+",false)",null);}});return token;
    }
    @JavascriptInterface public boolean writeChunk(String token,String base64){synchronized(MainActivity.this){if(!Objects.equals(saveToken,token)||saveStream==null||base64.length()>200000)return false;try{saveStream.write(Base64.decode(base64,Base64.DEFAULT));return true;}catch(Exception e){return false;}}}
    @JavascriptInterface public boolean finishSave(String token){synchronized(MainActivity.this){if(!Objects.equals(saveToken,token)||saveStream==null)return false;try{saveStream.flush();saveStream.close();saveStream=null;saveToken=null;return true;}catch(Exception e){closeSave();saveToken=null;return false;}}}
    @JavascriptInterface public void cancelSave(String token){synchronized(MainActivity.this){if(Objects.equals(saveToken,token)){closeSave();saveToken=null;}}}
  }
  @Override public void onBackPressed(){web.evaluateJavascript("(function(){const d=[...document.querySelectorAll('dialog[open]')].pop();if(d){d.close();return false}if(typeof tab!=='undefined'&&tab!=='home'&&typeof back21==='function'){back21();return false}return true})()",v->{if("true".equals(v))finish();});}
  @Override protected void onPause(){super.onPause();web.onPause();}
  @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();}
  @Override protected void onDestroy(){if(chooser!=null)chooser.onReceiveValue(null);if(mediaRequest!=null)mediaRequest.deny();closeSave();web.removeJavascriptInterface("NativeRose");web.destroy();super.onDestroy();}
}
