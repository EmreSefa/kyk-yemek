package com.kykyemek;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Service to provide a factory for RemoteViews objects used in widgets.
 * This handles creating the list items in medium and large widget layouts.
 */
public class MealWidgetService extends RemoteViewsService {
    private static final String TAG = "MealWidgetService";

    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new MealRemoteViewsFactory(this.getApplicationContext(), intent);
    }

    /**
     * Factory for widget list items.
     */
    class MealRemoteViewsFactory implements RemoteViewsService.RemoteViewsFactory {
        private Context context;
        private int appWidgetId;
        private List<String> menuItems = new ArrayList<>();
        private static final String PREFS_NAME = "com.kykyemek.MealWidget";
        private static final String WIDGET_DATA_KEY = "kyk_yemek_widget_data";
        private static final String WIDGET_ITEMS_KEY = "items";

        public MealRemoteViewsFactory(Context context, Intent intent) {
            this.context = context;
            this.appWidgetId = intent.getIntExtra(
                    "appWidgetId", 0);
        }

        @Override
        public void onCreate() {
            // Initialize the data
            loadMenuItems();
        }

        @Override
        public void onDataSetChanged() {
            // Refresh data when widget is updated
            loadMenuItems();
        }

        @Override
        public void onDestroy() {
            menuItems.clear();
        }

        @Override
        public int getCount() {
            return menuItems.size();
        }

        @Override
        public RemoteViews getViewAt(int position) {
            if (position < 0 || position >= menuItems.size()) {
                return null;
            }

            // Create a view for the menu item
            RemoteViews rv = new RemoteViews(context.getPackageName(), 
                    R.layout.meal_widget_menu_item);
            
            // Set the text for the menu item
            rv.setTextViewText(R.id.menuItemText, menuItems.get(position));

            // Return the remote views object
            return rv;
        }

        @Override
        public RemoteViews getLoadingView() {
            // You can create a custom loading view, or return null to use default
            return null;
        }

        @Override
        public int getViewTypeCount() {
            return 1; // We only have one type of view
        }

        @Override
        public long getItemId(int position) {
            return position;
        }

        @Override
        public boolean hasStableIds() {
            return true;
        }

        /**
         * Load the menu items from SharedPreferences
         */
        private void loadMenuItems() {
            menuItems.clear();
            
            try {
                // Get widget data from SharedPreferences
                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                String widgetDataJson = prefs.getString(WIDGET_DATA_KEY, null);
                
                if (widgetDataJson != null) {
                    // Parse JSON data
                    JSONObject data = new JSONObject(widgetDataJson);
                    JSONArray items = data.getJSONArray(WIDGET_ITEMS_KEY);
                    
                    // Add items to the list
                    for (int i = 0; i < items.length(); i++) {
                        menuItems.add(items.getString(i));
                    }
                    
                    Log.d(TAG, "Loaded " + menuItems.size() + " menu items");
                } else {
                    Log.d(TAG, "No widget data found in SharedPreferences");
                }
            } catch (JSONException e) {
                Log.e(TAG, "Error parsing widget data: " + e.getMessage());
            }
        }
    }
} 