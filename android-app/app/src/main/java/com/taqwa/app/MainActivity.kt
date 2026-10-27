package com.taqwa.app

import android.Manifest
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import android.app.AlarmManager
import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.webkit.GeolocationPermissions
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat

class MainActivity : ComponentActivity() {
 private lateinit var webView: WebView
 private var geoCallback: GeolocationPermissions.Callback? = null
 private var geoOrigin: String? = null
 private val permissionRequest = 501

 override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  window.statusBarColor = android.graphics.Color.rgb(24,56,47)
  window.navigationBarColor = android.graphics.Color.rgb(24,56,47)
  val loader = WebViewAssetLoader.Builder().addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(this)).build()
  webView = WebView(this)
  webView.setBackgroundColor(android.graphics.Color.rgb(247,245,236))
  webView.settings.apply {
   javaScriptEnabled = true; domStorageEnabled = true; databaseEnabled = true
   mediaPlaybackRequiresUserGesture = false; cacheMode = WebSettings.LOAD_DEFAULT
   allowFileAccess = false; allowContentAccess = true
  }
  webView.addJavascriptInterface(PrayerBridge(this), "TaqwaAndroid")
  webView.webViewClient = object : WebViewClientCompat() {
   override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest) = loader.shouldInterceptRequest(request.url)
   override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
    val uri=request.url
    if(uri.host=="appassets.androidplatform.net") return false
    if(uri.scheme=="https" || uri.scheme=="http") { startActivity(Intent(Intent.ACTION_VIEW,uri)); return true }
    return true
   }
  }
  webView.webChromeClient = object : WebChromeClient() {
   override fun onGeolocationPermissionsShowPrompt(origin:String, callback:GeolocationPermissions.Callback) {
    if(hasLocationPermission()) callback.invoke(origin,true,false)
    else { geoOrigin=origin; geoCallback=callback; requestCorePermissions() }
   }
  }
  setContentView(webView)
  webView.loadUrl("https://appassets.androidplatform.net/index.html")
  requestCorePermissions()
  requestExactAlarmPermissionIfNeeded()
  TaqwaAlarmScheduler.rescheduleFromPrefs(this)
  TaqwaAlarmScheduler.scheduleDailyRefresh(this)
  onBackPressedDispatcher.addCallback(this,object:OnBackPressedCallback(true) {
   override fun handleOnBackPressed() { if(webView.canGoBack()) webView.goBack() else { isEnabled=false; onBackPressedDispatcher.onBackPressed() } }
  })
 }

 private fun hasLocationPermission() =
  ContextCompat.checkSelfPermission(this,Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED ||
  ContextCompat.checkSelfPermission(this,Manifest.permission.ACCESS_COARSE_LOCATION)==PackageManager.PERMISSION_GRANTED

 private fun requestCorePermissions() {
  val needed=mutableListOf<String>()
  if(Build.VERSION.SDK_INT>=33 && ContextCompat.checkSelfPermission(this,Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED) needed.add(Manifest.permission.POST_NOTIFICATIONS)
  if(!hasLocationPermission()) { needed.add(Manifest.permission.ACCESS_FINE_LOCATION); needed.add(Manifest.permission.ACCESS_COARSE_LOCATION) }
  if(needed.isNotEmpty()) ActivityCompat.requestPermissions(this,needed.distinct().toTypedArray(),permissionRequest)
 }

 private fun requestExactAlarmPermissionIfNeeded() {
  if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.S) {
   val alarms=getSystemService(Context.ALARM_SERVICE) as AlarmManager
   if(!alarms.canScheduleExactAlarms()) AlertDialog.Builder(this)
    .setTitle("السماح بمواعيد الأذان")
    .setMessage("لرنين الأذان بوقته عند إغلاق واجهة التطبيق، اسمح لتقوى بالمنبّهات الدقيقة من إعدادات أندرويد.")
    .setPositiveButton("فتح الإعدادات") { _,_ ->
     try { startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,Uri.parse("package:"+packageName))) }
     catch(_:Exception) { Toast.makeText(this,"فعّل المنبّهات الدقيقة من إعدادات التطبيقات.",Toast.LENGTH_LONG).show() }
    }.setNegativeButton("لاحقًا",null).show()
  }
 }

 override fun onRequestPermissionsResult(requestCode:Int,permissions:Array<String>,grantResults:IntArray) {
  super.onRequestPermissionsResult(requestCode,permissions,grantResults)
  if(requestCode==permissionRequest) { geoCallback?.invoke(geoOrigin,hasLocationPermission(),false); geoCallback=null; geoOrigin=null }
 }

 inner class PrayerBridge(private val context:Context) {
  @JavascriptInterface fun schedulePrayerTimes(json:String) { TaqwaAlarmScheduler.replaceFromJson(context.applicationContext,json) }
  @JavascriptInterface fun appVersion():String = "1.0.0"
 }

 override fun onDestroy() {
  if(::webView.isInitialized) { webView.removeJavascriptInterface("TaqwaAndroid"); webView.destroy() }
  super.onDestroy()
 }
}