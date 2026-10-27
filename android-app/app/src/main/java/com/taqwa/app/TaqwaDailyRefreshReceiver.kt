package com.taqwa.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

class TaqwaDailyRefreshReceiver : BroadcastReceiver() {
 override fun onReceive(context:Context,intent:Intent) {
  val pending=goAsync()
  TaqwaAlarmScheduler.scheduleDailyRefresh(context)
  Thread {
   try {
    val cfg=TaqwaAlarmScheduler.savedConfig(context)
    val zoneText=cfg.optString("timeZone","Asia/Amman")
    val zone=try{ZoneId.of(zoneText)}catch(_:Exception){ZoneId.of("Asia/Amman")}
    val lat=cfg.optDouble("latitude",31.9539); val lon=cfg.optDouble("longitude",35.9106); val method=cfg.optInt("method",23)
    val events=JSONArray(); val now=System.currentTimeMillis()
    val labels=linkedMapOf("Fajr" to "الفجر","Dhuhr" to "الظهر","Asr" to "العصر","Maghrib" to "المغرب","Isha" to "العشاء")
    for(offset in 0..1) {
     val date=LocalDate.now(zone).plusDays(offset)
     val dateText=date.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"))
     val timings=fetchTimings(dateText,lat,lon,method,zoneText)
     for((key,label) in labels) {
      val raw=Regex("(\\d{1,2}:\\d{2})").find(timings.optString(key,""))?.value?:continue
      val time=LocalTime.parse(raw,DateTimeFormatter.ofPattern("H:mm"))
      val trigger=date.atTime(time).atZone(zone).toInstant().toEpochMilli()
      if(trigger>now+5000)events.put(JSONObject().put("id",dateText+":"+key).put("key",key).put("label",label).put("triggerAtMillis",trigger))
     }
    }
    val payload=JSONObject().put("location",cfg.optString("location","")).put("country",cfg.optString("country","jordan"))
     .put("timeZone",zoneText).put("latitude",lat).put("longitude",lon).put("method",method).put("events",events)
    TaqwaAlarmScheduler.replaceFromJson(context,payload.toString())
   } catch(e:Exception){android.util.Log.e("TaqwaAlarm","Daily update failed; saved alarms remain",e)}
   finally {TaqwaAlarmScheduler.scheduleDailyRefresh(context);pending.finish()}
  }.start()
 }
 private fun fetchTimings(date:String,lat:Double,lon:Double,method:Int,zone:String):JSONObject {
  val query="latitude="+lat+"&longitude="+lon+"&method="+method+"&school=0&timezonestring="+URLEncoder.encode(zone,"UTF-8")
  val conn=URL("https://api.aladhan.com/v1/timings/"+date+"?"+query).openConnection() as HttpURLConnection
  conn.connectTimeout=9000;conn.readTimeout=9000;conn.requestMethod="GET"
  return try {
   val status=conn.responseCode; val stream=if(status in 200..299)conn.inputStream else conn.errorStream
   val body=stream.bufferedReader(Charsets.UTF_8).use{it.readText()}
   if(status !in 200..299)throw IllegalStateException("Prayer API HTTP "+status)
   JSONObject(body).getJSONObject("data").getJSONObject("timings")
  } finally {conn.disconnect()}
 }
}