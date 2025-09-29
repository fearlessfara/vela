package com.vela.velocity;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.StringReader;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

public class Runner {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static void main(String[] args) throws Exception {
        if (args.length < 1) {
            System.err.println("Usage: java -jar velocity-java-runner.jar <casesRoot>");
            System.exit(1);
        }
        Path casesRoot = Path.of(args[0]);
        File[] caseDirs = casesRoot.toFile().listFiles(File::isDirectory);
        if (caseDirs == null) caseDirs = new File[0];

        VelocityEngine engine = new VelocityEngine();
        engine.init();

        List<Map<String, Object>> results = new ArrayList<>();
        for (File dir : caseDirs) {
            Path templatePath = dir.toPath().resolve("template.vtl");
            Path contextPath = dir.toPath().resolve("context.json");
            if (!Files.exists(templatePath)) continue;

            String template = Files.readString(templatePath, StandardCharsets.UTF_8);
            Map<String, Object> context = new HashMap<>();
            if (Files.exists(contextPath)) {
                try (BufferedReader br = new BufferedReader(new FileReader(contextPath.toFile(), StandardCharsets.UTF_8))) {
                    context = MAPPER.readValue(br, new TypeReference<Map<String, Object>>() {});
                }
            }

            VelocityContext vctx = new VelocityContext();
            injectContext(vctx, context);

            StringWriter writer = new StringWriter();
            engine.evaluate(vctx, writer, dir.getName(), new StringReader(template));
            String output = writer.toString();

            Map<String, Object> record = new LinkedHashMap<>();
            record.put("name", dir.getName());
            record.put("output", output);
            results.add(record);
        }

        // Print JSON array of results to stdout
        System.out.println(MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(results));
    }

    private static void injectContext(VelocityContext vctx, Object value) {
        if (value instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) value;
            for (Map.Entry<?, ?> e : map.entrySet()) {
                String key = String.valueOf(e.getKey());
                Object v = convert(e.getValue());
                vctx.put(key, v);
            }
        }
    }

    private static Object convert(Object v) {
        if (v == null) return null;
        if (v instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) v;
            Map<String, Object> res = new HashMap<>();
            for (Map.Entry<?, ?> e : map.entrySet()) {
                res.put(String.valueOf(e.getKey()), convert(e.getValue()));
            }
            return res;
        }
        if (v instanceof List) {
            List<?> list = (List<?>) v;
            List<Object> res = new ArrayList<>();
            for (Object o : list) res.add(convert(o));
            return res;
        }
        return v;
    }
}
