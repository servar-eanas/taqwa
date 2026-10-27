package com.taqwa.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.content.ContextCompat

class TaqwaAlarmReceiver : BroadcastReceiver() {
 override fun onReceive(context:Context,intent:Intent) {
  val id=intent.data?.lastPathSegment?.let{Uri.decode(it)}?:return
  val event=TaqwaAlarmScheduler.eventById(context,id)
  TaqwaAlarmScheduler.removeFiredEvent(context,id)
  if(event==null)return
  val service=Intent(context,TaqwaAdhanService::class.java).apply {
   putExtra("label",event.optString("label","الأذان")); putExtra("key",event.optString("key","Dhuhr"))
  }
  try { if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.O)ContextCompat.startForegroundService(context,service) else context.startService(service) }
  catch(e:Exception){android.util.Log.e("TaqwaAlarm","Could not start adhan service",e)}
 }
}