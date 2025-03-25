package com.kykyemek;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/**
 * React Native module for home screen widget functionality.
 * Provides methods to update widgets from JavaScript.
 */
public class MealWidgetModule extends ReactContextBaseJavaModule {
    private static final String TAG = "MealWidgetModule";
    private static final String PREFS_NAME = "com.kykyemek.MealWidget";
    private static final String UPDATE_ACTION = "com.kykyemek.APPWIDGET_UPDATE";
    
    public MealWidgetModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "MealWidgetModule";
    }

    /**
     * Update all widgets by sending a broadcast
     * @param promise Promise to resolve with success or error
     */
    @ReactMethod
    public void updateWidgets(Promise promise) {
        try {
            ReactApplicationContext context = getReactApplicationContext();
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName widgetComponent = new ComponentName(context, MealWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(widgetComponent);

            if (appWidgetIds.length > 0) {
                // Send broadcast to update widgets
                Intent intent = new Intent(context, MealWidgetProvider.class);
                intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
                context.sendBroadcast(intent);
                
                // Also send our custom update action
                Intent customIntent = new Intent(UPDATE_ACTION);
                customIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
                context.sendBroadcast(customIntent);
                
                Log.d(TAG, "Widget update broadcast sent for " + appWidgetIds.length + " widgets");
                promise.resolve("Widget update broadcast sent");
            } else {
                Log.d(TAG, "No widgets found to update");
                promise.resolve("No widgets found to update");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error updating widgets", e);
            promise.reject("ERROR", "Failed to update widgets: " + e.getMessage(), e);
        }
    }

    /**
     * Set widget data in SharedPreferences for access by widgets
     * @param widgetData JSON string containing widget data
     * @param promise Promise to resolve with success or error
     */
    @ReactMethod
    public void setWidgetData(String widgetData, Promise promise) {
        try {
            SharedPreferences.Editor prefs = getReactApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();
            prefs.putString("kyk_yemek_widget_data", widgetData);
            prefs.apply();
            
            Log.d(TAG, "Widget data saved to SharedPreferences");
            promise.resolve("Widget data saved");
        } catch (Exception e) {
            Log.e(TAG, "Error saving widget data", e);
            promise.reject("ERROR", "Failed to save widget data: " + e.getMessage(), e);
        }
    }
    
    /**
     * Send event to React Native when widgets request data
     */
    public static void notifyWidgetDataRequest(ReactApplicationContext reactContext) {
        if (reactContext == null || !reactContext.hasActiveReactInstance()) {
            Log.d(TAG, "Cannot send widget data request event, React context not active");
            return;
        }
        
        WritableMap params = Arguments.createMap();
        params.putString("action", "dataRequest");
        
        try {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onWidgetDataRequest", params);
            
            Log.d(TAG, "Widget data request event sent to React Native");
        } catch (Exception e) {
            Log.e(TAG, "Error sending widget data request event", e);
        }
    }
} 