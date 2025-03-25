import WidgetKit
import SwiftUI
import Intents

// MARK: - Widget Provider

struct Provider: TimelineProvider {
    // Placeholder for preview in widget gallery
    func placeholder(in context: Context) -> MealEntry {
        MealEntry(date: Date(), mealType: "lunch", location: "Preview", menuItems: ["Örnek Yemek 1", "Örnek Yemek 2"], hasData: true)
    }

    // Widget gallery preview
    func getSnapshot(in context: Context, completion: @escaping (MealEntry) -> Void) {
        let entry = MealEntry(date: Date(), mealType: "lunch", location: "Preview", menuItems: ["Örnek Yemek 1", "Örnek Yemek 2"], hasData: true)
        completion(entry)
    }
    
    // Timeline for widget updates
    func getTimeline(in context: Context, completion: @escaping (Timeline<MealEntry>) -> Void) {
        // Get meal data from UserDefaults (shared with React Native)
        var entries: [MealEntry] = []
        let currentDate = Date()
        
        if let widgetData = UserDefaults(suiteName: "group.com.kykyemek.app")?.data(forKey: "kyk_yemek_widget_data") {
            do {
                if let json = try JSONSerialization.jsonObject(with: widgetData, options: []) as? [String: Any],
                   let meals = json["meals"] as? [String: Any] {
                    
                    // Determine which meal to show based on current time
                    let hour = Calendar.current.component(.hour, from: currentDate)
                    var mealKey = "lunch" // Default
                    
                    if hour >= 5 && hour < 10 {
                        mealKey = "breakfast"
                    } else if hour >= 10 && hour < 16 {
                        mealKey = "lunch"
                    } else {
                        mealKey = "dinner"
                    }
                    
                    if let selectedMeal = meals[mealKey] as? [String: Any],
                       let mealType = selectedMeal["mealType"] as? String,
                       let location = selectedMeal["location"] as? String,
                       let hasData = selectedMeal["hasData"] as? Bool,
                       let menu = selectedMeal["menu"] as? [String] {
                        
                        let entry = MealEntry(
                            date: currentDate,
                            mealType: mealType,
                            location: location,
                            menuItems: menu,
                            hasData: hasData
                        )
                        entries.append(entry)
                    }
                }
            } catch {
                print("Error parsing widget data: \(error)")
            }
        }
        
        // If no data was loaded, show a placeholder
        if entries.isEmpty {
            let entry = MealEntry(
                date: currentDate,
                mealType: "lunch",
                location: "Veri bulunamadı",
                menuItems: [],
                hasData: false
            )
            entries.append(entry)
        }
        
        // Update every 6 hours
        let nextUpdateDate = Calendar.current.date(byAdding: .hour, value: 6, to: currentDate)!
        let timeline = Timeline(entries: entries, policy: .after(nextUpdateDate))
        
        completion(timeline)
    }
}

// MARK: - Widget Entry

struct MealEntry: TimelineEntry {
    let date: Date
    let mealType: String
    let location: String
    let menuItems: [String]
    let hasData: Bool
}

// MARK: - Widget Views

struct MealWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        ZStack {
            Color(UIColor.systemBackground)
                .cornerRadius(16)
            
            switch family {
            case .systemSmall:
                SmallWidgetView(entry: entry)
            case .systemMedium:
                MediumWidgetView(entry: entry)
            case .systemLarge:
                LargeWidgetView(entry: entry)
            default:
                MediumWidgetView(entry: entry)
            }
        }
        .padding()
    }
}

struct SmallWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            // Header
            HStack {
                Text(getMealTypeText(entry.mealType))
                    .font(.headline)
                    .foregroundColor(.primary)
                Spacer()
                Text(formatDate(entry.date))
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Divider()
            
            // Location
            Text(entry.location)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(1)
            
            Spacer()
            
            // Menu Preview (just first item for small widget)
            if entry.hasData && !entry.menuItems.isEmpty {
                Text(entry.menuItems[0])
                    .font(.caption)
                    .foregroundColor(.primary)
                    .lineLimit(2)
            } else {
                Text("Menü bilgisi bulunamadı")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .italic()
            }
        }
        .padding(12)
    }
}

