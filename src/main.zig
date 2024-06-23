const std = @import("std");
const jsc = @import("zig-jsc");

const fsdir = std.fs.cwd();

pub fn main() !void {
    const global_source = "const process = { env: { NODE_ENV: 'production' }}";
    const app_source = @embedFile("../dist/main.js");

    const context = jsc.createContext();
    const global = context.get_global_object();

    const clear_value = JSValue::callback(&context, Some(clear_timeout));
    const set_value = JSValue::callback(&context, Some(set_timeout));
    const renderfn_value = JSValue::callback(&context, Some(render_app));
    const log_value = JSValue::callback(&context, Some(console));
    const error_value = JSValue::callback(&context, Some(console));
    
    const console = JSObject::new(&context);
    console.set_property(&context, "log", log_value).unwrap();
    console.set_property(&context, "error", error_value).unwrap();

    global.set_property(&context, "console", console.to_jsvalue()).unwrap();
    global.set_property(&context, "clearTimeout", clear_value).unwrap();
    global.set_property(&context, "setTimeout", set_value).unwrap();
    global.set_property(&context, "renderApp", renderfn_value).unwrap();

    context.evaluate_script(&global_source, 1).expect("Cannot inject global code");

    let _ = context.evaluate_script(&app_source, 1)
        .inspect_err(|e| println!("> js Uncaught: {}", e.to_string(&context).unwrap()));

}

test "simple test" {
    var list = std.ArrayList(i32).init(std.testing.allocator);
    defer list.deinit(); // try commenting this out and see if zig detects the memory leak!
    try list.append(42);
    try std.testing.expectEqual(@as(i32, 42), list.pop());
}
