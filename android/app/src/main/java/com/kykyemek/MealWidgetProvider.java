package com.kykyemek;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.widget.RemoteViews;
import android.view.View;
import android.app.PendingIntent;
import android.widget.RemoteViewsService;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link MealWidgetConfigureActivity MealWidgetConfigureActivity}
 */
public class MealWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "com.kykyemek.MealWidget";
    private static final String WIDGET_DATA_KEY = "kyk_yemek_widget_data";
    private static final String WIDGET_MEAL_TYPE_KEY = "mealType";
    private static final String WIDGET_MEAL_DATE_KEY = "mealDate";
    private static final String WIDGET_CITY_NAME_KEY = "cityName";
    private static final String WIDGET_ITEMS_KEY = "items";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        // Handle custom refresh broadcast
        if (intent.getAction() != null && intent.getAction().equals("com.kykyemek.APPWIDGET_UPDATE")) {
            int[] appWidgetIds = intent.getIntArrayExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS);
            if (appWidgetIds != null) {
                AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
                this.onUpdate(context, appWidgetManager, appWidgetIds);
            }
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Read from SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String widgetDataJson = prefs.getString(WIDGET_DATA_KEY, null);

        // Get Views based on widget size
        int layoutId = getLayoutId(appWidgetManager, appWidgetId);
        RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);

        // If no data, show default state
        if (widgetDataJson == null) {
            setupEmptyState(context, views, layoutId);
        } else {
            try {
                populateWidget(context, views, layoutId, new JSONObject(widgetDataJson));
            } catch (JSONException e) {
                e.printStackTrace();
                setupEmptyState(context, views, layoutId);
            }
        }

        // Set up click intent - open the app
        Intent intent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (intent != null) {
            PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(android.R.id.background, pendingIntent);
        }

        // Tell the AppWidgetManager to perform an update on the current app widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static int getLayoutId(AppWidgetManager appWidgetManager, int appWidgetId) {
        // Determine widget size and return appropriate layout
        int width = appWidgetManager.getAppWidgetOptions(appWidgetId)
                .getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        int height = appWidgetManager.getAppWidgetOptions(appWidgetId)
                .getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);

        if (width >= 250 && height >= 180) {
            return R.layout.meal_widget_large;
        } else if (width >= 180 && height >= 110) {
            return R.layout.meal_widget_medium;
        } else {
            return R.layout.meal_widget_small;
        }
    }

    private static void setupEmptyState(Context context, RemoteViews views, int layoutId) {
        // Set default state based on layout size
        if (layoutId == R.layout.meal_widget_small) {
            views.setTextViewText(R.id.mealTypeText, context.getString(R.string.widget_name));
            views.setTextViewText(R.id.dateText, context.getString(R.string.widget_no_data));
            views.setViewVisibility(R.id.locationText, View.GONE);
        } else if (layoutId == R.layout.meal_widget_medium) {
            views.setTextViewText(R.id.mealTypeText, context.getString(R.string.widget_name));
            views.setTextViewText(R.id.dateText, context.getString(R.string.widget_no_data));
            views.setViewVisibility(R.id.locationText, View.GONE);
            views.setViewVisibility(R.id.menuItemList, View.GONE);
            views.setViewVisibility(R.id.moreItemsText, View.GONE);
        } else {
            views.setTextViewText(R.id.mealTypeText, context.getString(R.string.widget_name));
            views.setTextViewText(R.id.dateText, context.getString(R.string.widget_no_data));
            views.setViewVisibility(R.id.locationText, View.GONE);
            views.setViewVisibility(R.id.menuItemList, View.GONE);
            views.setViewVisibility(R.id.noDataText, View.VISIBLE);
        }
    }

    private static void populateWidget(Context context, RemoteViews views, int layoutId, JSONObject data) throws JSONException {
        // Extract data
        String mealType = data.getString(WIDGET_MEAL_TYPE_KEY);
        String mealDate = data.getString(WIDGET_MEAL_DATE_KEY);
        String cityName = data.has(WIDGET_CITY_NAME_KEY) && !data.isNull(WIDGET_CITY_NAME_KEY) 
                           ? data.getString(WIDGET_CITY_NAME_KEY) : null;
        JSONArray items = data.getJSONArray(WIDGET_ITEMS_KEY);

        // Format meal type (BREAKFAST or DINNER)
        String displayMealType = "BREAKFAST".equals(mealType) 
            ? context.getString(R.string.widget_breakfast) 
            : context.getString(R.string.widget_dinner);
        
        // Format date
        String displayDate = formatDate(mealDate);

        // Set the text values
        views.setTextViewText(R.id.mealTypeText, displayMealType);
        views.setTextViewText(R.id.dateText, displayDate);
        
        // Set location text if available
        if (cityName != null && !cityName.isEmpty()) {
            views.setViewVisibility(R.id.locationText, View.VISIBLE);
            views.setTextViewText(R.id.locationText, cityName);
        } else {
            views.setViewVisibility(R.id.locationText, View.GONE);
        }

        // For medium and large layouts, setup the list view
        if (layoutId != R.layout.meal_widget_small && items.length() > 0) {
            if (layoutId == R.layout.meal_widget_medium) {
                setupMediumWidgetList(context, views, items);
            } else {
                setupLargeWidgetList(context, views, items);
            }
        }
    }

    private static void setupMediumWidgetList(Context context, RemoteViews views, JSONArray items) throws JSONException {
        // Set up list view with a limited number of items (3 max)
        int itemCount = Math.min(items.length(), 3);
        boolean hasMore = items.length() > 3;
        
        if (items.length() > 0) {
            // Set up the RemoteViews Service intent for the ListView
            Intent intent = new Intent(context, MealWidgetService.class);
            intent.putExtra("appWidgetId", 0); // We're not tracking individual widgets for now
            views.setRemoteAdapter(R.id.menuItemList, intent);
            
            // Set empty view
            views.setEmptyView(R.id.menuItemList, R.id.moreItemsText);
            
            // Make the list visible
            views.setViewVisibility(R.id.menuItemList, View.VISIBLE);
        } else {
            views.setViewVisibility(R.id.menuItemList, View.GONE);
        }
        
        // Hide the more items text if not needed
        views.setViewVisibility(R.id.moreItemsText, hasMore ? View.VISIBLE : View.GONE);
        
        if (hasMore) {
            views.setTextViewText(
                R.id.moreItemsText, 
                context.getString(R.string.widget_more_items, items.length() - 3)
            );
        }
    }

    private static void setupLargeWidgetList(Context context, RemoteViews views, JSONArray items) throws JSONException {
        if (items.length() > 0) {
            // Set up the RemoteViews Service intent for the ListView
            Intent intent = new Intent(context, MealWidgetService.class);
            intent.putExtra("appWidgetId", 0); // We're not tracking individual widgets for now
            views.setRemoteAdapter(R.id.menuItemList, intent);
            
            // Set empty view
            views.setEmptyView(R.id.menuItemList, R.id.noDataText);
            
            // Make the list and hide the no data text
            views.setViewVisibility(R.id.menuItemList, View.VISIBLE);
            views.setViewVisibility(R.id.noDataText, View.GONE);
        } else {
            // No items, show the no data text
            views.setViewVisibility(R.id.menuItemList, View.GONE);
            views.setViewVisibility(R.id.noDataText, View.VISIBLE);
        }
    }

    private static String formatDate(String dateStr) {
        try {
            // Parse from ISO format
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            Date date = inputFormat.parse(dateStr);
            
            // Format for display
            SimpleDateFormat outputFormat = new SimpleDateFormat("dd MMMM yyyy", new Locale("tr"));
            return outputFormat.format(date);
        } catch (Exception e) {
            e.printStackTrace();
            return dateStr;
        }
    }
} 