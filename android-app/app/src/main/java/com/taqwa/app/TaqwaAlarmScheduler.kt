package com.taqwa.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import org.json.JSONArray
import org.json.JSONObject
import java.time.ZoneId
import java.time.ZonedDateTime

object TaqwaAlarmScheduler {
 const val ACTION_ADHAN="com.taqwa.app.ACTION_ADHAN"
 const val ACTION_DAILY_REFRESH="com.taqwa.app.ACTION_DAILY_REFRESH"
 private const val PREFS="taqwa_native_adhan"
 private const val EVENTS="events"
 private fun prefs(c:Context)=c.getSharedPreferences(PREFS,Context.MODE_PRIVATE)

 @Synchronized fun replaceFromJson(c:Context,json:String) {
  try {
   val root=JSONObject(json); val p=prefs(c)
   cancelEvents(c,JSONArray(p.getString(EVENTS,"[]")))
   p.edit().putString("location",root.optString("location",""))
    .putString("country",root.optString("country","jordan"))
    .putString("timeZone",root.optString("timeZone","Asia/Amman"))
    .putString("latitude",root.optDouble("latitude",31.9539).toString())
    .putString("longitude",root.optDouble("longitude",35.9106).toString())
    .putInt("method",root.optInt("method",23)).apply()
   val incoming=root.optJSONArray("events")?:JSONArray(); val future=JSONArray()
   for(i in 0 until incoming.length()) {
    val e=incoming.optJSONObject(i)?:continue
    if(e.optLong("triggerAtMillis")<=System.currentTimeMillis()+2500) continue
    future.put(e); scheduleOne(c,e)
   }
   p.edit().putString(EVENTS,future.toString()).apply(); scheduleDailyRefresh(c)
  } catch(e:Exception) { android.util.Log.e("TaqwaAlarm","Could not update prayer alarms",e) }
 }

 private fun cancelEvents(c:Context,events:JSONArray) {
  val manager=c.getSystemService(Context.ALARM_SERVICE) as AlarmManager
  for(i in 0 until events.length()) {
   val id=events.optJSONObject(i)?.optString("id")?:continue
   val pi=pendingIntent(c,id); manager.cancel(pi); pi.cancel()
  }
 }
 private fun pendingIntent(c:Context,id:String):PendingIntent {
  val i=Intent(c,TaqwaAlarmReceiver::class.java).apply { action=ACTION_ADHAN; data=Uri.parse("taqwa://adhan/"+Uri.encode(id)) }
  return PendingIntent.getBroadcast(c,id.hashCode(),i,PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
 }
 private fun scheduleOne(c:Context,e:JSONObject) {
  val id=e.optString("id"); val whenMs=e.optLong("triggerAtMillis")
  if(id.isBlank()||whenMs<=System.currentTimeMillis())return
  val pi=pendingIntent(c,id); val manager=c.getSystemService(Context.ALARM_SERVICE) as AlarmManager
  try { if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.S&&!manager.canScheduleExactAlarms()) manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,whenMs,pi)
   else manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,whenMs,pi)
  } catch(_:SecurityException) { manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,whenMs,pi) }
 }
 fun eventById(c:Context,id:String):JSONObject? {
  val list=JSONArray(prefs(c).getString(EVENTS,"[]")?:"[]")
  for(i in 0 until list.length()) { val e=list.optJSONObject(i)?:continue; if(e.optString("id")==id)return e }
  return null
 }
 fun removeFiredEvent(c:Context,id:String) {
  val p=prefs(c); val old=JSONArray(p.getString(EVENTS,"[]")?:"[]"); val next=JSONArray()
  for(i in 0 until old.length()) { val e=old.optJSONObject(i)?:continue; if(e.optString("id")!=id)next.put(e) }
  p.edit().putString(EVENTS,next.toString()).apply()
 }
 fun rescheduleFromPrefs(c:Context) {
  val list=JSONArray(prefs(c).getString(EVENTS,"[]")?:"[]")
  for(i in 0 until list.length()) { val e=list.optJSONObject(i)?:continue; if(e.optLong("triggerAtMillis")>System.currentTimeMillis())scheduleOne(c,e) }
 }
 fun savedConfig(c:Context):JSONObject {
  val p=prefs(c)
  return JSONObject().put("location",p.getString("location","عمّان")).put("country",p.getString("country","jordan"))
   .put("timeZone",p.getString("timeZone","Asia/Amman"))
   .put("latitude",p.getString("latitude","31.9539")?.toDoubleOrNull()?:31.9539)
   .put("longitude",p.getString("longitude","35.9106")?.toDoubleOrNull()?:35.9106).put("method",p.getInt("method",23))
 }
 fun scheduleDailyRefresh(c:Context) {
  val z=prefs(c).getString("timeZone","Asia/Amman")?:"Asia/Amman"
  val zone=try{ZoneId.of(z)}catch(_:Exception){ZoneId.of("Asia/Amman")}
  var next=ZonedDateTime.now(zone).withHour(0).withMinute(7).withSecond(0).withNano(0)
  if(!next.isAfter(ZonedDateTime.now(zone)))next=next.plusDays(1)
  val i=Intent(c,TaqwaDailyRefreshReceiver::class.java).apply { action=ACTION_DAILY_REFRESH; data=Uri.parse("taqwa://daily-refresh") }
  val pi=PendingIntent.getBroadcast(c,7301,i,PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  val am=c.getSystemService(Context.ALARM_SERVICE) as AlarmManager
  try { if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.S&&!am.canScheduleExactAlarms())am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next.toInstant().toEpochMilli(),pi)
   else am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next.toInstant().toEpochMilli(),pi)
  } catch(_:SecurityException){am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next.toInstant().toEpochMilli(),pi)}
 }
}