import Foundation
import WidgetKit
import React

@objc(MealWidgetService)
class MealWidgetService: RCTEventEmitter {
    
    // We're not emitting any events from Swift to JS, just return an empty array
    override func supportedEvents() -> [String]! {
        return []
    }
    
    // Required because we extend RCTEventEmitter
    override func constantsToExport() -> [AnyHashable : Any]! {
        return [:]
    }
    
    // Required because we extend RCTEventEmitter
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    /**
     * Update the widget data
     */
    @objc(updateWidget:reject:)
    func updateWidget(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
                print("[MealWidgetService] Widget timelines reloaded")
                resolve(["success": true])
            } else {
                reject("ERROR", "Widgets are only available on iOS 14.0 and above", nil)
            }
        }
    }
    
    /**
     * Gets information about the installed widgets
     */
    @objc(getWidgetInfo:reject:)
    func getWidgetInfo(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.getCurrentConfigurations { result in
                    switch result {
                    case .success(let widgets):
                        resolve([
                            "count": widgets.count,
                            "widgets": widgets.map { ["kind": $0.kind] }
                        ])
                    case .failure(let error):
                        reject("ERROR", "Failed to get widget info: \(error.localizedDescription)", nil)
                    }
                }
            } else {
                reject("ERROR", "Widgets are only available on iOS 14.0 and above", nil)
            }
        }
    }
    
    /**
     * Force reload all widget timelines
     */
    @objc(reloadAllTimelines:reject:)
    func reloadAllTimelines(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
                print("[MealWidgetService] Widget timelines reloaded")
                resolve(["success": true])
            } else {
                reject("ERROR", "Widgets are only available on iOS 14.0 and above", nil)
            }
        }
    }
    
    /**
     * Save data to shared UserDefaults for widget access
     */
    @objc(saveSharedData:value:resolve:reject:)
    func saveSharedData(_ key: String, value: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let userDefaults = UserDefaults(suiteName: "group.com.kykyemek.app") else {
            reject("ERROR", "Failed to access shared UserDefaults", nil)
            return
        }
        
        // Convert JSON string to data
        if let data = value.data(using: .utf8) {
            userDefaults.set(data, forKey: key)
            userDefaults.synchronize()
            print("[MealWidgetService] Saved shared data for key: \(key)")
            resolve(["success": true])
        } else {
            reject("ERROR", "Failed to convert widget data to Data type", nil)
        }
    }
} 