struct MediumWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Header
            HStack {
                Text(getMealTypeText(entry.mealType))
                    .font(.headline)
                    .foregroundColor(.primary)
                Spacer()
                Text(formatDate(entry.date))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // Location
            Text(entry.location)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(1)
            
            Divider()
            
            // Menu Items
            if entry.hasData && !entry.menuItems.isEmpty {
                ScrollView {
                    VStack(alignment: .leading, spacing: 4) {
                        ForEach(entry.menuItems.prefix(4), id: \.self) { item in
                            Text("• \(item)")
                                .font(.caption)
                                .foregroundColor(.primary)
                                .lineLimit(1)
                        }
                        
                        if entry.menuItems.count > 4 {
                            Text("+ \(entry.menuItems.count - 4) diğer...")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .italic()
                        }
                    }
                }
            } else {
                Text("Menü bilgisi bulunamadı")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .italic()
            }
        }
        .padding(12)
    }
}

struct LargeWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header
            HStack {
                Text(getMealTypeText(entry.mealType))
                    .font(.title2)
                    .foregroundColor(.primary)
                Spacer()
                Text(formatDate(entry.date))
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            // Location
            Text(entry.location)
                .font(.headline)
                .foregroundColor(.secondary)
                .lineLimit(1)
            
            Divider()
            
            // Menu Items
            if entry.hasData && !entry.menuItems.isEmpty {
                ScrollView {
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(entry.menuItems, id: \.self) { item in
                            Text("• \(item)")
                                .font(.body)
                                .foregroundColor(.primary)
                                .lineLimit(2)
                        }
                    }
                }
            } else {
                Text("Menü bilgisi bulunamadı")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .italic()
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
            }
        }
        .padding(16)
    }
}

// MARK: - Helper Functions

func getMealTypeText(_ type: String) -> String {
    switch type.lowercased() {
    case "breakfast":
        return "Kahvaltı"
    case "lunch":
        return "Öğle Yemeği"
    case "dinner":
        return "Akşam Yemeği"
    default:
        return "Yemek"
    }
}

func formatDate(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "dd.MM.yyyy"
    return formatter.string(from: date)
}

// MARK: - Widget Configuration

struct MealWidget: Widget {
    let kind: String = "MealWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            MealWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("KYK Yemek")
        .description("Günün yemek menüsünü görüntüleyin.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Widget Preview

struct MealWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            // Preview with data
            MealWidgetEntryView(entry: MealEntry(
                date: Date(),
                mealType: "lunch",
                location: "Ankara KYK",
                menuItems: ["Mercimek Çorbası", "Pirinç Pilavı", "Tavuk Sote", "Ayran", "Meyve"],
                hasData: true
            ))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            .previewDisplayName("Small")
            
            MealWidgetEntryView(entry: MealEntry(
                date: Date(),
                mealType: "lunch",
                location: "Ankara KYK",
                menuItems: ["Mercimek Çorbası", "Pirinç Pilavı", "Tavuk Sote", "Ayran", "Meyve"],
                hasData: true
            ))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
            .previewDisplayName("Medium")
            
            MealWidgetEntryView(entry: MealEntry(
                date: Date(),
                mealType: "lunch",
                location: "Ankara KYK",
                menuItems: ["Mercimek Çorbası", "Pirinç Pilavı", "Tavuk Sote", "Ayran", "Meyve"],
                hasData: true
            ))
            .previewContext(WidgetPreviewContext(family: .systemLarge))
            .previewDisplayName("Large")
            
            // Preview with no data
            MealWidgetEntryView(entry: MealEntry(
                date: Date(),
                mealType: "lunch",
                location: "Ankara KYK",
                menuItems: [],
                hasData: false
            ))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
            .previewDisplayName("No Data")
        }
    }
} 