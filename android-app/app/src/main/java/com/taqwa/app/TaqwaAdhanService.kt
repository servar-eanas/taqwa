package com.taqwa.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat

class TaqwaAdhanService : Service() {
 companion object { private const val CHANNEL="taqwa_adhan_playback"; private const val NOTIFICATION_ID=7302 }
 private var player:MediaPlayer?=null
 private var activeLabel="الأذان"
 private var activeKey="Dhuhr"
 private var attempt=0
 private val normalSources=listOf(
  "https://archive.org/download/adhan.recordings.from.doha.qatar/Adhan_Doha_Qatar_02_Dhuhr_Adhan.mp3",
  "https://upload.wikimedia.org/wikipedia/commons/e/e7/Adhan.ogg"
 )
 private val fajrSources=listOf(
  "https://archive.org/download/adhan.recordings.from.doha.qatar/Adhan_Doha_Qatar_01_Fajr_Adhan.mp3",
  "https://upload.wikimedia.org/wikipedia/commons/e/e7/Adhan.ogg"
 )
 override fun onCreate(){super.onCreate();createChannel()}
 override fun onStartCommand(intent:Intent?,flags:Int,startId:Int):Int {
  activeLabel=intent?.getStringExtra("label")?:"الأذان"
  activeKey=intent?.getStringExtra("key")?:"Dhuhr"
  attempt=0
  val open=PendingIntent.getActivity(this,7303,Intent(this,MainActivity::class.java),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  val notification:Notification=NotificationCompat.Builder(this,CHANNEL)
   .setSmallIcon(R.drawable.ic_stat_taqwa).setContentTitle("حان وقت الصلاة")
   .setContentText(activeLabel+" — تقوى").setContentIntent(open)
   .setCategory(NotificationCompat.CATEGORY_ALARM).setPriority(NotificationCompat.PRIORITY_LOW).setOngoing(true).build()
  startForeground(NOTIFICATION_ID,notification)
  startPlayback()
  return START_NOT_STICKY
 }
 private fun createChannel(){
  if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.O){
   val channel=NotificationChannel(CHANNEL,"تشغيل الأذان",NotificationManager.IMPORTANCE_LOW)
   channel.description="إشعار أثناء تشغيل الأذان";channel.setSound(null,null)
   (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(channel)
  }
 }
 private fun sources()=if(activeKey=="Fajr")fajrSources else normalSources
 private fun startPlayback(){
  val list=sources();if(attempt>=list.size){stopSelf();return}
  val url=list[attempt++];releasePlayer()
  val mp=MediaPlayer();player=mp
  try {
   mp.setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
   mp.setWakeMode(this,PowerManager.PARTIAL_WAKE_LOCK);mp.setDataSource(url)
   mp.setOnPreparedListener{if(player===mp)mp.start()}
   mp.setOnCompletionListener{stopSelf()}
   mp.setOnErrorListener{_,_,_->if(player===mp)startPlayback();true}
   mp.prepareAsync()
  } catch(e:Exception){android.util.Log.e("TaqwaAdhan","Adhan source failed",e);startPlayback()}
 }
 private fun releasePlayer(){
  val old=player;player=null
  try{old?.setOnPreparedListener(null);old?.setOnCompletionListener(null);old?.setOnErrorListener(null);old?.reset();old?.release()}catch(_:Exception){}
 }
 override fun onDestroy(){releasePlayer();stopForeground(STOP_FOREGROUND_REMOVE);super.onDestroy()}
 override fun onBind(intent:Intent?):IBinder?=null
}