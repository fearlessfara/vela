import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import java.io.StringWriter;
import java.util.Properties;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonElement;
import com.google.gson.JsonArray;
import com.google.gson.JsonPrimitive;

public class VelocityRunner {
    static {
        try {
            Properties p = new Properties();
            p.put("velocimacro.permissions.allow.inline.local.scope", "true");
            p.put("resource.loader", "string");
            p.put("string.resource.loader.class", "org.apache.velocity.runtime.resource.loader.StringResourceLoader");
            Velocity.init(p);
        } catch (Exception e) {
            System.err.println("Failed to init Velocity: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    public static void main(String[] args) {
        try {
            if (args.length < 2) {
                System.err.println("Usage: java VelocityRunner <template> <context_json>");
                System.exit(1);
            }
            
            String template = args[0];
            String contextJson = args[1];
            
            // Parse context JSON using Gson
            Gson gson = new Gson();
            JsonObject jsonObject = gson.fromJson(contextJson, JsonObject.class);
            
            // Create Velocity context
            VelocityContext velocityContext = new VelocityContext();
            for (Map.Entry<String, JsonElement> entry : jsonObject.entrySet()) {
                Object value = convertJsonElement(entry.getValue());
                velocityContext.put(entry.getKey(), value);
            }
            
            // Evaluate template
            StringWriter writer = new StringWriter();
            Velocity.evaluate(velocityContext, writer, "", template);
            
            // Output result
            System.out.print(writer.toString());
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
    
    private static Object convertJsonElement(JsonElement element) {
        if (element.isJsonPrimitive()) {
            JsonPrimitive primitive = element.getAsJsonPrimitive();
            if (primitive.isString()) {
                return primitive.getAsString();
            } else if (primitive.isNumber()) {
                Number num = primitive.getAsNumber();
                // Try to preserve integer vs double
                double d = num.doubleValue();
                if (d == Math.floor(d) && d >= Integer.MIN_VALUE && d <= Integer.MAX_VALUE) {
                    return num.intValue();
                }
                return d;
            } else if (primitive.isBoolean()) {
                return primitive.getAsBoolean();
            } else if (primitive.isJsonNull()) {
                return null;
            }
        } else if (element.isJsonArray()) {
            List<Object> list = new ArrayList<>();
            for (JsonElement e : element.getAsJsonArray()) {
                list.add(convertJsonElement(e));
            }
            return list;
        } else if (element.isJsonObject()) {
            Map<String, Object> map = new HashMap<>();
            for (Map.Entry<String, JsonElement> entry : element.getAsJsonObject().entrySet()) {
                map.put(entry.getKey(), convertJsonElement(entry.getValue()));
            }
            return map;
        }
        return null;
    }
}
